from flask import Blueprint, request, jsonify
from app.models import User, Message, Chat
from flask_jwt_extended import jwt_required, get_jwt_identity


message_bp = Blueprint("message", __name__)


@message_bp.get("/")
@jwt_required()
def get_messages():
    offset = request.args.get("offset", default=0, type=int)
    count = request.args.get("count", default=1, type=int)

    user = User.get(get_jwt_identity())
    chat = Chat.get(request.args.get("chat_id"))

    if not chat or not (chat in user.chats):
        return jsonify(messages=[])

    messages = chat.messages.order_by(Message.msg_id.desc()).offset(offset).limit(count).all()
    end = len(messages) != count

    return jsonify(
                    messages=[{
                        "message": message.to_dict(),
                        "user": message.user.to_dict()}
                        for message in messages],
                    end=end
                   )

@message_bp.post("/")
@jwt_required()
def create_message():

    content = request.json.get("content", "").strip()
    chat = Chat.get(request.json.get("chat_id"))

    if not content or not chat:
        return jsonify(status=False)

    user = User.get(get_jwt_identity())

    if chat not in user.chats:
        return jsonify({"status": False})

    Message(user_id=user.id, chat_id=chat.id, content=content).save()

    return jsonify(status=True)

