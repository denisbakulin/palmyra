from flask import Blueprint, jsonify, request
from app.models import User, Chat, Message
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_socketio import emit
import os

from app.config import Config


chat_bp = Blueprint("chat", __name__)


@chat_bp.get("/")
@jwt_required()
def index():
    user = User.get(get_jwt_identity())
    chat = Chat.get(request.args.get("chat_id"))

    if not chat:
        return jsonify(ok=False)

    return jsonify(
        chat=chat.to_dict(user.id),
        users=[user.to_dict() for user in chat.users],
        member=user in chat.users,
    )


@chat_bp.post("/")
@jwt_required()
def create_chat():
    chat_name = request.json.get("name", "")
    private = request.json.get("private", False)
    user = User.get(get_jwt_identity())

    if not chat_name or not isinstance(private, bool) or not user:
        return jsonify(ok=False)

    chat = Chat(name=chat_name, type="group", private=private).save()
    user.add_to_chat(chat)


    emit("new_chat_room",
         {"chat_id": chat.id, "user_id": user.id},
         to=f"user_{user.id}", namespace="/")

    return jsonify(ok=True, chat_id=chat.id)


@chat_bp.post("/user")
@jwt_required()
def create_user_chat():
    user = User.get(get_jwt_identity())
    sec_user = User.get(request.json.get("user_id"))
    chat = Chat.find_chat_with_users([user.id, sec_user.id])
    print(user, sec_user, chat)
    if not sec_user or not user:
        return jsonify(ok=False)

    if not chat:
        if sec_user.id == user.id:
            return jsonify(ok=False, error="Нельзя написать самому себе!"), 400

        chat = Chat(type="user", private=True).save()
        user.add_to_chat(chat)
        sec_user.add_to_chat(chat)

        for user in (user, sec_user):
            emit("new_chat_room",
                 {"chat_id": chat.id, "user_id": user.id},
                 to=f"user_{user.id}", namespace="/")


    return jsonify(ok=True, chat_id=chat.id)


@chat_bp.post("/avatar")
@jwt_required()
def upload_avatar():
    user = User.get(get_jwt_identity())
    chat = Chat.get(request.args.get("id"))

    if not chat or user not in chat.users:
        return {}, 404

    if "avatar" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files.get("avatar")

    if file.filename == "" or len(file.filename.split(".")) < 2:
        return {"error": "No selected file"}, 400

    ext = file.filename.split(".")[-1]

    if file and ext in Config.ALLOWED_EXTENSIONS:
        if chat.avatar:
            old_path = os.path.join("/static", "avatars", "chats", chat.avatar)
            if os.path.exists(old_path):
                os.remove(old_path)

        unique_filename = f"{chat.id}.{ext}"
        save_path = os.path.join("/static", "avatars", "chats", unique_filename)
        file.save(save_path)

        chat.update_avatar(unique_filename)

        return {"avatar": chat.avatar_url}, 200

    return {"error": "Invalid file type"}, 400


@chat_bp.post("/add")
@jwt_required()
def add_user():

    user = User.query.filter_by(username=request.json.get("username")).first()
    chat = Chat.get(request.json.get("cid"))

    if not user or not chat.users:
        return jsonify(ok=False)

    if user in chat.users:
        return jsonify(ok=False)

    user.add_to_chat(chat)
    Message(
        user_id=1,
        chat_id=chat.id,
        content=f"Пользователь {user.username} присоединился!",
    ).save()

    emit("message", chat.id, to=f"chat_{chat.id}", namespace="/")
    emit("add_room", {"chat_id": chat.id}, to=f"user_{user.id}", namespace="/")
    emit("chat", chat.id, to=f"chat_{chat.id}", namespace="/")

    return jsonify(uid=user.id, users=[user.to_dict() for user in chat.users])


from functools import reduce

@chat_bp.post("/join")
@jwt_required()
def join():

    user = User.get(get_jwt_identity())
    chat = Chat.get(request.json.get("chat_id"))

    if not chat or not user or user in chat.users:
        return jsonify(ok=False)

    if user in chat.users:
        return jsonify(ok=False)

    user.add_to_chat(chat)
    Message(
        user_id=1,
        chat_id=chat.id,
        content=f"Пользователь {user.username} присоединился!",
    ).save()

    emit("new_chat_room", {"chat_id": chat.id}, to=f"user_{user.id}", namespace="/")
    emit("message", chat.id, to=f"chat_{chat.id}", namespace="/")

    return jsonify(uid=user.id)


@chat_bp.get("/search")
@jwt_required()
def search_chat():
    chat_name = request.args.get("query", "")
    user = User.get(get_jwt_identity())
    if not chat_name:
        return jsonify(result=[])

    chats = Chat.query.filter(Chat.name.ilike(f"%{chat_name}%")).all()
    result = [
        chat.to_dict() | {"member": user in chat.users}
        for chat in chats
        if not chat.private
    ]

    return result


@chat_bp.post("/remove")
@jwt_required()
def remove():
    user = User.get(get_jwt_identity())
    user2 = User.get(request.json.get("uid"))
    chat = Chat.get(request.json.get("cid"))

    if not user or not chat.users:
        return jsonify(ok=False)

    if user2 not in chat.users:
        return jsonify(ok=False)

    if chat.admin.id == user.id:
        chat.del_from_chat(user2)
        Message(
            user_id=1,
            chat_id=chat.id,
            content=f"Пользователь {user2.username} был удален!",
        ).save()

        emit("remove_from_chat_room", chat.id, to=f"user_{user2.id}", namespace="/")
        emit("chat", chat.id, to=f"chat_{chat.id}", namespace="/" )
        emit("message", chat.id, to=f"chat_{chat.id}", namespace="/")

        return [user.to_dict() for user in chat.users]
    return {}


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

    Message(
        user_id=1, chat_id=chat.id, content=f"Пользователь {user.username} вышел("
    ).save()

    emit("message", chat.id, broadcast=True, to=f"chat_{chat.id}", namespace="/")

    return jsonify(chats=[chat.to_dict(user.id) for chat in user.chats])
