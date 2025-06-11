from flask import Blueprint, jsonify, request, current_app
from app.models import User, Chat, Message
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_socketio import emit
import os

from app.config import Config


chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/")
@jwt_required()
def create_chat():
    chat_name = request.json.get("name", "")
    private = request.json.get("private", "")
    ctype = request.json.get("type", "")
    uid = request.json.get("uid", "")

    if ctype == "group" and not chat_name:
        return jsonify(ok=False)

    user = User.get(get_jwt_identity())

    if ctype == "group":
        chat = Chat(name=chat_name, type="group", private=bool(private)).save()
        user.add_to_chat(chat)
        return jsonify(ok=True, cid=chat.id)

    elif ctype == "user":

        user2 = User.get(uid)

        if not user2:
            return jsonify(ok=False)

        chat = Chat.find_chat_with_users([user.id, uid])

        if not chat:
            if user2.id == user.id:
                return jsonify(ok=False, error="Нельзя написать самому себе!"), 400

            chat = Chat(type="user", private=True).save()
            user.add_to_chat(chat)
            user2.add_to_chat(chat)

        return jsonify(ok=True, cid=chat.id, users=[user.id for user in chat.users])


@chat_bp.post('/avatar')
@jwt_required()
def upload_avatar():
    chat = Chat.get(request.args.get("id"))

    if not chat:
        return {}, 404


    if "avatar" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files.get("avatar")


    if file.filename == "" or len(file.filename.split(".")) < 2:
        return {"error": "No selected file"}, 400

    ext = file.filename.split(".")[-1]

    if file and ext in Config.ALLOWED_EXTENSIONS:
        if chat.avatar:
            old_path = os.path.join(current_app.config["UPLOAD_FOLDER"], chat.avatar)
            if os.path.exists(old_path):
                os.remove(old_path)

        unique_filename = f"g{chat.id}.{ext}"
        save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)
        file.save(save_path)

        chat.update_avatar(unique_filename)

        return {"avatar": chat.avatar_url}, 200

    return {"error": "Invalid file type"}, 400


@chat_bp.get("/")
@jwt_required()
def index():
    user = User.get(get_jwt_identity())
    chat = Chat.get(request.args.get("id"))

    if not chat:
        return jsonify(ok=False)

    return jsonify(chat=chat.to_dict(user.id),
                   users=[user.to_dict() for user in chat.users],
                   member=user in chat.users)


@chat_bp.post("/add")
@jwt_required()
def add_user():

    user = User.query.filter_by(username=request.json.get("username")).first()
    chat = Chat.get(request.json.get("cid"))

    if not user or not chat:
        return jsonify(ok=False, id=1)

    if user in chat.users:
        return jsonify(ok=False)

    user.add_to_chat(chat)
    Message(user_id=1, chat_id=chat.id, content=f"Пользователь {user.username} присоединился!").save()

    emit("message", chat.id, broadcast=True, room=f"chat_{chat.id}", namespace="/")

    return jsonify(uid=user.id)

@chat_bp.post("/join")
@jwt_required()
def join():

    user = User.get(get_jwt_identity())
    chat = Chat.get(request.json.get("cid"))


    if not user or not chat:
        return jsonify(ok=False, id=1)

    if user in chat.users:
        return jsonify(ok=False)

    user.add_to_chat(chat)
    Message(user_id=1, chat_id=chat.id, content=f"Пользователь {user.username} присоединился!").save()

    emit("message", chat.id, broadcast=True, room=f"chat_{chat.id}", namespace="/")

    return jsonify(uid=user.id)


@chat_bp.get("search")
@jwt_required()
def search_chat():
    chat_name = request.args.get("query", "")
    user = User.get(get_jwt_identity())
    if not chat_name:
        return jsonify(result=[])

    chats = Chat.query.filter(Chat.name.ilike(f"%{chat_name}%")).all()
    result = [chat.to_dict() | {"member": user in chat.users} for chat in chats if not chat.private]

    return result


@chat_bp.post("/remove")
@jwt_required()
def remove():
    user = User.get(get_jwt_identity())
    user2 = User.get(request.json.get("uid"))
    chat = Chat.get(request.json.get("cid"))

    if not user or not chat:
        return jsonify(ok=False)

    if user2 not in chat.users:
        return jsonify(ok=False)

    if chat.admin.id == user.id:
        chat.del_from_chat(user2)
        Message(user_id=1, chat_id=chat.id, content=f"Пользователь {user2.username} был удален!").save()
        emit("message", chat.id, broadcast=True, room=f"chat_{chat.id}", namespace="/")

        return [user.to_dict() for user in chat.users]


@chat_bp.post("/leave")
@jwt_required()
def leave():

    user = User.get(get_jwt_identity())
    chat = Chat.get(request.json.get("cid"))

    if not user or not chat:
        return jsonify(ok=False)

    if user not in chat.users:
        return jsonify(ok=False)

    chat.del_from_chat(user)

    Message(user_id=1, chat_id=chat.id, content=f"Пользователь {user.username} вышел(").save()

    emit("message", chat.id, broadcast=True, room=f"chat_{chat.id}", namespace="/")

    return jsonify(chats=[chat.to_dict(user.id)
                           for chat in user.chats])

