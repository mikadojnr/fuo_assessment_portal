from venv import logger
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from ..models.user import User, Course, student_courses
from ..models.assessment import Assessment, Question, QuestionOption, Submission, AssessmentDraft, StudentProgress
from ..models.lecturer import PlagiarismReport, StudentEngagement
from datetime import datetime, timedelta
import json
import random

lecturer_bp = Blueprint('lecturer', __name__)

@lecturer_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def lecturer_dashboard():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Lecturer access required'}), 403

    # Get courses taught by this lecturer
    taught_courses = user.lectured_courses

    # Active Assessments
    active_assessments = []
    for course in taught_courses:
        for assessment in course.assessments:
            if assessment.end_date >= datetime.utcnow():
                active_assessments.append(assessment.to_dict())

    # Completed Assessments (past deadline)
    completed_assessments = []
    for course in taught_courses:
        for assessment in course.assessments:
            if assessment.end_date < datetime.utcnow():
                completed_assessments.append(assessment.to_dict())

    # Recent Submissions (for assessments taught by this lecturer)
    recent_submissions = []
    for course in taught_courses:
        for assessment in course.assessments:
            for submission in assessment.submissions:
                recent_submissions.append(submission.to_dict())
    recent_submissions.sort(key=lambda x: x['submittedAt'], reverse=True)
    recent_submissions = recent_submissions[:5] # Limit to 5 recent

    # Plagiarism Alerts (for assessments taught by this lecturer)
    plagiarism_alerts = []
    for course in taught_courses:
        for assessment in course.assessments:
            for submission in assessment.submissions:
                if submission.plagiarism_score and submission.plagiarism_score > assessment.similarity_threshold:
                    plagiarism_alerts.append({
                        'submissionId': submission.id,
                        'assessmentTitle': assessment.title,
                        'studentName': submission.user.first_name + ' ' + submission.user.last_name,
                        'similarityScore': submission.plagiarism_score,
                        'submittedAt': submission.submitted_at.isoformat()
                    })
    plagiarism_alerts.sort(key=lambda x: x['submittedAt'], reverse=True)
    plagiarism_alerts = plagiarism_alerts[:5] # Limit to 5 recent

    # Student Engagement (Mocked for now)
    student_engagement_summary = {
        'totalStudents': sum(len(c.students) for c in taught_courses),
        'averageEngagementScore': random.uniform(60, 90),
        'topEngagedStudents': [
            {'name': 'Alice Smith', 'score': 95},
            {'name': 'Bob Johnson', 'score': 92}
        ],
        'lowEngagedStudents': [
            {'name': 'Charlie Brown', 'score': 45},
            {'name': 'Diana Prince', 'score': 50}
        ]
    }

    return jsonify({
        'activeAssessments': active_assessments,
        'completedAssessments': completed_assessments,
        'recentSubmissions': recent_submissions,
        'plagiarismAlerts': plagiarism_alerts,
        'studentEngagementSummary': student_engagement_summary
    }), 200

@lecturer_bp.route('/assessments/active', methods=['GET'])
@jwt_required()
def get_active_assessments():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Lecturer access required'}), 403

    active_assessments = []
    for course in user.lectured_courses:
        for assessment in course.assessments:
            if assessment.end_date >= datetime.utcnow():
                active_assessments.append(assessment.to_dict())
    
    return jsonify({'active': active_assessments}), 200

@lecturer_bp.route('/assessments/completed', methods=['GET'])
@jwt_required()
def get_completed_assessments():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Lecturer access required'}), 403

    completed_assessments = []
    for course in user.lectured_courses:
        for assessment in course.assessments:
            if assessment.end_date < datetime.utcnow():
                completed_assessments.append(assessment.to_dict())
    
    return jsonify({'completed': completed_assessments}), 200

@lecturer_bp.route('/assessments/drafts', methods=['GET'])
@jwt_required()
def get_lecturer_drafts():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Lecturer access required'}), 403

    drafts = [draft.to_dict() for draft in user.drafts]
    return jsonify({'drafts': drafts}), 200

@lecturer_bp.route('/assessments/<int:assessment_id>/submissions', methods=['GET'])
@jwt_required()
def get_submissions_for_assessment(assessment_id):
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Lecturer access required'}), 403

    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'message': 'Assessment not found'}), 404

    # Ensure the lecturer created this assessment or teaches its course
    if assessment.created_by != user.id and assessment.course_id not in [c.id for c in user.lectured_courses]:
        return jsonify({'message': 'Unauthorized to view submissions for this assessment'}), 403

    submissions = [sub.to_dict() for sub in assessment.submissions]
    return jsonify(submissions), 200

@lecturer_bp.route('/assessments/<int:assessment_id>/analytics', methods=['GET'])
@jwt_required()
def get_assessment_analytics(assessment_id):
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Lecturer access required'}), 403

    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'message': 'Assessment not found'}), 404

    # Ensure the lecturer created this assessment or teaches its course
    if assessment.created_by != user.id and assessment.course_id not in [c.id for c in user.lectured_courses]:
        return jsonify({'message': 'Unauthorized to view analytics for this assessment'}), 403

    # Mock analytics data for now
    scores = [sub.grade for sub in assessment.submissions if sub.grade is not None]
    
    class_average = sum(scores) / len(scores) if scores else 0
    
    score_distribution_labels = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%']
    score_distribution_data = [0, 0, 0, 0, 0]
    
    for score in scores:
        percentage = (score / assessment.total_marks) * 100 if assessment.total_marks else 0
        if 0 <= percentage <= 20:
            score_distribution_data[0] += 1
        elif 21 <= percentage <= 40:
            score_distribution_data[1] += 1
        elif 41 <= percentage <= 60:
            score_distribution_data[2] += 1
        elif 61 <= percentage <= 80:
            score_distribution_data[3] += 1
        elif 81 <= percentage <= 100:
            score_distribution_data[4] += 1

    # Mock topic mastery data
    topic_mastery_data = [
        {"topic": "Topic A", "score": random.randint(50, 100)},
        {"topic": "Topic B", "score": random.randint(50, 100)},
        {"topic": "Topic C", "score": random.randint(50, 100)},
        {"topic": "Topic D", "score": random.randint(50, 100)},
    ]

    # Mock plagiarism summary data
    plagiarism_summary = {
        'lowRisk': random.randint(5, 15),
        'mediumRisk': random.randint(1, 5),
        'highRisk': random.randint(0, 2)
    }
    
    # Mock NLP insights data
    nlp_insights = {
        'wordCloudMissingKeywords': ['concept', 'analysis', 'theory', 'framework'],
        'wordCloudExtraKeywords': ['filler', 'redundant', 'unnecessary'],
        'similarityCorrelation': [
            {'plagiarism': random.uniform(0, 100), 'score': random.uniform(0, 100)} for _ in range(20)
        ]
    }

    return jsonify({
        'classAverage': class_average,
        'scoreDistribution': {
            'labels': score_distribution_labels,
            'data': score_distribution_data
        },
        'topicMasteryData': topic_mastery_data,
        'totalSubmissions': len(scores),
        'averageTimeSpent': sum(s.time_spent_seconds for s in assessment.submissions if s.time_spent_seconds is not None) / len(assessment.submissions) if assessment.submissions else 0,
        'plagiarismSummary': plagiarism_summary, # Added mock data
        'nlpInsights': nlp_insights # Added mock data
    }), 200
    
@lecturer_bp.route('/plagiarism-alerts', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_plagiarism_alerts():
    """
    Fetch plagiarism alerts for submissions in the lecturer's courses.
    Returns submissions with plagiarism_score above the assessment's similarity_threshold.
    """
    try:
        # Handle CORS preflight request
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        if not user or user.role != 'lecturer':
            logger.warning(f"Unauthorized access to plagiarism alerts by user {current_user_uuid}")
            return jsonify({"msg": "Lecturer access required"}), 403

        # Get courses taught by the lecturer
        lecturer_course_ids = [course.id for course in user.lectured_courses]
        if not lecturer_course_ids:
            logger.info(f"No courses found for lecturer {current_user_uuid}")
            return jsonify({"plagiarismAlerts": []}), 200

        # Query submissions for the lecturer's courses with non-null plagiarism scores
        submissions = (
            Submission.query
            .join(Assessment, Submission.assessment_id == Assessment.id)
            .join(Course, Assessment.course_id == Course.id)
            .filter(
                Course.id.in_(lecturer_course_ids),
                Submission.plagiarism_score.isnot(None)
            )
            .all()
        )

        plagiarism_alerts = []
        for submission in submissions:
            assessment = submission.assessment
            # Use assessment's similarity_threshold or default to 30.0
            threshold = assessment.similarity_threshold or 30.0
            if submission.plagiarism_score >= threshold:
                risk_level = (
                    "high" if submission.plagiarism_score > 70
                    else "medium" if submission.plagiarism_score >= 40
                    else "low"
                )
                plagiarism_alerts.append({
                    "submissionId": submission.id,
                    "assessmentId": submission.assessment_id,
                    "assessmentTitle": assessment.title,
                    "courseCode": assessment.course.code if assessment.course else "N/A",
                    "studentName": f"{submission.user.first_name} {submission.user.last_name}" if submission.user else "N/A",
                    "plagiarismScore": submission.plagiarism_score,
                    "risk": risk_level,
                    "submittedAt": submission.submitted_at.isoformat() if submission.submitted_at else None
                })

        # Sort alerts by plagiarism score (descending) for priority
        plagiarism_alerts.sort(key=lambda x: x["plagiarismScore"], reverse=True)

        logger.info(f"Retrieved {len(plagiarism_alerts)} plagiarism alerts for lecturer {current_user_uuid}")
        return jsonify({"plagiarismAlerts": plagiarism_alerts}), 200

    except Exception as e:
        logger.error(f"Error fetching plagiarism alerts for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Failed to fetch plagiarism alerts: {str(e)}"}), 500
    
    
@lecturer_bp.route('/assessments', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_all_assessments():
    """
    Fetch all assessments for the lecturer's courses, including status and submission counts.
    """
    try:
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        if not user or user.role != 'lecturer':
            logger.warning(f"Unauthorized access to assessments by user {current_user_uuid}")
            return jsonify({"msg": "Lecturer access required"}), 403

        lecturer_course_ids = [course.id for course in user.lectured_courses] if user.lectured_courses else []
        if not lecturer_course_ids:
            logger.info(f"No courses found for lecturer {current_user_uuid}")
            return jsonify({"assessments": []}), 200

        assessments = (
            Assessment.query
            .join(Course, Assessment.course_id == Course.id)
            .filter(Course.id.in_(lecturer_course_ids))
            .all()
        )

        current_time = datetime.utcnow()
        assessments_data = []
        for assessment in assessments:
            # Compute status based on start_date and end_date
            start_date = assessment.start_date
            end_date = assessment.end_date
            status = (
                "upcoming" if start_date and start_date > current_time
                else "ongoing" if start_date and end_date and start_date <= current_time <= end_date
                else "completed"
            )

            # Count submissions for this assessment
            submission_count = Submission.query.filter_by(assessment_id=assessment.id).count()

            # Get total students in the course (assuming course.students is a relationship)
            total_students = len(assessment.course.students) if hasattr(assessment.course, 'students') and assessment.course.students else 0

            # Build assessment data, ensuring all fields are JSON-serializable
            assessment_data = {
                "id": assessment.id,
                "title": assessment.title or "Untitled",
                "course": assessment.course.code if assessment.course and hasattr(assessment.course, 'code') else "N/A",
                "courseId": assessment.course_id,
                "courseTitle": assessment.course.title if assessment.course and hasattr(assessment.course, 'title') else "N/A",
                "description": str(assessment.description) if assessment.description else "No description",
                "startDate": assessment.start_date.isoformat() if assessment.start_date and hasattr(assessment.start_date, 'isoformat') else None,
                "endDate": assessment.end_date.isoformat() if assessment.end_date and hasattr(assessment.end_date, 'isoformat') else None,
                "totalMarks": assessment.total_marks if assessment.total_marks is not None else 0,
                "durationMinutes": assessment.duration_minutes() if assessment.duration_minutes() is not None else 0,
                "type": assessment.type or "assessment",
                "cosineSimilarityThreshold": float(assessment.cosine_similarity_threshold) if assessment.cosine_similarity_threshold is not None else 0.0,
                "similarityThreshold": float(assessment.similarity_threshold) if assessment.similarity_threshold is not None else 0.0,
                "enablePlagiarismCheck": bool(assessment.enable_plagiarism_check),
                "ignoreQuotes": bool(assessment.ignore_quotes),
                "ignoreReferences": bool(assessment.ignore_references),
                "shuffleQuestions": bool(assessment.shuffle_questions),
                "shuffleOptions": bool(assessment.shuffle_options),
                "createdAt": assessment.created_at.isoformat() if assessment.created_at and hasattr(assessment.created_at, 'isoformat') else None,
                "status": status,
                "submissions": submission_count,
                "totalStudents": total_students
            }
            logger.debug(f"Assessment data for ID {assessment.id}: {assessment_data}")
            assessments_data.append(assessment_data)

        logger.info(f"Retrieved {len(assessments_data)} assessments for lecturer {current_user_uuid}")
        return jsonify({"assessments": assessments_data}), 200

    except Exception as e:
        logger.error(f"Error fetching assessments for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Failed to fetch assessments: {str(e)}"}), 500

@lecturer_bp.route('/questions', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_questions():
    """
    Get all questions for a lecturer's assessments.
    Supports filtering by assessment_id, question_type, and difficulty.
    """
    try:
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user:
            logger.warning(f"User not found: {current_user_uuid}")
            return jsonify({'message': 'User not found'}), 404

        if user.role != 'lecturer':
            logger.warning(f"Unauthorized access to questions by user {current_user_uuid}")
            return jsonify({'message': 'Access denied. Lecturer role required.'}), 403

        lecturer_course_ids = [course.id for course in user.lectured_courses] if user.lectured_courses else []
        if not lecturer_course_ids:
            logger.info(f"No courses found for lecturer {current_user_uuid}")
            return jsonify({'questions': []}), 200

        # Get query parameters for filtering
        assessment_id = request.args.get('assessment_id', type=int)
        question_type = request.args.get('question_type')
        difficulty = request.args.get('difficulty')

        # Join Question with Assessment and Course to filter by lecturer's courses
        query = (
            Question.query
            .join(Assessment, Question.assessment_id == Assessment.id)
            .join(Course, Assessment.course_id == Course.id)
            .filter(Course.id.in_(lecturer_course_ids))
        )

        if assessment_id:
            query = query.filter(Question.assessment_id == assessment_id)
        if question_type:
            query = query.filter(Question.type == question_type)
        if difficulty:
            query = query.filter(Question.difficulty == difficulty)

        questions = query.all()

        questions_data = []
        for question in questions:
            try:
                keywords = json.loads(question.keywords) if question.keywords else []
            except json.JSONDecodeError:
                keywords = []
                logger.warning(f"Invalid JSON in keywords for question {question.id}")

            question_data = {
                'id': question.id,
                'text': str(question.text) if question.text else "No question text",
                'type': question.type or "unknown",
                'difficulty': question.difficulty or "medium",
                'marks': float(question.marks) if question.marks is not None else 0.0,
                'lastUsed': question.created_at.isoformat() if question.created_at else None,
                'options': [option.to_dict() for option in question.options] if question.type == 'mcq' else [],
                'modelAnswer': str(question.model_answer) if question.model_answer else None,
                'keywords': keywords,
                'fileTypes': [],  # Not in model, included for compatibility
                'maxFileSize': None,  # Not in model, included for compatibility
                'courseId': question.assessment.course_id if question.assessment else None,
                'courseCode': question.assessment.course.code if question.assessment and question.assessment.course else "N/A",
                'assessmentId': question.assessment_id,
                'assessmentTitle': question.assessment.title if question.assessment else "N/A"
            }
            logger.debug(f"Question data for ID {question.id}: {question_data}")
            questions_data.append(question_data)

        logger.info(f"Retrieved {len(questions_data)} questions for lecturer {current_user_uuid}")
        return jsonify({'questions': questions_data}), 200

    except Exception as e:
        logger.error(f"Error fetching questions for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({'message': f'Failed to fetch questions: {str(e)}'}), 500

@lecturer_bp.route('/questions', methods=['POST'])
@jwt_required()
def create_question():
    """
    Create a new question for an assessment.
    """
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user:
            logger.warning(f"User not found: {current_user_uuid}")
            return jsonify({'message': 'User not found'}), 404

        if user.role != 'lecturer':
            logger.warning(f"Unauthorized access to create question by user {current_user_uuid}")
            return jsonify({'message': 'Access denied. Lecturer role required.'}), 403

        data = request.get_json()
        if not data:
            logger.warning(f"No data provided for question creation by user {current_user_uuid}")
            return jsonify({'message': 'Request body is empty'}), 400

        # Validate required fields
        required_fields = ['text', 'type', 'difficulty', 'marks', 'assessment_id']
        for field in required_fields:
            if field not in data:
                logger.warning(f"Missing required field {field} in question creation by user {current_user_uuid}")
                return jsonify({'message': f'{field} is required'}), 400

        # Verify assessment belongs to lecturer's course
        assessment = Assessment.query.filter_by(id=data['assessment_id']).first()
        if not assessment:
            logger.warning(f"Assessment {data['assessment_id']} not found for user {current_user_uuid}")
            return jsonify({'message': 'Assessment not found'}), 404
        if assessment.course.lecturer_id != user.id:
            logger.warning(f"Assessment {data['assessment_id']} not owned by lecturer {current_user_uuid}")
            return jsonify({'message': 'Unauthorized to add question to this assessment'}), 403

        # Validate question type
        valid_types = ['mcq', 'essay', 'short_answer']
        if data['type'] not in valid_types:
            logger.warning(f"Invalid question type {data['type']} by user {current_user_uuid}")
            return jsonify({'message': f'Question type must be one of {valid_types}'}), 400

        # Validate options for MCQ
        options = data.get('options', [])
        if data['type'] == 'mcq' and (not options or not isinstance(options, list) or not any(opt.get('isCorrect') for opt in options)):
            logger.warning(f"Invalid or missing options for MCQ by user {current_user_uuid}")
            return jsonify({'message': 'MCQ questions must have at least one correct option'}), 400

        # Validate and serialize keywords
        keywords = data.get('keywords', [])
        if not isinstance(keywords, list):
            logger.warning(f"Invalid keywords format by user {current_user_uuid}")
            return jsonify({'message': 'Keywords must be a list'}), 400
        keywords_json = json.dumps(keywords) if keywords else None

        # Create new question
        question = Question(
            assessment_id=data['assessment_id'],
            text=data['text'],
            type=data['type'],
            difficulty=data['difficulty'],
            marks=float(data['marks']),
            created_by=user.id,
            created_at=datetime.utcnow(),
            word_limit=data.get('wordLimit') if data['type'] == 'essay' else None,
            model_answer=data.get('modelAnswer') if data['type'] == 'essay' else None,
            keywords=keywords_json
        )
        db.session.add(question)
        db.session.flush()  # Get question.id for options

        # Create options for MCQ
        if data['type'] == 'mcq' and options:
            for opt in options:
                option = QuestionOption(
                    question_id=question.id,
                    text=opt['text'],
                    is_correct=opt.get('isCorrect', False)
                )
                db.session.add(option)

        db.session.commit()

        # Prepare response
        question_data = {
            'id': question.id,
            'text': str(question.text),
            'type': question.type,
            'difficulty': question.difficulty,
            'marks': float(question.marks),
            'lastUsed': question.created_at.isoformat() if question.created_at else None,
            'options': [option.to_dict() for option in question.options] if question.type == 'mcq' else [],
            'modelAnswer': str(question.model_answer) if question.model_answer else None,
            'keywords': json.loads(question.keywords) if question.keywords else [],
            'fileTypes': [],  # Not in model, included for compatibility
            'maxFileSize': None,  # Not in model, included for compatibility
            'courseId': question.assessment.course_id if question.assessment else None,
            'courseCode': question.assessment.course.code if question.assessment and question.assessment.course else "N/A",
            'assessmentId': question.assessment_id,
            'assessmentTitle': question.assessment.title if question.assessment else "N/A"
        }

        logger.info(f"Question {question.id} created by lecturer {current_user_uuid}")
        return jsonify({
            'message': 'Question created successfully',
            'question': question_data
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating question for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({'message': f'Failed to create question: {str(e)}'}), 500

@lecturer_bp.route('/questions/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    """
    Update an existing question.
    """
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user or user.role != 'lecturer':
            logger.warning(f"Unauthorized access to update question {question_id} by user {current_user_uuid}")
            return jsonify({'message': 'Unauthorized'}), 403

        question = Question.query.get(question_id)
        if not question:
            logger.warning(f"Question {question_id} not found for user {current_user_uuid}")
            return jsonify({'message': 'Question not found'}), 404

        # Verify question belongs to lecturer's course
        if question.assessment.course.lecturer_id != user.id:
            logger.warning(f"Question {question_id} not owned by lecturer {current_user_uuid}")
            return jsonify({'message': 'Unauthorized to update this question'}), 403

        data = request.get_json()
        if not data:
            logger.warning(f"No data provided for question update by user {current_user_uuid}")
            return jsonify({'message': 'Request body is empty'}), 400

        # Validate required fields
        required_fields = ['text', 'type', 'difficulty', 'marks']
        for field in required_fields:
            if field not in data:
                logger.warning(f"Missing required field {field} in question update by user {current_user_uuid}")
                return jsonify({'message': f'{field} is required'}), 400

        # Validate question type
        valid_types = ['mcq', 'essay', 'short_answer']
        if data['type'] not in valid_types:
            logger.warning(f"Invalid question type {data['type']} by user {current_user_uuid}")
            return jsonify({'message': f'Question type must be one of {valid_types}'}), 400

        # Validate options for MCQ
        options = data.get('options', [])
        if data['type'] == 'mcq' and (not options or not isinstance(options, list) or not any(opt.get('isCorrect') for opt in options)):
            logger.warning(f"Invalid or missing options for MCQ update by user {current_user_uuid}")
            return jsonify({'message': 'MCQ questions must have at least one correct option'}), 400

        # Validate and serialize keywords
        keywords = data.get('keywords', [])
        if not isinstance(keywords, list):
            logger.warning(f"Invalid keywords format by user {current_user_uuid}")
            return jsonify({'message': 'Keywords must be a list'}), 400
        keywords_json = json.dumps(keywords) if keywords else None

        # Update question
        question.text = data['text']
        question.type = data['type']
        question.difficulty = data['difficulty']
        question.marks = float(data['marks'])
        question.word_limit = data.get('wordLimit') if data['type'] == 'essay' else None
        question.model_answer = data.get('modelAnswer') if data['type'] == 'essay' else None
        question.keywords = keywords_json
        question.created_at = datetime.utcnow()

        # Update options for MCQ
        if data['type'] == 'mcq' and options:
            # Delete existing options
            QuestionOption.query.filter_by(question_id=question.id).delete()
            # Add new options
            for opt in options:
                option = QuestionOption(
                    question_id=question.id,
                    text=opt['text'],
                    is_correct=opt.get('isCorrect', False)
                )
                db.session.add(option)

        db.session.commit()

        # Prepare response
        question_data = {
            'id': question.id,
            'text': str(question.text),
            'type': question.type,
            'difficulty': question.difficulty,
            'marks': float(question.marks),
            'lastUsed': question.created_at.isoformat() if question.created_at else None,
            'options': [option.to_dict() for option in question.options] if question.type == 'mcq' else [],
            'modelAnswer': str(question.model_answer) if question.model_answer else None,
            'keywords': json.loads(question.keywords) if question.keywords else [],
            'fileTypes': [],  # Not in model, included for compatibility
            'maxFileSize': None,  # Not in model, included for compatibility
            'courseId': question.assessment.course_id if question.assessment else None,
            'courseCode': question.assessment.course.code if question.assessment and question.assessment.course else "N/A",
            'assessmentId': question.assessment_id,
            'assessmentTitle': question.assessment.title if question.assessment else "N/A"
        }

        logger.info(f"Question {question_id} updated by lecturer {current_user_uuid}")
        return jsonify({
            'message': 'Question updated successfully',
            'question': question_data
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating question {question_id} for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({'message': f'Failed to update question: {str(e)}'}), 500

@lecturer_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    """
    Delete a question from an assessment.
    """
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user or user.role != 'lecturer':
            logger.warning(f"Unauthorized access to delete question {question_id} by user {current_user_uuid}")
            return jsonify({'message': 'Unauthorized'}), 403

        question = Question.query.get(question_id)
        if not question:
            logger.warning(f"Question {question_id} not found for user {current_user_uuid}")
            return jsonify({'message': 'Question not found'}), 404

        # Verify question belongs to lecturer's course
        if question.assessment.course.lecturer_id != user.id:
            logger.warning(f"Question {question_id} not owned by lecturer {current_user_uuid}")
            return jsonify({'message': 'Unauthorized to delete this question'}), 403

        db.session.delete(question)
        db.session.commit()

        logger.info(f"Question {question_id} deleted by lecturer {current_user_uuid}")
        return jsonify({'message': f'Question {question_id} deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting question {question_id} for user {current_user_uuid}: {str(e)}", exc_info=True)
        return jsonify({'message': f'Failed to delete question: {str(e)}'}), 500
    

@lecturer_bp.route('/students', methods=['GET'])
@jwt_required()
def get_all_students():
    """Get all students associated with the lecturer's courses."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Unauthorized'}), 403

    # Fetch courses taught by the lecturer
    lecturer_courses = Course.query.filter_by(lecturer_id=user.id).all()
    course_ids = [course.id for course in lecturer_courses]

    if not course_ids:
        return jsonify([]), 200

    # Fetch students enrolled in these courses
    students = (
        User.query
        .join(student_courses, User.id == student_courses.c.student_id)
        .filter(student_courses.c.course_id.in_(course_ids))
        .filter(User.role == 'student')
        .all()
    )

    # Prepare response
    students_data = []
    for student in students:
        # Get enrolled courses for this student
        enrolled_courses = [
            course.code for course in Course.query
            .join(student_courses, Course.id == student_courses.c.course_id)
            .filter(student_courses.c.student_id == student.id)
            .all()
        ]

        # Calculate total assessments taken and average score
        submissions = Submission.query.filter_by(user_id=student.id).all()
        total_assessments = len(submissions)
        average_score = (
            sum(sub.grade for sub in submissions if sub.grade is not None) / total_assessments
            if total_assessments > 0 else 0.0
        )

        # Determine status based on last activity (e.g., active if engaged in last 30 days)
        engagement = StudentEngagement.query.filter_by(user_id=student.id).first()
        status = (
            'Active'
            if engagement and engagement.last_active >= datetime.utcnow() - timedelta(days=30)
            else 'Inactive'
        )

        students_data.append({
            'id': student.id,
            'firstName': student.first_name,
            'lastName': student.last_name,
            'email': student.email,
            'studentId': student.university_id,
            'courses': enrolled_courses,
            'enrollmentDate': student.created_at.isoformat(),
            'status': status,
            'totalAssessmentsTaken': total_assessments,
            'averageScore': round(average_score, 1)
        })

    return jsonify(students_data), 200

@lecturer_bp.route('/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_details(student_id):
    """Get detailed information for a single student."""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({'message': 'Unauthorized'}), 403

    # Verify student exists and is enrolled in lecturer's courses
    student = User.query.filter_by(id=student_id, role='student').first()
    if not student:
        return jsonify({'message': 'Student not found'}), 404

    # Check if student is enrolled in any of the lecturer's courses
    lecturer_courses = Course.query.filter_by(lecturer_id=user.id).all()
    course_ids = [course.id for course in lecturer_courses]
    enrolled_course_ids = [
        course.id for course in Course.query
        .join(student_courses, Course.id == student_courses.c.course_id)
        .filter(student_courses.c.student_id == student.id)
        .all()
    ]
    if not any(cid in course_ids for cid in enrolled_course_ids):
        return jsonify({'message': 'Student not enrolled in your courses'}), 403

    # Get enrolled courses
    enrolled_courses = [
        {
            'id': course.id,
            'code': course.code,
            'name': course.title
        }
        for course in Course.query
        .join(student_courses, Course.id == student_courses.c.course_id)
        .filter(student_courses.c.student_id == student.id)
        .all()
    ]

    # Get assessment history
    submissions = (
        Submission.query
        .join(Assessment, Submission.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .filter(Submission.user_id == student.id)
        .all()
    )
    assessment_history = [
        {
            'id': sub.id,
            'title': sub.assessment.title,
            'course': sub.assessment.course.code,
            'score': sub.grade,
            'maxScore': sub.assessment.total_marks,
            'date': sub.submitted_at.isoformat()
        }
        for sub in submissions
    ]

    # Get engagement metrics
    engagement = StudentEngagement.query.filter_by(user_id=student.id).first()
    engagement_metrics = {
        'loginFrequency': (
            'Daily' if engagement and engagement.login_count > 20
            else 'Weekly' if engagement and engagement.login_count > 5
            else 'Rare'
        ),
        'averageTimeSpent': (
            f"{engagement.submission_count * 2 if engagement else 0} hours/week"
        ),
        'completedAssessments': len(submissions),
        'missedDeadlines': sum(1 for sub in submissions if sub.is_late)
    }

    # Prepare response
    student_details = {
        'id': student.id,
        'firstName': student.first_name,
        'lastName': student.last_name,
        'email': student.email,
        'studentId': student.university_id,
        'department': student.department.name if student.department else 'N/A',
        'enrollmentDate': student.created_at.isoformat(),
        'status': (
            'Active'
            if engagement and engagement.last_active >= datetime.utcnow() - timedelta(days=30)
            else 'Inactive'
        ),
        'enrolledCourses': enrolled_courses,
        'assessmentHistory': assessment_history,
        'engagementMetrics': engagement_metrics
    }

    return jsonify(student_details), 200