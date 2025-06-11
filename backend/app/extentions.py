from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO


db = SQLAlchemy()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*",
                    async_mode='eventlet',
                    allow_headers=["Authorization"],
                    path="/api/socket.io")



