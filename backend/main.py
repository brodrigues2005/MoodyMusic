from fastapi import FastAPI, Request
from routes.authentication import registration, authenticate

app = FastAPI()

@app.post("/registration")
async def register(request:Request):
    data = await request.json()
    return registration(data)


@app.post("/login")
async def login(request:Request):
    data = await request.json()
    return authenticate(data)