from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from .config import Config

# load environment variables
load_dotenv()

# initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configure the app
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Import and register blueprints
    from .routes.main import main
    from .routes.auth import auth_bp
    from .routes.student import student_bp
    from .routes.lecturer import lecturer_bp
    from .routes.assessment import assessment_bp
    
    app.register_blueprint(main, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth/')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(lecturer_bp, url_prefix='/api/lecturer')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessments')
    
    return app