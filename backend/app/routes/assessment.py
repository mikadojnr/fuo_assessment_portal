from venv import logger
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from ..models.user import Course
from ..models.user import User
from ..models.assessment import Assessment, AssessmentDraft, Question, QuestionOption, StudentProgress, Submission
from datetime import datetime
import json

from ..utils.nlp_grader import calculate_essay_score # Corrected import
from ..utils.plagiarism_checker import check_plagiarism

from sqlalchemy.exc import SQLAlchemyError

# Create a Blueprint for assessment routes
assessment_bp = Blueprint('assessment', __name__)


@assessment_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_assessment():
    """Submit completed assessment."""
    
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role != 'student':
        return jsonify({'error': 'Student access required'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    assessment_id = data.get('assessmentId')
    answers_data = data.get('answers', [])
    flagged_questions_data = data.get('flaggedQuestions', [])
    time_spent_seconds = data.get('timeSpentSeconds', 0)

    if not assessment_id:
        return jsonify({'error': 'Assessment ID is required'}), 400

    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'error': 'Assessment not found'}), 404

    # Check if already submitted
    existing_submission = Submission.query.filter_by(
        user_id=user.id,
        assessment_id=assessment_id
    ).first()

    if existing_submission:
        return jsonify({
            'error': 'Assessment already submitted',
            'submittedAt': existing_submission.submitted_at.isoformat()
        }), 403

    total_score_earned = 0
    plagiarism_scores_list = []
    essay_contents_for_plagiarism = []

    # Convert assessment.questions to a dictionary for easy lookup
    assessment_questions_map = {q.id: q for q in assessment.questions}

    for ans_data_item in answers_data:
        question_id = ans_data_item.get('questionId')
        question_data = assessment_questions_map.get(question_id)

        if not question_data:
            return jsonify({'error': f'Question ID {question_id} not found in assessment'}), 400

        question_type = question_data.type
        max_mark = question_data.marks  # Use maxMark as per assessment data

        if question_type == 'mcq':
            selected_option_index = ans_data_item.get('selectedOption')
            options = question_data.options  # Already a list of dicts

            if selected_option_index is None or not isinstance(selected_option_index, int):
                continue  # Skip invalid or missing MCQ answers

            if 0 <= selected_option_index < len(options):
                if options[selected_option_index].is_correct:
                    total_score_earned += max_mark
            else:
                return jsonify({'error': f'Invalid selectedOption {selected_option_index} for question {question_id}'}), 400

        elif question_type == 'essay':
            student_answer_content = ans_data_item.get('content')
            model_answer_content = question_data.model_answer
            
            # Handle keywords as JSON or list of strings/objects
            keywords = question_data.keywords
            if isinstance(keywords, str):
                try:
                    keywords = json.loads(keywords)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse keywords for question {question_id}")
                    return jsonify({'error': f'Invalid keywords format for question {question_id}'}), 500
            keywords = [kw.get('text', kw) if isinstance(kw, dict) else kw for kw in (keywords or [])]
            word_limit = question_data.word_limit  # Use word_limit as per schema assumption

            if student_answer_content and model_answer_content:
                try:
                    essay_grade_result = calculate_essay_score(
                        student_answer_content,
                        model_answer_content,
                        keywords,
                        max_mark,
                        word_limit
                    )
                    total_score_earned += essay_grade_result['score']
                    essay_contents_for_plagiarism.append(student_answer_content)
                except Exception as e:
                    return jsonify({'error': f'Error grading essay for question {question_id}: {str(e)}'}), 500

    # Perform plagiarism check on collected essay answers
    overall_plagiarism_score = 0
    if essay_contents_for_plagiarism:
        combined_essay_text = " ".join(essay_contents_for_plagiarism)
        other_submissions = Submission.query.filter(
            Submission.assessment_id == assessment_id,
            Submission.user_id != user.id
        ).all()
        overall_plagiarism_score = check_plagiarism(None, combined_essay_text, other_submissions)['similarityScore']

    new_submission = Submission(
        user_id=user.id,
        assessment_id=assessment_id,
        submitted_at=datetime.utcnow(),
        answers_json=json.dumps(answers_data),
        flagged_questions_json=json.dumps(flagged_questions_data),
        grade=total_score_earned,
        plagiarism_score=overall_plagiarism_score,
        lecturer_comments=None,
        flagged_for_review=len(flagged_questions_data) > 0,
        is_late=(datetime.utcnow() > assessment.end_date),
    )
    
    db.session.add(new_submission)
    StudentProgress.query.filter_by(user_id=user.id, assessment_id=assessment_id).delete()
        
        
    try:
        db.session.commit()

        return jsonify({
            'message': 'Assessment submitted successfully',
            'success': True,
            'submissionId': new_submission.id
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Failed to submit assessment: {str(e)}'
        }), 500


# Get all assessments
@assessment_bp.route('', methods=['GET'])
@jwt_required()
def get_assessments():
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if user.role == 'lecturer':
        # Get courses taught by the lecturer
        courses = Course.query.filter_by(lecturer_id=user.id).all()
        course_ids = [course.id for course in courses]
        
        # Get assessments for these courses
        assessments = Assessment.query.filter(Assessment.course_id.in_(course_ids)).all()
    else:
        # Get courses the student is enrolled in
        student_courses = user.registered_courses.all()
        course_ids = [course.id for course in student_courses]
        
        # Get assessments for these courses
        assessments = Assessment.query.filter(Assessment.course_id.in_(course_ids)).all()
    
    return jsonify([assessment.to_dict() for assessment in assessments]), 200

# Fetch specific assessment
@assessment_bp.route('/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        assessment = Assessment.query.get_or_404(assessment_id)
        
        # For students, check if they are enrolled in the course
        if user.role == 'student':
            student_courses = user.registered_courses.all()
            course_ids = [course.id for course in student_courses]
            if assessment.course_id not in course_ids:
                return jsonify({'error': 'You are not enrolled in this course'}), 403
            
            # Check if the user has already submitted this assessment
            submission = Submission.query.filter_by(
                user_id=user.id,
                assessment_id=assessment_id
            ).first()
            if submission:
                return jsonify({
                    'isSubmitted': True,
                    'submittedAt': submission.submitted_at.isoformat(),
                    'message': 'Assessment already submitted'
                }), 200
        
        # Include questions in the response
        assessment_data = assessment.to_dict()
        assessment_data['questions'] = [question.to_dict() for question in assessment.questions]
        
        return jsonify({
            'isSubmitted': False,
            'assessment': assessment_data
        }), 200
    
    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error: ' + str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Unexpected error: ' + str(e)}), 500

@assessment_bp.route('', methods=['POST'])
@jwt_required()
def create_assessment():
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

            
        if user.role != 'lecturer':
            return jsonify({'error': 'Only lecturers can create assessments'}), 403

        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'courseId', 'startDate', 'endDate', 'questions']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        if len(data['questions']) == 0:
            return jsonify({'error': 'At least one question required'}), 400
        
        
         # Date validation
        if datetime.fromisoformat(data['startDate']) >= datetime.fromisoformat(data['endDate']):
            return jsonify({'error': 'End date must be after start date'}), 400

        # Course validation
        course = Course.query.get(data['courseId'])
        if not course or course.lecturer_id != user.id:
            return jsonify({'error': 'Invalid course selection'}), 400

        
        # Convert dates
        try:
            start_date = datetime.fromisoformat(data['startDate'].replace('Z', ''))
            end_date = datetime.fromisoformat(data['endDate'].replace('Z', ''))
        except (KeyError, ValueError) as e:
            return jsonify({'error': 'Invalid date format'}), 400

        # Create assessment
        new_assessment = Assessment(
            title=data['title'],
            description=data.get('description', ''),
            type=data.get('type', 'assessment'),
            course_id=data['courseId'],
            start_date=start_date,
            end_date=end_date,
            total_marks=sum(q.get('maxMark', 0) for q in data['questions']),
            created_by=user.id,
            
            # Add other fields...
            shuffle_questions=data.get('shuffleQuestions', False),
            shuffle_options=data.get('shuffleOptions', True),
            enable_plagiarism_check=data.get('enablePlagiarismCheck', True),
            similarity_threshold=data.get('similarityThreshold', 30),
            ignore_quotes=data.get('ignoreQuotes', True),
            ignore_references=data.get('ignoreReferences', True),
            cosine_similarity_threshold=data.get('cosineSimilarityThreshold', 0.7),
        )

        # Create questions
        for q_data in data['questions']:
            question = Question(
                text=q_data.get('text', ''),
                type=q_data.get('type', 'mcq'),
                marks=q_data.get('maxMark', 0),
                created_by=user.id
            )
            
            if question.type == 'essay':
                question.model_answer = q_data.get('modelAnswer', '')
                question.keywords = json.dumps(q_data.get('keywords', []))
                question.word_limit = q_data.get('wordLimit', 500)
            
            new_assessment.questions.append(question)
            
            # Handle MCQ options
            if question.type == 'mcq':
                for opt_idx, opt_data in enumerate(q_data.get('options', [])):
                    option = QuestionOption(
                        text=opt_data.get('text', ''),
                        is_correct=(opt_idx == q_data.get('correctOption', -1))
                    )
                    question.options.append(option)

        db.session.add(new_assessment)
        db.session.commit()
        
        return jsonify({
            'message': 'Assessment created successfully',
            'assessment': new_assessment.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@assessment_bp.route('/<int:assessment_id>', methods=['PUT'])
@jwt_required()
def update_assessment(assessment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'lecturer':
        return jsonify({'error': 'Only lecturers can update assessments'}), 403
    
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Check if user is allowed to update this assessment
    if assessment.course.lecturer_id != user_id:
        return jsonify({'error': 'You are not authorized to update this assessment'}), 403
    
    data = request.get_json()
    
    # Update assessment fields
    assessment.title = data.get('title', assessment.title)
    assessment.description = data.get('description', assessment.description)
    assessment.start_date = datetime.fromisoformat(data['startDate']) if 'startDate' in data else assessment.start_date
    assessment.end_date = datetime.fromisoformat(data['endDate']) if 'endDate' in data else assessment.end_date
    assessment.shuffle_questions = data.get('shuffleQuestions', assessment.shuffle_questions)
    assessment.shuffle_options = data.get('shuffleOptions', assessment.shuffle_options)
    assessment.enable_plagiarism_check = data.get('enablePlagiarismCheck', assessment.enable_plagiarism_check)
    assessment.similarity_threshold = data.get('similarityThreshold', assessment.similarity_threshold)
    assessment.ignore_quotes = data.get('ignoreQuotes', assessment.ignore_quotes)
    assessment.ignore_references = data.get('ignoreReferences', assessment.ignore_references)
    assessment.cosine_similarity_threshold = data.get('cosineSimilarityThreshold', assessment.cosine_similarity_threshold)
    
    # Handle questions (more complex, would need to be implemented based on your needs)
    # For simplicity, let's assume we're replacing all questions
    if 'questions' in data:
        # Delete existing questions
        Question.query.filter_by(assessment_id=assessment_id).delete()
        
        # Add new questions
        for q_data in data['questions']:
            question = Question(
                assessment_id=assessment.id,
                text=q_data['text'],
                type=q_data['type'],
                marks=q_data.get('maxMark', 0),
                created_by=user_id,
                difficulty='medium',
            )
            
            if q_data['type'] == 'essay':
                question.word_limit = q_data.get('wordLimit', 500)
                question.model_answer = q_data.get('modelAnswer', '')
                question.keywords = json.dumps(q_data.get('keywords', []))
            
            db.session.add(question)
            db.session.flush()
            
            # For MCQ questions, add options
            if q_data['type'] == 'mcq' and 'options' in q_data:
                for i, opt_data in enumerate(q_data['options']):
                    option = QuestionOption(
                        question_id=question.id,
                        text=opt_data['text'],
                        is_correct=(i == q_data.get('correctOption', -1))
                    )
                    db.session.add(option)
        
        # Update total marks
        assessment.total_marks = sum(q.get('maxMark', 0) for q in data['questions'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Assessment updated successfully',
        'assessment': assessment.to_dict()
    }), 200

@assessment_bp.route('/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'lecturer':
        return jsonify({'error': 'Only lecturers can delete assessments'}), 403
    
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Check if user is allowed to delete this assessment
    if assessment.course.lecturer_id != user_id:
        return jsonify({'error': 'You are not authorized to delete this assessment'}), 403
    
    db.session.delete(assessment)
    db.session.commit()
    
    return jsonify({'message': 'Assessment deleted successfully'}), 200

# Route to get courses for assessment creation
@assessment_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses_for_assessment():
    try:
    
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if user.role != 'lecturer':
            return jsonify({'message': 'Access denied. Lecturer role required.'}), 403
        
        # Get courses taught by the lecturer
        courses = Course.query.filter_by(lecturer_id=user.id).all()
        
        return jsonify([{
            'id': course.id,
            'title': course.title,
            'code': course.code,
            'icon': '📚'  # Or use course.icon if you have this field
        } for course in courses]), 200

    except Exception as e:
        
        return jsonify({'error': 'Server error while fetching courses'}), 500

# Save assessment draft
@assessment_bp.route('/drafts', methods=['POST'])
@jwt_required()
def save_assessment_draft():
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Ensure the request has JSON data
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 415

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['title']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Validate course exists if provided
        if 'courseId' in data and data['courseId']:
            course = Course.query.get(data['courseId'])
            if not course or course.lecturer_id != user.id:
                return jsonify({'error': 'Invalid course selection'}), 400
        
        
        # Validate questions structure
        for q in data.get('questions', []):
            if q.get('type') == 'mcq' and len(q.get('options', [])) < 2:
                return jsonify({'error': 'MCQ questions require at least 2 options'}), 400
            if q.get('type') == 'essay' and not q.get('modelAnswer'):
                return jsonify({'error': 'Essay questions require a model answer'}), 400    

        # Handle draft creation/update
        draft_id = data.get('draftId')
        if draft_id:
            draft = AssessmentDraft.query.filter_by(id=draft_id, user_id=user.id).first()
            if not draft:
                return jsonify({'error': 'Draft not found'}), 404
        else:
            draft = AssessmentDraft(user_id=user.id)
            db.session.add(draft)

        # Update draft content
        draft.title = data.get('title', 'Untitled Draft')
        draft.description = data.get('description', '')
        draft.course_id = data.get('courseId')
        draft.user_id = user.id
        draft.content = {

            'startDate': data.get('startDate'),
            'endDate': data.get('endDate'),
            'questions': data['questions'],
            'settings': {
                'shuffleQuestions': data.get('shuffleQuestions', False),
                'shuffleOptions': data.get('shuffleOptions', True),
                'enablePlagiarismCheck': data.get('enablePlagiarismCheck', True),
                'similarityThreshold': data.get('similarityThreshold', 30),
                'cosineSimilarityThreshold': data.get('cosineSimilarityThreshold', 0.7)
            }
        }

        draft.last_updated = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'draftId': draft.id,
            'lastUpdated': draft.last_updated.isoformat(),
            'message': 'Draft saved successfully'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error: ' + str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Unexpected error: ' + str(e)}), 500
    
    
# Get all drafts for the current user
@assessment_bp.route('/drafts', methods=['GET'])
@jwt_required()
def get_drafts():
    user_id = get_jwt_identity()
    
    try:
        drafts = AssessmentDraft.query.filter_by(user_id=user_id).order_by(AssessmentDraft.last_updated.desc()).all()
        
        # Return just basic info for listing
        result = [{
            'id': draft.id,
            'title': draft.title or 'Untitled Draft',
            'description': draft.description,
            'courseId': draft.course_id,
            'lastUpdated': draft.last_updated.isoformat(),
            'createdAt': draft.created_at.isoformat()
        } for draft in drafts]
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve drafts: {str(e)}'}), 500

# Get Specific Draft and Update
@assessment_bp.route('/drafts/<int:draft_id>', methods=['GET', 'PUT'])
@jwt_required()
def manage_assessment_draft(draft_id):
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if request.method == 'GET':
            # Handle GET request
            draft = AssessmentDraft.query.filter_by(id=draft_id, user_id=user.id).first()
            if not draft:
                return jsonify({'error': 'Draft not found'}), 404
            
                
            # Combine draft data with content
            response_data = {
                'id': draft.id,
                'title': draft.title,
                'description': draft.description,
                'courseId': draft.course_id,
                'lastUpdated': draft.last_updated.isoformat(),
                'createdAt': draft.created_at.isoformat()
            }
            
            # Add content fields to the root level
            if draft.content:
                response_data.update({
                    'startDate': draft.content.get('startDate'),
                    'endDate': draft.content.get('endDate'),
                    'questions': draft.content.get('questions', []),
                    'shuffleQuestions': draft.content.get('settings', {}).get('shuffleQuestions', False),
                    'shuffleOptions': draft.content.get('settings', {}).get('shuffleOptions', True),
                    'enablePlagiarismCheck': draft.content.get('settings', {}).get('enablePlagiarismCheck', True),
                    'similarityThreshold': draft.content.get('settings', {}).get('similarityThreshold', 30),
                    'cosineSimilarityThreshold': draft.content.get('settings', {}).get('cosineSimilarityThreshold', 0.7)
                })
            
            return jsonify(response_data), 200

        elif request.method == 'PUT':
            # Handle PUT request
            if not request.is_json:
                return jsonify({'error': 'Request must be JSON'}), 415

            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Find the draft
            draft = AssessmentDraft.query.filter_by(id=draft_id, user_id=user.id).first()
            if not draft:
                return jsonify({'error': 'Draft not found'}), 404

            # Validate required fields
            required_fields = ['title', 'questions']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
                
            # Validate course exists if provided
            if 'courseId' in data and data['courseId']:
                course = Course.query.get(data['courseId'])
                if not course or course.lecturer_id != user.id:
                    return jsonify({'error': 'Invalid course selection'}), 400
            
            # Validate questions structure
            for q in data.get('questions', []):
                if q.get('type') == 'mcq' and len(q.get('options', [])) < 2:
                    return jsonify({'error': 'MCQ questions require at least 2 options'}), 400
                if q.get('type') == 'essay' and not q.get('modelAnswer'):
                    return jsonify({'error': 'Essay questions require a model answer'}), 400

            # Update draft content
            draft.title = data.get('title', 'Untitled Draft')
            draft.description = data.get('description', '')
            draft.course_id = data.get('courseId')
            # draft.user_id = user.id
            draft.content = {
                'startDate': data.get('startDate'),
                'endDate': data.get('endDate'),
                'questions': data['questions'],
                'settings': {
                    'shuffleQuestions': data.get('shuffleQuestions', False),
                    'shuffleOptions': data.get('shuffleOptions', True),
                    'enablePlagiarismCheck': data.get('enablePlagiarismCheck', True),
                    'similarityThreshold': data.get('similarityThreshold', 30),
                    'cosineSimilarityThreshold': data.get('cosineSimilarityThreshold', 0.7)
                }
            }

            draft.last_updated = datetime.utcnow()
            db.session.commit()

            return jsonify({
                'draftId': draft.id,
                'lastUpdated': draft.last_updated.isoformat(),
                'message': 'Draft updated successfully'
            }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error: ' + str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Unexpected error: ' + str(e)}), 500



# Delete a draft
@assessment_bp.route('/drafts/<int:draft_id>', methods=['DELETE'])
@jwt_required()
def delete_draft(draft_id):
    user_uuid = get_jwt_identity()
    
    user = User.query.filter_by(uuid=user_uuid).first()
    
    
    print(f"User ID: {user.id}, Draft ID: {draft_id}", flush=True)
    
    
    try:
        draft = AssessmentDraft.query.filter_by(id=draft_id, user_id=user.id).first()
        
        if not draft:
            return jsonify({'error': 'Draft not found or you do not have permission to delete it'}), 404
        
        db.session.delete(draft)
        db.session.commit()
        
        return jsonify({'message': 'Draft deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete draft: {str(e)}'}), 500
