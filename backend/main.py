import asyncio
import uvicorn

from dotenv import load_dotenv, find_dotenv
from typing import AsyncIterable, Awaitable
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chat_models import AzureChatOpenAI
from langchain.schema import HumanMessage
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import ChatPromptTemplate
import openai
import os

# load_dotenv()
load_dotenv(find_dotenv())

openai.api_base = os.environ["OPENAI_API_BASE"]
openai.api_version = os.environ["OPENAI_API_VERSION"]
openai.api_key = os.environ["OPENAI_API_KEY"]
openai.api_type = os.environ["OPENAI_API_TYPE"]

embeddings = OpenAIEmbeddings(deployment="embedding", chunk_size=16)


# in case of cycle response bug, we limit the response token count
MAX_RESPONSE_TOKEN_COUNT = 3000

# -------------QA Chain vector & prompt loading------------------
# load the exist local vectorstore
persist_directory = "./chroma/"
embeddings = OpenAIEmbeddings(deployment="embedding", chunk_size=16)
local_vectordb = Chroma(
    embedding_function=embeddings, persist_directory=persist_directory
)


# build the prompt template
template_string = """Use the following pieces of context to answer the question at the end. \
If you don't know the answer, just say that you don't know, don't try to make up an answer. \
Always say "thanks for asking!" at the end of the answer. 
Context: {context}
Question: {question}
Helpful Answer:"""
prompt_template = ChatPromptTemplate.from_template(template_string)
# ------------------------------------------------------------------


async def wait_done(fn: Awaitable, event: asyncio.Event):
    try:
        await fn
    except Exception as e:
        print(e)
        event.set()
    finally:
        event.set()


async def call_openai(question: str) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    chat_model = AzureChatOpenAI(
        deployment_name="gpt35-16k",
        streaming=True,
        verbose=True,
        callbacks=[callback],
        temperature=0,
        max_tokens=MAX_RESPONSE_TOKEN_COUNT,
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
    res_docs = local_vectordb.similarity_search(question)
    context = "\n".join([doc.page_content for doc in res_docs])
    customer_messages = prompt_template.format_messages(
        context=context, question=question
    )
    print(customer_messages[0].content)
    coroutine = wait_done(
        chat_model.agenerate(messages=[[customer_messages[0]]]), callback.done
    )
    task = asyncio.create_task(coroutine)

    token_count = 0
    async for token in callback.aiter():
        token_count += 1
        print("token", token, token_count)
        if token_count > MAX_RESPONSE_TOKEN_COUNT:
            callback.done.set()
            break
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
    return {"message": "Hello World"}


@app.post("/ask")
async def ask(body: dict):
    print("body.question", body["question"])
    return StreamingResponse(
        call_openai(body["question"]), media_type="text/event-stream"
    )


# Mount static files. But if we host statics with Github Pages, we don't need fastAPI host for us again
# app.mount("/", StaticFiles(directory="../docs", html=True), name="ui")


# we can use this command to run the server, if you want to auto reload serivce when develop, add --reload
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload

