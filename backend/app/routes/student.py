from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from ..models.user import User, Course, student_courses
from ..models.assessment import Assessment, Submission, StudentProgress
from datetime import datetime, timedelta
import random  # For mock data

student_bp = Blueprint('student', __name__)

@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """Get all dashboard data for a student."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid, role='student').first_or_404()
    

    # In a real application, you would fetch this data from the database
    # For now, we'll return mock data
    
    # Get upcoming assessments
    upcoming_assessments = get_upcoming_assessments(user)
    
    # Get performance data
    performance_data = get_performance_data(user.id)
    
    # Get recent results
    recent_results = get_recent_results(user.id)
    
    # Get notifications
    notifications = get_notifications(user.id)
    
    return jsonify({
        'upcomingAssessments': upcoming_assessments,
        # 'performanceData': performance_data,
        # 'recentResults': recent_results,
        # 'notifications': notifications
    }), 200

def get_upcoming_assessments(user):
    """Get upcoming assessments for a student."""
    assessments = []
    try:
        
        # Get course_ids the student is registered in
        
        course_ids = [course.id for course in user.registered_courses]
        
        # Get assessments that haven't passed their deadline
        # limit to 6 most recent upcoming assessments
        assessment_records = Assessment.query.filter(
            Assessment.course_id.in_(course_ids),
            Assessment.end_date > datetime.utcnow()
            ).order_by(Assessment.end_date.asc()).limit(6).all()
        
        for assessment in assessment_records:
            # Check if student has started this assessment
            progress = StudentProgress.query.filter_by(
                user_id=user.id, 
                assessment_id=assessment.id
            ).first()
            
            # Calculate days untol deadline
            days_remaining = (assessment.end_date - datetime.utcnow()).days
            
            # Determine status and progress            
            status = "Not Started"
            progress_percent = 0
            
            if progress:
                status = progress.status.replace('_', ' ').title()
                progress_percent = progress.progress
            
            assessments.append({
                'id': assessment.id,
                'courseCode': assessment.course.code,
                'courseTitle': assessment.course.title,
                'title': assessment.title,
                'deadline': assessment.end_date.isoformat(),
                'type': assessment.type,  # Added assessment type
                'totalMarks': assessment.total_marks,  # Added total marks
                'progress': progress_percent,
                'status': status,
                'daysRemaining': days_remaining  # Added days remaining
            })
    except Exception as e:
        print(f"Error fetching assessments: {str(e)}")
    
    return assessments

def get_performance_data(user_id):
    """Get performance data for a student."""
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    
    # Try to get real data first
    labels = []
    scores = []
    class_average = []
    
    try:
        # Get submissions from the last 6 weeks
        six_weeks_ago = datetime.utcnow() - timedelta(weeks=6)
        submissions = Submission.query.filter_by(user_id=user_id).filter(
            Submission.submitted_at > six_weeks_ago
        ).order_by(Submission.submitted_at).all()
        
        # Group by week
        weeks = {}
        for submission in submissions:
            week_num = submission.submitted_at.isocalendar()[1]
            week_label = f"Week {week_num}"
            
            if week_label not in weeks:
                weeks[week_label] = {
                    'scores': [],
                    'class_scores': []
                }
            
            if submission.score is not None:
                weeks[week_label]['scores'].append(submission.score)
            
            # For class average, we'd need to query all submissions for this assessment
            # This is simplified for the example
            class_score = random.uniform(60, 75)
            weeks[week_label]['class_scores'].append(class_score)
        
        # Calculate averages
        for week_label, data in sorted(weeks.items()):
            labels.append(week_label)
            scores.append(sum(data['scores']) / len(data['scores']) if data['scores'] else 0)
            class_average.append(sum(data['class_scores']) / len(data['class_scores']) if data['class_scores'] else 0)
    except Exception as e:
        print(f"Error fetching performance data: {str(e)}")
    
    # If no real data, use mock data
    if not labels:
        labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]
        scores = [65, 78, 80, 74, 85, 90]
        class_average = [60, 65, 70, 68, 72, 75]
    
    return {
        'labels': labels,
        'scores': scores,
        'classAverage': class_average
    }

def get_recent_results(user_id):
    """Get recent results for a student."""
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    
    # Try to get real data first
    results = []
    try:
        submissions = Submission.query.filter_by(
            user_id=user_id, 
            status='graded'
        ).order_by(Submission.submitted_at.desc()).limit(5).all()
        
        for submission in submissions:
            assessment = Assessment.query.get(submission.assessment_id)
            if assessment:
                course = Course.query.get(assessment.course_id)
                course_code = course.code if course else "Unknown"
                
                results.append({
                    'id': submission.id,
                    'assessment': assessment.title,
                    'course': course_code,
                    'dateSubmitted': submission.submitted_at.strftime('%Y-%m-%d'),
                    'score': submission.score,
                    'plagiarismCheck': submission.plagiarism_score or 0,
                    'feedback': submission.feedback or "No feedback provided."
                })
    except Exception as e:
        print(f"Error fetching results: {str(e)}")
    
    # If no real data, use mock data
    if not results:
        results = [
            {
                'id': 1,
                'assessment': 'Midterm Exam',
                'course': 'CSC 401',
                'dateSubmitted': '2023-11-15',
                'score': 85,
                'plagiarismCheck': 5,
                'feedback': 'Excellent work on database normalization concepts.'
            },
            {
                'id': 2,
                'assessment': 'Assignment 3',
                'course': 'CSC 405',
                'dateSubmitted': '2023-11-10',
                'score': 65,
                'plagiarismCheck': 15,
                'feedback': 'Good attempt, but needs improvement in UML diagrams.'
            },
            {
                'id': 3,
                'assessment': 'Quiz 2',
                'course': 'MTH 302',
                'dateSubmitted': '2023-11-05',
                'score': 45,
                'plagiarismCheck': 0,
                'feedback': 'Review matrix operations and transformations.'
            }
        ]
    
    return results

def get_notifications(user_id):
    """Get notifications for a student."""
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    return [
        {
            'id': 1,
            'type': 'deadline',
            'title': 'Assignment Deadline Extended',
            'message': 'The deadline for CSC 405 has been extended to December 15th.',
            'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            'read': False
        },
        {
            'id': 2,
            'type': 'material',
            'title': 'New Course Materials',
            'message': 'New lecture notes have been uploaded for MTH 302.',
            'timestamp': (datetime.utcnow() - timedelta(days=1)).isoformat(),
            'read': False
        },
        {
            'id': 3,
            'type': 'grade',
            'title': 'Grade Released',
            'message': 'Your grade for CSC 401 Midterm Exam has been released.',
            'timestamp': (datetime.utcnow() - timedelta(days=2)).isoformat(),
            'read': False
        }
    ]



@student_bp.route('/upcoming-assessments', methods=['GET'])
@jwt_required()
def get_student_upcoming_assessments():
    """
    Get upcoming assessments for the authenticated student.
    Query params:
    -   days (int):  Number of days to look ahead (default: 30)
    -   course_id (int): Filter by specific course (optional)
    -   limit (int): Maximum number of assessments to return (default: 10)
    -   offset (int): Offset for pagination (default: 0)
    """
        




@student_bp.route('/assessments', methods=['GET'])
@jwt_required()
def get_assessments():
    """Get all assessments for a student."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # In a real application, you would fetch this from the database based on student's courses
    # For now, we'll return mock data
    assessments = get_upcoming_assessments(user.id)
    
    return jsonify(assessments), 200

@student_bp.route('/results', methods=['GET'])
@jwt_required()
def get_results():
    """Get all results for a student."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    results = get_recent_results(user.id)
    
    return jsonify(results), 200

@student_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_student_notifications():
    """Get all notifications for a student."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    notifications = get_notifications(user.id)
    
    return jsonify(notifications), 200

@student_bp.route('/notifications/read', methods=['POST'])
@jwt_required()
def mark_notifications_read():
    """Mark notifications as read."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    notification_ids = data.get('notificationIds', [])
    
    # In a real application, you would update the database
    # For now, we'll just return success
    
    return jsonify({'message': 'Notifications marked as read', 'success': True}), 200

@student_bp.route('/assessment/<int:assessment_id>/progress', methods=['POST'])
@jwt_required()
def update_assessment_progress(assessment_id):
    """Update progress for an assessment."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    progress = data.get('progress', 0)
    status = data.get('status', 'in_progress')
    
    # In a real application, you would update the database
    # For now, we'll just return success
    
    return jsonify({
        'message': 'Progress updated',
        'success': True,
        'progress': progress,
        'status': status
    }), 200
