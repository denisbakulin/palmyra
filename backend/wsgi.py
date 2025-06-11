from app import create_app
from app.extentions import socketio


app = create_app()

if __name__ == "__main__":
    socketio.run(app, port=5000, host="0.0.0.0", debug=True)
