from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from ..models.user import User, Department
from ..utils.email import send_password_reset_email
from datetime import datetime, timedelta
import uuid
import re
from email_validator import validate_email, EmailNotValidError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['firstName', 'lastName', 'email', 'password', 'universityId', 'role', 'department']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # Validate email format
    try:
        validate_email(data['email'])
    except EmailNotValidError:
        return jsonify({'message': 'Invalid email format'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    # Check if university ID already exists
    if User.query.filter_by(university_id=data['universityId']).first():
        return jsonify({'message': 'University ID already registered'}), 400
    
    # Validate password strength
    if len(data['password']) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long'}), 400
    
    # Check if department exists
    department = Department.query.filter_by(id=data['department']).first()
    if not department:
        return jsonify({'message': 'Invalid department'}), 400
    
    # Create new user
    new_user = User(
        first_name=data['firstName'],
        last_name=data['lastName'],
        email=data['email'],
        university_id=data['universityId'],
        role=data['role'],
        department_id=data['department']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'success': True}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Check if role matches (if provided)
    if 'role' in data and user.role != data['role']:
        return jsonify({'message': f'This account is not registered as a {data["role"]}'}), 401
    
    # Create access token
    access_token = create_access_token(identity=user.uuid)
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({'message': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    # Always return success even if email doesn't exist (for security)
    if not user:
        print(f"Password reset requested for non-existent email: {data['email']}")
        return jsonify({'message': 'If your email is registered, you will receive a password reset link', 'success': True}), 200
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now() + timedelta(hours=1)
    
    try:
        db.session.commit()
        print(f"Reset token generated for user {user.email}: {reset_token}")
        
        # Send reset email
        email_sent = send_password_reset_email(user)
        if email_sent:
            print(f"Password reset email sent to {user.email}")
            return jsonify({
                'message': 'If your email is registered, you will receive a password reset link',
                'success': True
            }), 200
        else:
            print(f"Failed to send password reset email to {user.email}")
            return jsonify({
                'message': 'We could not send the reset email. Please try again later.',
                'success': False
            }), 200  # still return 200 to avoid revealing email existence
            
    except Exception as e:
        print(f"Error in reset password process: {str(e)}")
        db.session.rollback()
        return jsonify({
            'message': 'An error occurred. Please try again later.',
            'success': False
        }), 500

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    
    if not data.get('password'):
        return jsonify({'message': 'New password is required'}), 400
    
    if len(data['password']) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long'}), 400
    
    user = User.query.filter_by(reset_token=token).first()
    
    if not user:
        return jsonify({'message': 'Invalid reset token. User not found.'}), 400
        
    if not user.reset_token_expires:
        return jsonify({'message': 'Reset token has no expiration date.'}), 400
        
    if user.reset_token_expires < datetime.now():
        return jsonify({'message': 'Reset token has expired. Please request a new one.'}), 400
    
    user.set_password(data['password'])
    user.reset_token = None
    user.reset_token_expires = None
    
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully', 'success': True}), 200

@auth_bp.route('/reset-password/<token>/verify', methods=['GET'])
def verify_reset_token(token):
    """Verify if a reset token is valid."""
    user = User.query.filter_by(reset_token=token).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.now():
        return jsonify({'message': 'Invalid or expired reset token', 'valid': False}), 400
    
    return jsonify({'message': 'Valid token', 'valid': True}), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not old_password or not new_password:
        return jsonify({'error': 'Old password and new password are required'}), 400

    if not user.check_password(old_password):
        return jsonify({'error': 'Incorrect old password'}), 401

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200
