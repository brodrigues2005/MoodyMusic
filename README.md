
# Moody Music

Moody Music is a full-stack web application that uses facial expression detection to play songs based on the user's current emotion.

Users can register, log in, upload songs, tag them with emotions, manage their song collection, and use the music player to automatically play music matching their detected mood.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- MediaPipe Tasks Vision
- CSS

### Backend
- FastAPI
- MySQL
- JWT authentication
- bcrypt password hashing
- Python

## Features

- User registration and login
- JWT-protected routes
- Upload songs with name, emotion, and audio file
- View uploaded songs
- Delete songs
- Preview uploaded songs
- Webcam-based facial expression detection
- Emotion-based music playback

## Setup Instructions

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd MoodyMusic
```

## Backend Setup

Navigate to the backend folder and Install the required Python packages:

```bash
cd backend
pip install fastapi uvicorn bcrypt PyJWT python-dotenv mysql-connector-python python-multipart
```

Create a .env file in the backend folder:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key

Make sure MySQL is running and your database/tables are created, using the query located in backend/database.

Run the FastAPI backend:
uvicorn main:app --reload

The backend should run at:
http://127.0.0.1:8000
