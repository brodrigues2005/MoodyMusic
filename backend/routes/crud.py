from database.connection import get_db_connection
import mysql.connector
from fastapi import HTTPException
from fastapi.responses import FileResponse
import os


def upload_song(data,file, uid):
    song_name = data["song_name"]
    emotion = data["emotion"]
    
    filename = file.filename

    uploads_folder = "uploads"

    os.makedirs(uploads_folder, exist_ok=True)

    file_path = f"{uploads_folder}/{filename}"

    with open(file_path, "wb") as buffer:

        buffer.write(file.file.read())

    conn = get_db_connection()

    cursor = conn.cursor()

    try:

        cursor.execute(

            """

            INSERT INTO songs(song_name, emotion, file_path)

            VALUES (%s, %s, %s)

            """,

            (song_name, emotion, file_path)

        )

        sid = cursor.lastrowid

        cursor.execute(

            """

            INSERT INTO uploads(uid, sid)

            VALUES (%s, %s)

            """,

            (uid, sid)

        )

        conn.commit()

        return {

            "success": True,

            "message": "Song uploaded successfully"

        }

    except Exception as err:

        return {

            "success": False,

            "message": str(err)

        }

    finally:

        cursor.close()

        conn.close()


def get_songs (uid):


    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """

        SELECT S.sid,S.song_name,S.emotion
        FROM songs S
        Join uploads U on S.sid = U.sid
        Where U.uid = %s
    
    """
    try:

        cursor.execute(query, (uid,))

        songs = cursor.fetchall()

        for song in songs:

            song["file_url"] = f"/songs/{song['sid']}/file"

        return {

            "success": True,

            "songs": songs

        }
    except mysql.connector.Error as err:

        return {

            "success": False,

            "message": str(err)

        }
    finally:

        cursor.close()

        conn.close()


def get_song_file(sid, uid):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    query = """

        SELECT S.file_path

        FROM songs S

        JOIN uploads U ON S.sid = U.sid

        WHERE S.sid = %s AND U.uid = %s

    """

    try:

        cursor.execute(query, (sid, uid))

        song = cursor.fetchone()

        if song is None:

            raise HTTPException(status_code=404, detail="Song not found")

        file_path = song["file_path"]

        if not os.path.exists(file_path):

            raise HTTPException(status_code=404, detail="File missing from server")

        return FileResponse(

            path=file_path,

            media_type="audio/mpeg",

            filename=os.path.basename(file_path)

        )

    finally:

        cursor.close()

        conn.close()