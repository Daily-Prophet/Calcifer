import asyncio

from dotenv import load_dotenv, find_dotenv
from typing import AsyncIterable, Awaitable, List, Dict, Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chat_models import AzureChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.chains import RetrievalQA
from langchain.schema import HumanMessage, SystemMessage, AIMessage

load_dotenv(find_dotenv())

# in case of cycle response bug, we limit the response token count
MAX_RESPONSE_TOKEN_COUNT = 10000

# -------------QA Chain vector & prompt loading------------------
# load the exist local vectorstore
persist_directory = "./chroma_use_first_header/"
embeddings = OpenAIEmbeddings(deployment="embedding", chunk_size=16)
local_vectordb = Chroma(
    embedding_function=embeddings, persist_directory=persist_directory
)


# build the prompt template
customized_system_message = """Your name is Calcifer, you are an expert of Microsoft Teams Attendance Report product support team,
your mission is to answer user' question according to the problem description and context information provided by user.
You are good at patiently guiding user to provide clear and specific information you need to solve their problems. Any answer you give is very clear and specific and cannot be vague.
Your answer is always concise and to the point, no more than 1000 words.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
"""

first_user_template_string = """
Perform the following tasks to resolve user problem description:
1 - Your answer is always concise and to the point, no more than 1000 words.
2 - Do not mention in your answers that your answers are based on the contextual information provided, but rather state them as objective facts.
3 - If it's due to other service's error please also tell the user to transfer to the most possible team. 
4 - Don't mention the Microsoft Teams support team in your answer.
5 - Output your final solution in the following format. 
6 - Every item in the following format is not necessary, you can choose the item you think is appropriate to answer.
7 - Output user problem description summary only if the user's problem description is more than one sentence.
8 - If your answer involves multiple processing steps, please list them in order.
9 - Provide transferable team only if you know clearly that there is a team that can transfer, otherwise just output N/A.
10 - Output Next item only if you think that the information provided by user at present is insufficient, please ask users to provide further specific supplementary information with clear and definite questions and try to answer user's question again.


Your answer's format:

Based on the information we have so far, my answer is as follows:
Possible Reason:<your answers to user question>
Transferable team:<N/A or the transferable team you can think of>
Next:<Ask the customer for more information if necessary>

The following part is user problem description, and the context information in markdown format enclosed by three backticks:
user problem description: {question}
context information: ```{context}```
"""
prompt_template = ChatPromptTemplate.from_template(first_user_template_string)
# ------------------------------------------------------------------


async def wait_done(fn: Awaitable, event: asyncio.Event):
    try:
        await fn
    except Exception as e:
        print(e)
        event.set()
    finally:
        event.set()


def convert_to_chat_messages(
    data: List[Dict[str, str]]
) -> List[Union[HumanMessage, AIMessage]]:
    chat_messages = [SystemMessage(content=customized_system_message)]
    for item in data:
        if item["role"] == "user":
            chat_messages.append(HumanMessage(content=item["content"]))
        elif item["role"] == "assistant":
            chat_messages.append(AIMessage(content=item["content"]))
    return chat_messages


async def call_openai(messages: List[Dict[str, str]]) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    chat_model = AzureChatOpenAI(
        deployment_name="gpt35-16k",
        streaming=True,
        verbose=True,
        callbacks=[callback],
        temperature=0,
        # max_tokens=MAX_RESPONSE_TOKEN_COUNT,
    )
    # qa_chain = RetrievalQA.from_chain_type(
    #     chat_model,
    #     retriever=local_vectordb.as_retriever(
    #         search_type="similarity", search_kwargs={"k": 5}
    #     ),
    #     return_source_documents=True,
    #     chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
    # )
    # coroutine = wait_done(
    #     qa_chain.arun(question), callback.done
    # )

    res_docs = local_vectordb.similarity_search(messages[0]["content"], k=4)
    context = "\n".join([doc.page_content for doc in res_docs])
    customer_user_message = prompt_template.format_messages(
        context=context, question=messages[0]["content"]
    )
    print("Prompt:\n", customer_user_message[0].content)
    messages[0]["content"] = customer_user_message[0].content
    chat_messages = convert_to_chat_messages(messages)
    coroutine = wait_done(chat_model.agenerate(messages=[chat_messages]), callback.done)
    task = asyncio.create_task(coroutine)

    token_count = 0
    async for token in callback.aiter():
        token_count += 1
        print("token", token_count, token)
        # if token_count > MAX_RESPONSE_TOKEN_COUNT:
        #     callback.done.set()
        #     break
        yield f"{token}"

    await task


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "deploy success~"}


@app.post("/ask")
async def ask(body: dict):
    print("body.messages", body["messages"])
    return StreamingResponse(
        call_openai(body["messages"]), media_type="text/event-stream"
    )


# Mount static files. But if we host statics with Github Pages, we don't need fastAPI host for us again
# app.mount("/", StaticFiles(directory="../docs", html=True), name="ui")


# we can use this command to run the server, if you want to auto reload serivce when develop, add --reload
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
