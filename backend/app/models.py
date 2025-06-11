from sqlalchemy import DateTime, func, select
from datetime import datetime
from app.extentions import db
from app.config import Config


chat_users = db.Table(
    'chat_users',
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('joined_at', db.DateTime, default=func.now())
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(500), nullable=False)
    date = db.Column(DateTime, server_default=func.now())
    info = db.Column(db.String(1000), nullable=True)
    avatar = db.Column(db.String(100))

    messages = db.relationship('Message', back_populates='user', lazy='dynamic')
    chats = db.relationship("Chat", secondary=chat_users, back_populates="users")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.add_to_chat(Chat(name="Блокнот", type="group", private=True).save())

    @property
    def avatar_url(self):
        return f"{Config.SERVER_URL}/static/avatars/{self.avatar}" \
            if self.avatar else f"{Config.SERVER_URL}/static/avatars/default.png"

    @classmethod
    def get(cls, uid: str | int) -> "User":
        user = None
        if (isinstance(uid, str) and uid.isdigit()) or isinstance(uid, int):
            user = cls.query.filter_by(id=int(uid)).first()
        return user

    def edit_username(self, username):
        self.username = username
        db.session.commit()

    def edit_info(self, info):
        self.info = info
        db.session.commit()

    def save(self):
        db.session.add(self)
        db.session.flush()
        db.session.commit()
        return self

    def add_to_chat(self, chat):
        self.chats.append(chat)
        db.session.commit()

    def set_username(self, username):
        self.username = username
        return self

    def set_info(self, info):
        self.info = info
        return self

    def to_dict(self):
        return dict(
            id=self.id,
            username=self.username,
            info=self.info,
            date=self.date.isoformat() + "Z",
            avatar=self.avatar_url
        )

    def update_avatar(self, filename):
        self.avatar = filename
        db.session.commit()

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(5), nullable=False)
    private = db.Column(db.Boolean, nullable=False)
    name = db.Column(db.String(20))
    avatar = db.Column(db.String(100))

    users = db.relationship("User", secondary=chat_users, back_populates="chats")
    messages = db.relationship('Message', back_populates='chat', lazy='dynamic')

    @property
    def avatar_url(self):
        return f"{Config.SERVER_URL}/static/avatars/{self.avatar}" if self.avatar \
            else f"{Config.SERVER_URL}/static/avatars/default.png"

    def update_avatar(self, filename):
        self.avatar = filename
        db.session.commit()

    @classmethod
    def get(cls, chat_id: str | int):
        chat = None
        if (isinstance(chat_id, str) and chat_id.isdigit()) or isinstance(chat_id, int):
            chat = cls.query.filter_by(id=int(chat_id)).first()
        return chat



    @property
    def admin(self):
        return (
            db.session.query(User)
            .join(chat_users)
            .filter(chat_users.c.chat_id == self.id)
            .order_by(chat_users.c.joined_at)
            .first()
    )


    def save(self):
        db.session.add(self)
        db.session.flush()
        db.session.commit()
        return self

    def to_dict(self, uid=1):
        if self.type == "user":
            user = None or [user for user in self.users if user.id != uid]
            user_info = {} if not user else {"name": user[0].username,
                                             "avatar": user[0].avatar_url,
                                             "uid": user[0].id}
            return dict(
                id=self.id,
                type=self.type,
                last_message=self.last_message,
                last_message_time=self.last_message_time) | user_info

        elif self.type == "group":
            return dict(
                id=self.id,
                type=self.type,
                name=self.name,
                last_message=self.last_message,
                last_message_time=self.last_message_time,
                private=self.private,
                admin=self.admin.id if self.admin else 0,
                avatar=self.avatar_url
            )

    @property
    def last_message(self):
        message = self.messages.order_by(Message.msg_id.desc()).first()
        if not message:
            return ""
        return message.content

    @property
    def last_message_time(self):
        message = self.messages.order_by(Message.msg_id.desc()).first()
        if not message:
            return ""
        return message.created_at.isoformat() + "Z"

    def del_from_chat(self, user):
        self.users.remove(user)
        db.session.commit()

    @staticmethod
    def find_chat_with_users(user_ids: list[int, int]):

        participant_count = len(user_ids)

        subquery = (
            select(Chat.id)
            .join(chat_users)
            .group_by(Chat.id)
            .having(func.count(chat_users.c.user_id) == participant_count)
            .subquery()
        )

        chat = (
            db.session.query(Chat)
            .join(chat_users)
            .filter(Chat.id.in_(select(subquery.c.id)))
            .filter(Chat.type == "user")
            .filter(chat_users.c.user_id.in_(user_ids))
            .group_by(Chat.id)
            .having(func.count(chat_users.c.user_id) == participant_count)
            .first()
        )

        return chat


class Message(db.Model):
    msg_id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    addition = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)

    user = db.relationship('User', back_populates='messages')
    chat = db.relationship('Chat', back_populates='messages')


    def save(self):
        db.session.add(self)
        db.session.flush()
        db.session.commit()
        return self


    def to_dict(self):
        return dict(
            content=self.content,
            id=self.msg_id,
            sent_time=f"{self.created_at}Z",

        )






