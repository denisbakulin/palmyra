from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extentions import db, jwt, socketio


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.message import message_bp
    from app.routes.chat import chat_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(chat_bp, url_prefix="/chat")
    app.register_blueprint(message_bp, url_prefix="/msg")

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)

    from . import websocket

    with app.app_context():
        db.create_all()

    return app
