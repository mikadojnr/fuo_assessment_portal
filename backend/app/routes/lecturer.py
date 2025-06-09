from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.user import User, Course, student_courses
from app.models.assessment import Assessment, AssessmentDraft, Submission, Question, QuestionOption
from app.models.lecturer import PlagiarismReport, StudentEngagement
from datetime import datetime, timedelta
import json
import random  # For mock data

lecturer_bp = Blueprint('lecturer', __name__)


def format_time_remaining(seconds):
    """Convert seconds to a human-readable format."""
    if seconds < 0:
        return "Expired"
        
    days = seconds // (24 * 3600)
    hours = (seconds % (24 * 3600)) // 3600
    minutes = (seconds % 3600) // 60
    
    if days > 0:
        return f"{int(days)}d {int(hours)}h remaining"
    elif hours > 0:
        return f"{int(hours)}h {int(minutes)}m remaining"
    else:
        return f"{int(minutes)}m remaining"


@lecturer_bp.route('/assessments/drafts', methods=['GET'])
@jwt_required()
def get_drafts():
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user or user.role != 'lecturer':
            return jsonify({'message': 'Unauthorized'}), 403

        drafts = []
        draft_records = (AssessmentDraft.query
                        .filter_by(user_id=user.id)
                        .order_by(AssessmentDraft.last_updated.desc())
                        .all()
                        )
        
        for draft in draft_records:
            course = Course.query.get(draft.course_id) if draft.course_id else None
            drafts.append({
                'id': draft.id,
                'title': draft.title or "",
                'course': course.code if course else "",
                'description': draft.description or "",
                'courseId': draft.course_id,
                'lastUpdated': draft.last_updated.isoformat(),
                'createdAt': draft.created_at.isoformat(),
                'status': 'draft',
                'submissions': 0,
                'totalStudents': 0,
                'isDraft': True
            })

        return jsonify({
                        'drafts': drafts,
                        'count': len(drafts),
                        'timestamp':datetime.utcnow().isoformat()
                        }), 200

    except Exception as e:
        print(f"Error in get_drafts: {e}")
        return jsonify({
            'message': 'Failed to fetch drafts',
            'error': str(e)
        }), 500
        
@lecturer_bp.route('/assessments/active', methods=['GET'])
@jwt_required()
def get_active_assessments():
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user or user.role != 'lecturer':
            return jsonify({'message': 'Unauthorized'}), 403

        current_time = datetime.utcnow()
        active = []

        # Get all assessments that haven't ended yet
        assessments = (Assessment.query
                      .filter_by(created_by=user.id)
                      .filter(Assessment.end_date > current_time)
                      .all())

        for assessment in assessments:
            course = Course.query.get(assessment.course_id)
            if not course:
                continue

            submissions_count = (Submission.query
                               .filter_by(assessment_id=assessment.id)
                               .count())

            total_students = (db.session.query(func.count(student_courses.c.student_id))
                            .filter(student_courses.c.course_id == course.id)
                            .scalar())

            # Calculate time remaining
            time_until_start = (assessment.start_date - current_time).total_seconds()
            time_until_end = (assessment.end_date - current_time).total_seconds()
            
            # Determine status and time display
            if current_time < assessment.start_date:
                status = 'upcoming'
                time_display = f"Starts in: {format_time_remaining(time_until_start)}"
                sort_priority = 2
            elif current_time >= assessment.start_date and current_time < assessment.end_date:
                status = 'ongoing'
                time_display = format_time_remaining(time_until_end)
                sort_priority = 1
            else:
                continue  # Skip if it's ended

            active.append({
                'id': assessment.id,
                'title': assessment.title,
                'course': course.code,
                'courseId': course.id,
                'startDate': assessment.start_date.isoformat(),
                'endDate': assessment.end_date.isoformat(),
                'deadline': time_display,
                'submissions': submissions_count,
                'totalStudents': total_students,
                'status': status,
                'isDraft': False,
                'sortPriority': sort_priority,
                'progressPercentage': (submissions_count / total_students * 100) if total_students > 0 else 0,
                'timeRemaining': {
                    'raw': time_until_end,
                    'formatted': time_display
                },
                'startTime': assessment.start_date.strftime('%I:%M %p'),
                'endTime': assessment.end_date.strftime('%I:%M %p'),
                'hasStarted': assessment.start_date <= current_time,
                'durationMinutes': int((assessment.end_date - assessment.start_date).total_seconds() / 60)
            })

        # Sort: ongoing first, then upcoming, both sorted by start time
        active.sort(key=lambda x: (
            x['sortPriority'],  # 1 for ongoing, 2 for upcoming
            x['startDate']  # Then by start date
        ))

        return jsonify({
            'active': active,
            'count': len(active),
            'timestamp': current_time.isoformat(),
            'message': 'Active assessments fetched successfully'
        }), 200

    except Exception as e:
        print(f"Error in get_active_assessments: {str(e)}")
        return jsonify({
            'message': 'Failed to fetch active assessments',
            'error': str(e)
        }), 500     
        
@lecturer_bp.route('/assessments/completed', methods=['GET'])
@jwt_required()
def get_completed_assessments():
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user or user.role != 'lecturer':
            return jsonify({'message': 'Unauthorized'}), 403

        current_time = datetime.utcnow()
        completed = []

        assessments = (Assessment.query
                      .filter_by(created_by=user.id)
                      .filter(Assessment.end_date <= current_time)
                      .order_by(Assessment.end_date.desc())
                      .all())

        for assessment in assessments:
            course = Course.query.get(assessment.course_id)
            if not course:
                continue

            submissions_count = (Submission.query
                               .filter_by(assessment_id=assessment.id)
                               .count())

            total_students = (db.session.query(func.count(student_courses.c.student_id))
                            .filter(student_courses.c.course_id == course.id)
                            .scalar())

            completed.append({
                'id': assessment.id,
                'title': assessment.title,
                'course': course.code,
                'courseId': course.id,
                'startDate': assessment.start_date.isoformat(),
                'endDate': assessment.end_date.isoformat(),
                'deadline': assessment.end_date.isoformat(),
                'submissions': submissions_count,
                'totalStudents': total_students,
                'status': 'completed',
                'isDraft': False,
                'progressPercentage': (submissions_count / total_students * 100) if total_students > 0 else 0
            })

        return jsonify({
            'completed': completed,
            'count': len(completed),
            'timestamp': current_time.isoformat()
        }), 200

    except Exception as e:
        print(f"Error in get_completed_assessments: {str(e)}")
        return jsonify({
            'message': 'Failed to fetch completed assessments',
            'error': str(e)
        }), 500



@lecturer_bp.route('/assessments/<int:assessment_id>', methods=['PUT'])
@jwt_required()
def update_assessment(assessment_id):
    """Update an existing assessment."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != 'lecturer':
        return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
    
    data = request.get_json()
    
    # In a real application, you would update the assessment in the database
    # For now, we'll just return success
    
    return jsonify({
        'message': 'Assessment updated successfully',
        'assessment': {
            'id': assessment_id,
            **data
        }
    }), 200

@lecturer_bp.route('/assessments/<int:assessment_id>/status', methods=['PUT'])
@jwt_required()
def update_assessment_status(assessment_id):
    """Update the status of an assessment."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != 'lecturer':
        return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'message': 'Status is required'}), 400
    
    # In a real application, you would update the assessment status in the database
    # For now, we'll just return success
    
    return jsonify({
        'message': 'Assessment status updated successfully',
        'assessment': {
            'id': assessment_id,
            'status': data['status']
        }
    }), 200

@lecturer_bp.route('/questions', methods=['GET'])
@jwt_required()
def get_questions():
    """Get all questions for a lecturer."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != 'lecturer':
        return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
    
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    questions = [
        {
            'id': 1,
            'text': 'What is the primary function of a database management system?',
            'type': 'mcq',
            'difficulty': 'medium',
            'marks': 5,
            'lastUsed': (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d'),
            'options': [
                {'id': 1, 'text': 'To create web pages', 'isCorrect': False},
                {'id': 2, 'text': 'To manage and organize data', 'isCorrect': True},
                {'id': 3, 'text': 'To design user interfaces', 'isCorrect': False},
                {'id': 4, 'text': 'To compile programming code', 'isCorrect': False}
            ]
        },
        {
            'id': 2,
            'text': 'Explain the concept of normalization in database design.',
            'type': 'essay',
            'difficulty': 'hard',
            'marks': 10,
            'lastUsed': (datetime.utcnow() - timedelta(days=60)).strftime('%Y-%m-%d'),
            'options': []
        },
        {
            'id': 3,
            'text': 'What is the time complexity of a binary search algorithm?',
            'type': 'short_answer',
            'difficulty': 'medium',
            'marks': 3,
            'lastUsed': (datetime.utcnow() - timedelta(days=15)).strftime('%Y-%m-%d'),
            'options': []
        }
    ]
    
    return jsonify(questions), 200

@lecturer_bp.route('/questions', methods=['POST'])
@jwt_required()
def create_question():
    """Create a new question."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != 'lecturer':
        return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['text', 'type', 'difficulty', 'marks']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # In a real application, you would create a new question in the database
    # For now, we'll just return success
    
    return jsonify({
        'message': 'Question created successfully',
        'question': {
            'id': 100,  # Mock ID
            'text': data['text'],
            'type': data['type'],
            'difficulty': data['difficulty'],
            'marks': data['marks'],
            'options': data.get('options', [])
        }
    }), 201

@lecturer_bp.route('/plagiarism-alerts', methods=['GET'])
@jwt_required()
def get_plagiarism_alerts_endpoint():
    """Get all plagiarism alerts for a lecturer."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != 'lecturer':
        return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
    
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    alerts = get_plagiarism_alerts(user.id)
    
    return jsonify(alerts), 200

@lecturer_bp.route('/student-engagement', methods=['GET'])
@jwt_required()
def get_student_engagement_endpoint():
    """Get student engagement metrics for a lecturer's courses."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != 'lecturer':
        return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
    
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    engagement_data = get_student_engagement(user.id)
    
    return jsonify(engagement_data), 200
