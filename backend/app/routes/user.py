from flask import Blueprint, jsonify, request, current_app
from app.models import User
from flask_jwt_extended import jwt_required, get_jwt_identity


import os
from app.config import Config

user_bp = Blueprint("user", __name__)


@user_bp.post('/avatar')
@jwt_required()
def upload_avatar():
    user = User.get(get_jwt_identity())

    if "avatar" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files["avatar"]

    if file.filename == "" or len(file.filename.split(".")) < 2:
        return {"error": "No selected file"}, 400

    ext = file.filename.split(".")[-1]

    if ext in Config.ALLOWED_EXTENSIONS:
        if user.avatar:
            old_path = os.path.join(current_app.config["UPLOAD_FOLDER"], user.avatar)
            if os.path.exists(old_path):
                os.remove(old_path)

        unique_filename = f"u{user.id}.{ext}"
        save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)

        file.save(save_path)
        user.update_avatar(unique_filename)

        return jsonify(avatar=user.avatar_url), 200

    return {"error": "Invalid file type"}, 400


@user_bp.get("/")
@jwt_required()
def index():
    user = User.get(get_jwt_identity())

    if not user:
        return {}

    return jsonify(**user.to_dict(),
                   chats=[chat.to_dict(user.id) for chat in user.chats])


@user_bp.get("search")
@jwt_required()
def search_user():
    username = request.args.get("query", "")

    if not username:
        return jsonify(results=[])

    me = User.get(get_jwt_identity())
    users = User.query.filter(User.username.ilike(f"%{username}%")).all()
    result = [user.to_dict() for user in users if user.id != me.id]

    return result


@user_bp.get("/<int:user_id>")
@jwt_required()
def get_user_by_id(user_id):
    user = User.get(user_id)

    if not user:
        return {}

    return jsonify(user=user.to_dict())

@user_bp.post("edit/username")
@jwt_required()
def edit_username():
    username = str(request.json.get("username", ""))
    if len(username) < 3:
        return jsonify(error="Длина имени должна быть не менее 4 символов"), 400

    if User.query.filter_by(username=username).first():
        return jsonify(error=f"Пользователь с именем '{username}' уже сушествует, придумайте другое имя!"), 400

    user = User.get(get_jwt_identity())

    user.edit_username(username)
    return jsonify(ok=True)


@user_bp.post("edit/info")
@jwt_required()
def edit_info():
    info = str(request.json.get("info", ""))

    user = User.get(get_jwt_identity())

    user.edit_info(info)
    return jsonify(ok=True)


