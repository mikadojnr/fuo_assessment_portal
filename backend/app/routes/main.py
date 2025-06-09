from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..models.user import Department, User
from app import db

main = Blueprint('main', __name__)



@main.route('/departments', methods=['GET'])
def get_departments():
    try:
        departments = Department.query.all()
        return jsonify([{
            'id': dept.id,
            'name': dept.name,
        } for dept in departments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@main.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Fields that can be updated
    if 'firstName' in data:
        user.first_name = data['firstName']
    
    if 'lastName' in data:
        user.last_name = data['lastName']
    
    # Update other fields as needed
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

@main.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200
