from database.connection import get_db_connection
import bcrypt
import mysql.connector
import jwt
import datetime
import os

from dotenv import load_dotenv

load_dotenv()


def hash_password(password):

    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(password_bytes, salt)

    return hashed.decode("utf-8")

def registration(data):
    name = data["name"]
    email = data["email"]
    password = data["password"]

    hashed_password = hash_password(password)



    conn = get_db_connection()
    cursor = conn.cursor()

    query = """

        INSERT INTO users(name, email, hashed_password)

        VALUES (%s, %s, %s)

    """

    try:

        cursor.execute(query, (name, email, hashed_password))

        conn.commit()

        return {

            "success": True,

            "message": "User registered successfully"

        }

    except mysql.connector.Error as err:

        if err.errno == 1062:

            return {

                "success": False,

                "message": "Email already exists"

            }

        return {

            "success": False,

            "message": str(err)

        }

    finally:

        cursor.close()

        conn.close()


def create_jwt(uid):
    payload = {
        "uid": uid,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }

    token = jwt.encode(
        payload,
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return token

def authenticate(data):
    entered_email = data["email"]
    entered_password = data["password"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT uid, email, hashed_password
        FROM users
        WHERE email = %s
    """

    try:
        cursor.execute(query, (entered_email,))
        user = cursor.fetchone()

        if user is None:
            return {
                "success": False,
                "message": "Invalid email or password"
            }

        stored_hash = user["hashed_password"]

        password_matches = bcrypt.checkpw(
            entered_password.encode("utf-8"),
            stored_hash.encode("utf-8")
        )

        if not password_matches:
            return {
                "success": False,
                "message": "Invalid email or password"
            }

        token = create_jwt(user["uid"])

        return {
            "success": True,
            "message": "Login successful",
            "token": token
        }

    except mysql.connector.Error as err:
        return {
            "success": False,
            "message": str(err)
        }

    finally:
        cursor.close()
        conn.close()