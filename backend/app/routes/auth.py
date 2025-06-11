from flask import Blueprint, jsonify, request
from app.models import User


from flask_jwt_extended import (get_jwt_identity,
                                create_access_token,
                                create_refresh_token,
                                jwt_required,
                                verify_jwt_in_request)

from flask_jwt_extended.exceptions import NoAuthorizationError
from werkzeug.security import generate_password_hash, check_password_hash


auth_bp = Blueprint("auth", __name__)

MIN_PASSWORD_LENGTH = 8
MAX_USERNAME_LENGTH = 20
MIN_USERNAME_LENGTH = 3


@auth_bp.post("/login")
def login():
    username = request.json.get("username", "")
    password = request.json.get("password", "")

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify(ok=False, error=f"Пользователя '{username}' не существует!"), 400

    if not check_password_hash(user.password, password):
        return jsonify(ok=False, error=f"Неверный пароль!"), 400

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify(ok=True, access_token=access_token, refresh_token=refresh_token)


@auth_bp.post("/registration")
def registration():

    username = request.json.get("username", "")
    password = request.json.get("password", "")

    if User.query.filter_by(username=username).first():
        return jsonify(ok=False, error=f"Пользаватель '{username}' уже существует! Придумайте новое имя!'"), 400

    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify(ok=False, error=f"Пароль слишком короткий (минимум {MIN_PASSWORD_LENGTH} символов)"), 400

    if len(username) >= 20:
        return jsonify(ok=False, error=f"Имя пользователя слишком длинное (максимум {MAX_USERNAME_LENGTH} символов)"), 400

    if len(username) < 3:
        return jsonify(ok=False, error=f"Имя пользователя слишком  (минимум {MIN_USERNAME_LENGTH} символов)"), 400

    user = User(username=username,
                password=generate_password_hash(password)).save()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify(ok=True, access_token=access_token, refresh_token=refresh_token)


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    new_access_token = create_access_token(identity=get_jwt_identity())
    return jsonify(access_token=new_access_token)


@auth_bp.get("/validate")
def validate():
    try:
        verify_jwt_in_request()
        return jsonify(valid=True, user=get_jwt_identity())
    except NoAuthorizationError:
        return jsonify(valid=False), 401

