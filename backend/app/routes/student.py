from venv import logger
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User, Course
from app.models.assessment import Assessment, Question, Submission, StudentProgress
from app import db
from sqlalchemy import desc, func
from datetime import datetime, timedelta
import random # For mock data

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
        'performanceData': performance_data,
        'recentResults': recent_results,
        'notifications': notifications
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
            
            # Check if student has submitted this assessment
            submission = Submission.query.filter_by(
                user_id=user.id,
                assessment_id=assessment.id
            ).first()
            
            # Calculate days until deadline
            days_remaining = (assessment.end_date - datetime.utcnow()).days
            
            # Determine status and progress            
            status = "Not Started"
            progress_percent = 0
            
            if submission:
                status = "Submitted"
                progress_percent = 100
            elif progress:
                status = progress.status.replace('_', ' ').title()
                progress_percent = progress.progress
            
            assessments.append({
                'id': assessment.id,
                'courseCode': assessment.course.code,
                'courseTitle': assessment.course.title,
                'title': assessment.title,
                'deadline': assessment.end_date.isoformat(),
                'type': assessment.type,
                'totalMarks': assessment.total_marks,
                'progress': progress_percent,
                'status': status,
                'daysRemaining': days_remaining,
                'submitted': bool(submission)  # True if submitted
            })
    except Exception as e:
        print(f"Error fetching assessments: {str(e)}")
    
    return assessments



def get_performance_data(user_id):
    """Get performance data for a student over the last 6 weeks."""
    try:
        # Initialize data structures
        labels = []
        scores = []
        class_average = []

        # Get submissions from the last 6 weeks
        six_weeks_ago = datetime.utcnow() - timedelta(weeks=6)
        submissions = Submission.query.filter(
            Submission.user_id == user_id,
            Submission.submitted_at > six_weeks_ago
        ).order_by(Submission.submitted_at).all()

        if not submissions:
            logger.info(f"No submissions found for user {user_id} in the last 6 weeks")
            return {
                'labels': [],
                'scores': [],
                'classAverage': []
            }

        # Group submissions by week
        weeks = {}
        for submission in submissions:
            # Use ISO week number with year to avoid cross-year issues
            week_key = submission.submitted_at.strftime('%Y-W%W')
            if week_key not in weeks:
                weeks[week_key] = {
                    'scores': [],
                    'assessment_ids': set(),
                    'class_scores': []
                }
            
            # Add student's grade if available
            if submission.grade is not None:
                weeks[week_key]['scores'].append(submission.grade)
                weeks[week_key]['assessment_ids'].add(submission.assessment_id)
            else:
                logger.debug(f"Submission {submission.id} for user {user_id} has no grade")

        # Calculate class averages for each assessment
        for week_key, data in weeks.items():
            week_class_scores = []
            for assessment_id in data['assessment_ids']:
                # Query all submissions for this assessment
                assessment_submissions = Submission.query.filter(
                    Submission.assessment_id == assessment_id,
                    Submission.submitted_at > six_weeks_ago
                ).all()
                
                # Calculate average grade for the assessment
                valid_grades = [s.grade for s in assessment_submissions if s.grade is not None]
                if valid_grades:
                    assessment_avg = sum(valid_grades) / len(valid_grades)
                    week_class_scores.append(assessment_avg)
                else:
                    logger.debug(f"No valid grades for assessment {assessment_id} in week {week_key}")

            # Store data for the week
            labels.append(week_key)
            scores.append(sum(data['scores']) / len(data['scores']) if data['scores'] else 0)
            class_average.append(sum(week_class_scores) / len(week_class_scores) if week_class_scores else 0)

        # Sort by week_key (year-week)
        sorted_data = sorted(zip(labels, scores, class_average), key=lambda x: x[0])
        labels, scores, class_average = zip(*sorted_data) if sorted_data else ([], [], [])

        logger.info(f"Performance data retrieved for user {user_id}: {len(labels)} weeks")
        return {
            'labels': list(labels),
            'scores': list(scores),
            'classAverage': list(class_average)
        }

    except Exception as e:
        logger.error(f"Error fetching performance data for user {user_id}: {str(e)}", exc_info=True)
        return {
            'labels': [],
            'scores': [],
            'classAverage': []
        }
        
def get_recent_results(user_id):
    """Get the 5 most recent graded results for a student."""
    try:
        results = []
        # Get the 5 most recent submissions with a non-null grade
        submissions = Submission.query.filter(
            Submission.user_id == user_id,
            Submission.grade.isnot(None)  # Filter for graded submissions
        ).order_by(Submission.submitted_at.desc()).limit(5).all()

        if not submissions:
            logger.info(f"No graded submissions found for user {user_id}")
            return []

        for submission in submissions:
            assessment = Assessment.query.get(submission.assessment_id)
            if not assessment:
                logger.warning(f"Assessment {submission.assessment_id} not found for submission {submission.id}")
                continue

            course = Course.query.get(assessment.course_id) if assessment.course_id else None
            course_code = course.code if course else "Unknown"

            results.append({
                'id': submission.id,
                'assessment': assessment.title,
                'course': course_code,
                'dateSubmitted': submission.submitted_at.strftime('%Y-%m-%d'),
                'score': submission.grade,  # Use grade instead of score
                'plagiarismCheck': submission.plagiarism_score or 0,
                'feedback': submission.lecturer_comments or "No feedback provided."
            })

        logger.info(f"Retrieved {len(results)} recent results for user {user_id}")
        return results

    except Exception as e:
        logger.error(f"Error fetching recent results for user {user_id}: {str(e)}", exc_info=True)
        return []

def get_notifications(user_id):
    """Get notifications for a student."""
    # In a real application, you would fetch this from the database
    # For now, we'll return mock data
    return [
        {
            'id': 1,
            'type': 'deadline',
            'title': 'Assignment Deadline Extended',
            'message': 'The deadline for CSC 405 has been extended to 15th.',
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


@student_bp.route('/dashboard-summary', methods=['GET'])
@jwt_required()
def dashboard_summary():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'student':
        return jsonify({"msg": "Student access required"}), 403

    # Total assessments available
    total_assessments = Assessment.query.filter_by(is_published=True).count()

    # Assessments completed
    completed_assessments = Submission.query.filter_by(user_id=user.id).count()

    # Recent results (last 3 completed assessments)
    recent_results = Submission.query.filter_by(user_id=user.id)\
        .order_by(desc(Submission.submitted_at))\
        .limit(3).all()

    results_summary = []
    for submission in recent_results:
        assessment = Assessment.query.get(submission.assessment_id)
        if assessment:
            results_summary.append({
                "assessmentTitle": assessment.title,
                "score": submission.grade,
                "totalMarks": assessment.total_marks,
                "dateSubmitted": submission.submitted_at.strftime("%Y-%m-%d %H:%M"),
                "feedbackSummary": submission.lecturer_comments or "No specific feedback yet.",
                "plagiarismScore": submission.plagiarism_score or 0
            })

    # In-progress assessments
    in_progress_assessments = StudentProgress.query.filter_by(user_id=user.id, status='in_progress').count()

    return jsonify({
        "totalAssessments": total_assessments,
        "completedAssessments": completed_assessments,
        "inProgressAssessments": in_progress_assessments,
        "recentResults": results_summary
    }), 200

@student_bp.route('/available-assessments', methods=['GET'])
@jwt_required()
def get_available_assessments():
    """
    Get all available assessments for the authenticated student.
    """
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        if not user or user.role != 'student':
            logger.warning(f"Unauthorized access by user {current_user_uuid} to available assessments")
            return jsonify({"msg": "Student access required"}), 403

        # Get assessments that are published, within their active date range,
        # and not yet submitted by the student.
        now = datetime.utcnow()
        available_assessments_query = Assessment.query.filter(
            # Assessment.is_published == True,  # Uncomment if is_published exists
            Assessment.start_date <= now,
            Assessment.end_date >= now,
            ~Assessment.submissions.any(user_id=user.id)  # Exclude already submitted
        )

        assessments_data = []
        for assessment in available_assessments_query.all():
            # Get student's current progress for this assessment
            progress_record = StudentProgress.query.filter_by(
                user_id=user.id,
                assessment_id=assessment.id
            ).first()
            
            # Use Assessment.to_dict for consistency, then add custom fields
            assessment_dict = assessment.to_dict()
            assessment_dict.update({
                "totalQuestions": len(assessment.questions),
                "progress": progress_record.progress if progress_record else 0,
                "status": progress_record.status if progress_record else 'not_started',
                "deadline": assessment.end_date.isoformat()  # Keep for frontend consistency
            })
            assessments_data.append(assessment_dict)

        logger.info(f"Retrieved {len(assessments_data)} available assessments for user {current_user_uuid}")
        return jsonify({'assessments': assessments_data}), 200

    except Exception as e:
        logger.error(f"Error fetching available assessments for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({'msg': f'Failed to fetch available assessments: {str(e)}'}), 500
    
@student_bp.route('/assessments/<int:assessment_id>/attempt', methods=['POST'])
@jwt_required()
def save_assessment_progress(assessment_id):
    """Save student's progress on an assessment."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'student':
        return jsonify({'message': 'Student access required'}), 403

    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'message': 'Assessment not found'}), 404

    data = request.get_json()
    progress_percentage = data.get('progress', 0)
    current_answers = data.get('answers', {})
    flagged_questions = data.get('flaggedQuestions', [])
    time_spent = data.get('timeSpentSeconds', 0)

    progress_record = StudentProgress.query.filter_by(
        user_id=user.id,
        assessment_id=assessment_id
    ).first()

    if progress_record:
        progress_record.progress = progress_percentage
        progress_record.answers_json = current_answers
        progress_record.flagged_questions_json = flagged_questions
        progress_record.time_spent_seconds = time_spent
        progress_record.last_accessed = datetime.utcnow()
        progress_record.status = 'in_progress' if progress_percentage < 100 else 'completed'
    else:
        progress_record = StudentProgress(
            user_id=user.id,
            assessment_id=assessment_id,
            progress=progress_percentage,
            answers_json=current_answers,
            flagged_questions_json=flagged_questions,
            time_spent_seconds=time_spent,
            status='in_progress'
        )
        db.session.add(progress_record)

    db.session.commit()
    return jsonify({'message': 'Progress saved successfully', 'progress': progress_record.to_dict()}), 200

@student_bp.route('/assessments/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment_for_student(assessment_id):
    """Get assessment details for a student, including their progress if any."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'student':
        return jsonify({'message': 'Student access required'}), 403

    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'message': 'Assessment not found'}), 404

    # Check if student is registered for the course
    if assessment.course not in user.registered_courses:
        return jsonify({'message': 'You are not registered for this course.'}), 403

    # Check if assessment is active
    now = datetime.utcnow()
    if not (assessment.start_date <= now and assessment.end_date >= now):
        return jsonify({'message': 'Assessment is not currently active or has expired.'}), 400

    # Check if student has already submitted
    existing_submission = Submission.query.filter_by(
        user_id=user.id,
        assessment_id=assessment_id
    ).first()
    if existing_submission:
        return jsonify({
            'isSubmitted': True,
            'submittedAt': existing_submission.submitted_at.isoformat(),
            'message': 'You have already submitted this assessment. View your results.'
        }), 200

    # Get student's current progress
    progress_record = StudentProgress.query.filter_by(
        user_id=user.id,
        assessment_id=assessment_id
    ).first()

    assessment_data = assessment.to_dict()
    
    # Add questions to the assessment data, potentially shuffling them
    questions_data = [q.to_dict() for q in assessment.questions]
    if assessment.shuffle_questions:
        random.shuffle(questions_data)
    
    # If MCQ, shuffle options if enabled
    for q in questions_data:
        if q['type'] == 'mcq' and assessment.shuffle_options:
            if 'options' in q and q['options']:
                random.shuffle(q['options'])

    assessment_data['questions'] = questions_data

    return jsonify({
        'isSubmitted': False,
        'assessment': assessment_data,
        'progress': progress_record.to_dict() if progress_record else None
    }), 200

@student_bp.route('/results/list', methods=['GET'])
@jwt_required()
def get_student_results_list():
    """Get a list of all submitted assessments for the current student."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'student':
        return jsonify({'message': 'Student access required'}), 403

    submissions_list = []
    for submission in user.submissions:
        assessment = submission.assessment
        if assessment:
            submissions_list.append({
                'id': submission.id,
                'assessmentTitle': assessment.title,
                'courseCode': assessment.course.code if assessment.course else 'N/A',
                'dateSubmitted': submission.submitted_at.isoformat(),
                'grade': submission.grade, # Use 'grade' from Submission model
                'totalMarks': assessment.total_marks,
                'feedbackSummary': submission.lecturer_comments or "No specific comments yet.",
                'plagiarismScore': submission.plagiarism_score or 0
            })
    
    # Sort by submitted date, most recent first
    submissions_list.sort(key=lambda x: x['dateSubmitted'], reverse=True)

    return jsonify(submissions_list), 200
