import asyncio
import uvicorn

from dotenv import load_dotenv
from typing import AsyncIterable, Awaitable
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chat_models import AzureChatOpenAI
from langchain.schema import HumanMessage

load_dotenv()

MAX_RESPONSE_TOKEN_COUNT = 3000


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
    model = AzureChatOpenAI(
        deployment_name="gpt35-16k",
        streaming=True,
        verbose=True,
        callbacks=[callback],
        temperature=0,
    )

    coroutine = wait_done(
        model.agenerate(messages=[[HumanMessage(content=question)]]), callback.done
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


@app.post("/ask")
async def ask(body: dict):
    print("body.question", body["question"])
    return StreamingResponse(
        call_openai(body["question"]), media_type="text/event-stream"
    )


# Mount static files. But if we host statics with Github Pages, we don't need fastAPI host for us again
# app.mount("/", StaticFiles(directory="../docs", html=True), name="ui")

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", port=8000, app=app)
