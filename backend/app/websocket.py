from app.extentions import socketio
from flask_socketio import emit, join_room, leave_room


@socketio.on('send_message')
def handle_message(room):
    if isinstance(room, int):
        emit('message', room, broadcast=True, room=f"chat_{room}")


@socketio.on('leave')
def leave(room):
    leave_room(f"chat_{room}")


@socketio.on("join_to_room")
def connect_to_group(room):
    if isinstance(room, int):
        join_room(f"chat_{room}")



@socketio.on("user")
def user(uid):
    if isinstance(uid, int):
        join_room(f"user_{uid}")

@socketio.on("connect")
def connect():
    emit("status", True)


@socketio.on("chat")
def add(uid):
    emit("chat", room=f"user_{uid}")

@socketio.on("rem")
def rem(uid, cid):
    emit("rem", cid, room=f"user_{uid}")

