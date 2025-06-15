from flask_socketio import emit, join_room, leave_room

from app.extentions import socketio


@socketio.on("join_chat_room")
def connect_to_chat_room(chat_id):
    if isinstance(chat_id, int):
        join_room(f"chat_{chat_id}")


@socketio.on("join_user_room")
def connect_to_user_room(user_id):
    if isinstance(user_id, int):
        join_room(f"user_{user_id}")


@socketio.on("leave")
def leave_from_chat(chat_id):
    if isinstance(chat_id, int):
        leave_room(f"chat_{chat_id}")


@socketio.on("chat")
def chat_handle(chat_id):
    if isinstance(chat_id, int):
        emit("chat", chat_id, to=f"chat_{chat_id}")


@socketio.on("new_chat_room")
def new_room(chat_id, user_id):
    if isinstance(chat_id, int):
        join_room(f"chat_{chat_id}")
        emit("chat", chat_id, to=f"user_{user_id}")
