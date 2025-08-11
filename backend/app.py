import os
from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from dotenv import load_dotenv
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from google.auth.transport import requests as google_requests
import pathlib
import requests as ext_requests

load_dotenv()


db = SQLAlchemy()

# MODELS (move to top level)

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text)
    google_id = db.Column(db.String(128), unique=True)
    preferences = db.Column(db.JSON)
    saved_places = db.Column(db.JSON)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(32))
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(256))

class CommunityMessage(db.Model):
    __tablename__ = 'community_messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    message = db.Column(db.Text)
    image_url = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.String(32))

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    start_location = db.Column(db.String(256))
    destination = db.Column(db.String(256))
    accessibility_filters = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:Kavin04@localhost/accessible_chennai')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['SESSION_TYPE'] = 'filesystem'
    # GOOGLE OAUTH CONFIG
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_DISCOVERY_URL = (
        "https://accounts.google.com/.well-known/openid-configuration"
    )

    # GOOGLE OAUTH ENDPOINTS
    @app.route('/api/google-auth/login')
    def google_login():
        try:
            if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
                return jsonify({'error': 'Google OAuth not configured'}), 500
            
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": GOOGLE_CLIENT_ID,
                        "client_secret": GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [request.host_url + "api/google-auth/callback"]
                    }
                },
                scopes=["openid", "email", "profile"],
                redirect_uri=request.host_url + "api/google-auth/callback"
            )
            authorization_url, state = flow.authorization_url(
                prompt='consent',
                access_type='offline',
                include_granted_scopes='true'
            )
            session['state'] = state
            return redirect(authorization_url)
        except Exception as e:
            print(f"Google login error: {e}")
            return redirect(f'http://localhost:3000/login?error=google_auth_failed')

    @app.route('/api/google-auth/callback')
    def google_callback():
        try:
            if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
                return redirect(f'http://localhost:3000/login?error=google_not_configured')
            
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": GOOGLE_CLIENT_ID,
                        "client_secret": GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [request.host_url + "api/google-auth/callback"]
                    }
                },
                scopes=["openid", "email", "profile"],
                redirect_uri=request.host_url + "api/google-auth/callback"
            )
            
            flow.fetch_token(authorization_response=request.url)
            credentials = flow.credentials
            
            # Verify the token
            id_info = id_token.verify_oauth2_token(
                credentials._id_token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID
            )
            
            # Extract user info
            google_id = id_info.get('sub')
            email = id_info.get('email')
            name = id_info.get('name', '')
            
            if not email:
                return redirect(f'http://localhost:3000/login?error=no_email_from_google')
            
            # Check if user exists or create new user
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    email=email, 
                    google_id=google_id, 
                    preferences={}, 
                    saved_places=[]
                )
                db.session.add(user)
            else:
                # Update Google ID if not set
                if not user.google_id:
                    user.google_id = google_id
            
            db.session.commit()
            
            # Redirect to frontend with success
            return redirect(f'http://localhost:3000/login?google_success=1&user_id={user.id}&email={email}')
            
        except Exception as e:
            print(f"Google callback error: {e}")
            return redirect(f'http://localhost:3000/login?error=google_callback_failed')
    CORS(app)
    db.init_app(app)
    login_manager = LoginManager()
    login_manager.init_app(app)


    # CLEAR & RE-INIT DB
    @app.route('/admin/clear_db', methods=['POST'])
    def clear_db():
        db.drop_all()
        db.create_all()
        return {'message': 'Database cleared and re-initialized.'}

    # AUTH ENDPOINTS
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.json
        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already registered'}, 400
        user = User(email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        # Return JSON, not redirect
        return {'message': 'Registration successful', 'user_id': user.id}

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        if user:
            if user.password_hash is None:
                return {'error': 'Please sign in with Google for this account.'}, 401
            if user.check_password(data['password']):
                # Return JSON, not redirect
                return {'message': 'Login successful', 'user_id': user.id}
        return {'error': 'Invalid credentials'}, 401

    # ALERTS ENDPOINTS
    @app.route('/api/alerts', methods=['GET', 'POST'])
    def alerts():
        if request.method == 'POST':
            data = request.json
            alert = Alert(category=data['category'], message=data['message'], location=data.get('location'))
            db.session.add(alert)
            db.session.commit()
            return {'message': 'Alert created'}
        alerts = Alert.query.order_by(Alert.created_at.desc()).all()
        return jsonify([{'id': a.id, 'category': a.category, 'message': a.message, 'created_at': a.created_at, 'location': a.location} for a in alerts])

    # COMMUNITY ENDPOINTS
    @app.route('/api/community', methods=['GET', 'POST'])
    def community():
        if request.method == 'POST':
            data = request.json
            msg = CommunityMessage(user_id=data['user_id'], message=data['message'], image_url=data.get('image_url'), type=data.get('type', 'chat'))
            db.session.add(msg)
            db.session.commit()
            return {'message': 'Message posted'}
        msgs = CommunityMessage.query.order_by(CommunityMessage.created_at.desc()).all()
        return jsonify([{'id': m.id, 'user_id': m.user_id, 'message': m.message, 'image_url': m.image_url, 'created_at': m.created_at, 'type': m.type} for m in msgs])

    # ROUTES ENDPOINTS
    @app.route('/api/routes', methods=['GET', 'POST'])
    def routes():
        if request.method == 'POST':
            data = request.json
            route = Route(user_id=data['user_id'], start_location=data['start_location'], destination=data['destination'], accessibility_filters=data.get('accessibility_filters', {}))
            db.session.add(route)
            db.session.commit()
            return {'message': 'Route saved'}
        routes = Route.query.order_by(Route.created_at.desc()).all()
        return jsonify([{'id': r.id, 'user_id': r.user_id, 'start_location': r.start_location, 'destination': r.destination, 'accessibility_filters': r.accessibility_filters, 'created_at': r.created_at} for r in routes])

    # USER PREFERENCES
    @app.route('/api/user/<int:user_id>/preferences', methods=['GET', 'POST'])
    def user_preferences(user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        if request.method == 'POST':
            user.preferences = request.json.get('preferences', user.preferences)
            db.session.commit()
            return {'message': 'Preferences updated'}
        return jsonify(user.preferences)

    @app.route('/')
    def index():
        return {'message': 'Accessible Chennai API running'}

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
