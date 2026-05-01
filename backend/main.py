from fastapi import FastAPI, Request, UploadFile
from routes.authentication import registration, authenticate, verify_jwt
from routes.crud import upload_song, get_songs, get_song_file

app = FastAPI()

@app.post("/registration")
async def register(request:Request):
    data = await request.json()
    return registration(data)


@app.post("/login")
async def login(request:Request):
    data = await request.json()
    return authenticate(data)

from fastapi import Request, UploadFile, File, Form

@app.post("/upload")
async def upload(
    request: Request,
    song_name: str = Form(),
    emotion: str = Form(),
    file: UploadFile = File()
):

    auth = verify_jwt(request)

    auth = verify_jwt(request)
    uid = auth["uid"]

    data = {
        "song_name": song_name,
        "emotion": emotion
    }

    return upload_song(data, file, uid)

@app.get("/songs")

async def songs_route(request: Request):

    auth = verify_jwt(request)

    uid = auth["uid"]

    return get_songs(uid)

@app.get("/songs/{sid}/file")

async def song_file_route(sid: int, request: Request):

    auth = verify_jwt(request)

    uid = auth["uid"]

    return get_song_file(sid, uid)