from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SERVER_URL = "http://127.0.0.1:5000"

    BASE_DIR = Path(__file__).parent.parent
    UPLOAD_FOLDER = BASE_DIR / 'app' / 'static' / 'avatars'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(weeks=4)

    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True


    SECRET_KEY = os.getenv("SECRET_KEY")
    WTF_CSRF_ENABLED = False