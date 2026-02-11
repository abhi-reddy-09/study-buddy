import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key') # Replace with a strong secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db' # SQLite database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'login' # type: ignore
socketio = SocketIO(app, cors_allowed_origins="*") # Allow all origins for development
CORS(app) # Enable CORS for all routes

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Database Models ---
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False) # Hashed password
    # Add other user-related fields here

    def __repr__(self):
        return f"User('{self.username}')"

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages', lazy=True)
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages', lazy=True)

    def __repr__(self):
        return f"Message('{self.content}', from={self.sender_id}, to={self.receiver_id})"

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Add other match-related fields (e.g., status, match_date)

    user1 = db.relationship('User', foreign_keys=[user1_id], backref='matches_as_user1', lazy=True)
    user2 = db.relationship('User', foreign_keys=[user2_id], backref='matches_as_user2', lazy=True)

    def __repr__(self):
        return f"Match(user1_id={self.user1_id}, user2_id={self.user2_id})"

# --- Routes and SocketIO Events ---

@app.route('/')
def home():
    return "Study Buddy Backend is running!"

# Authentication Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password') # In a real app, hash this password!

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    # For demo purposes, we're storing plaintext password. Use werkzeug.security.generate_password_hash in production.
    new_user = User(username=username, password=password) # Hash password in production
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    # For demo purposes, plaintext password check. Use werkzeug.security.check_password_hash in production.
    if user and user.password == password: # Check hashed password in production
        login_user(user)
        return jsonify({'message': 'Logged in successfully', 'user_id': user.id}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/profile')
@login_required
def profile():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        # Add more profile data here
    }), 200

# Placeholder for image fetching
@app.route('/image/<int:user_id>')
def get_user_image(user_id):
    # This is a placeholder. In a real app, you'd fetch from a storage service or a more robust image API.
    # For now, let's use a random image from a placeholder service like 'picsum.photos'
    # Or link to specific images based on user_id if you have them.
    # We will expand this later to use a proper external API.
    return jsonify({'image_url': f'https://picsum.photos/200/300?random={user_id}'}), 200


# SocketIO Events
@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        print(f'Client connected: {current_user.username}')
        join_room(str(current_user.id)) # User joins their own room
        emit('status', {'msg': f'{current_user.username} connected'}, room=str(current_user.id))
    else:
        print('Client connected: Anonymous')


@socketio.on('disconnect')
def handle_disconnect():
    if current_user.is_authenticated:
        print(f'Client disconnected: {current_user.username}')
        emit('status', {'msg': f'{current_user.username} disconnected'}, room=str(current_user.id))
    else:
        print('Client disconnected: Anonymous')


@socketio.on('send_message')
@login_required
def handle_send_message(data):
    receiver_id = data.get('receiver_id')
    content = data.get('content')

    if not receiver_id or not content:
        emit('error', {'message': 'Receiver ID and content are required.'})
        return

    receiver = User.query.get(receiver_id)
    if not receiver:
        emit('error', {'message': 'Receiver not found.'})
        return

    new_message = Message(sender_id=current_user.id, receiver_id=receiver_id, content=content)
    db.session.add(new_message)
    db.session.commit()

    # Emit message to sender and receiver
    emit('receive_message', {
        'sender_id': current_user.id,
        'receiver_id': receiver_id,
        'content': content,
        'timestamp': str(new_message.timestamp)
    }, room=str(receiver_id)) # Send to receiver's room
    
    # Also emit to the sender's room so they see their own message
    emit('receive_message', {
        'sender_id': current_user.id,
        'receiver_id': receiver_id,
        'content': content,
        'timestamp': str(new_message.timestamp)
    }, room=str(current_user.id))


if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Create tables if they don't exist
    socketio.run(app, debug=True, port=5000)
