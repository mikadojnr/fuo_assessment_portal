from datetime import datetime
from venv import logger
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from ..models.user import User, Course
from ..models.assessment import Assessment, Submission, Question, QuestionOption, StudentProgress
from ..utils.nlp_grader import calculate_essay_score # Corrected import
from ..utils.plagiarism_checker import check_plagiarism
import json
import random # For mock data

submission_bp = Blueprint('submission', __name__)

@submission_bp.route('/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_submission_details(submission_id):
    """
    Get details of a specific submission.
    Accessible by the student who made the submission or a lecturer of the course.
    """
    try:
        current_user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_uuid).first()

        if not user:
            logger.error(f"User with UUID {current_user_uuid} not found")
            return jsonify({'message': 'User not found'}), 404

        submission = Submission.query.get(submission_id)
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return jsonify({'message': 'Submission not found'}), 404

        assessment = Assessment.query.get(submission.assessment_id)
        if not assessment:
            logger.error(f"Assessment {submission.assessment_id} not found for submission {submission_id}")
            return jsonify({'message': 'Assessment not found for this submission'}), 404

        # Authorization check
        is_student_owner = (user.id == submission.user_id)
        is_lecturer_of_course = False
        if user.role == 'lecturer':
            if assessment.course_id in [c.id for c in user.lectured_courses]:
                is_lecturer_of_course = True

        if not is_student_owner and not is_lecturer_of_course:
            logger.warning(f"User {current_user_uuid} unauthorized to access submission {submission_id}")
            return jsonify({'message': 'Unauthorized access to submission details'}), 403

        # Parse answers_json
        student_answers_parsed = json.loads(submission.answers_json) if submission.answers_json else []
        logger.debug(f"Parsed {len(student_answers_parsed)} answers for submission {submission_id}")

        # Prepare student answers with question details and NLP insights
        student_answers_with_details = []
        nlp_insights_summary = {
            'overallMatchPercentage': 0,
            'matchedKeywords': [],
            'missingKeywords': [],
            'sentiment': 'neutral',
            'readabilityScore': 0,
            'totalEssayQuestions': 0,
            'totalEssayScorePercentage': 0
        }
        total_essay_questions_graded = 0
        total_essay_score_sum = 0

        # Map assessment questions for easy lookup
        assessment_questions_map = {q.id: q for q in assessment.questions}

        for ans_data_item in student_answers_parsed:
            question_id = ans_data_item.get('questionId')
            original_question = assessment_questions_map.get(question_id)
            
            if not original_question:
                logger.warning(f"Question {question_id} not found for submission {submission_id}")
                continue

            question_type = original_question.type
            question_text = original_question.text
            max_mark = original_question.marks

            # Handle keywords (JSON string or list)
            keywords = original_question.keywords
            if isinstance(keywords, str):
                try:
                    keywords = json.loads(keywords)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse keywords for question {question_id}: {str(e)}")
                    keywords = []
            keywords = [kw.get('text', kw) if isinstance(kw, dict) else kw for kw in (keywords or [])]

            mapped_answer = {
                'questionId': question_id,
                'questionText': question_text,
                'type': question_type,
                'maxMark': max_mark,
                'studentAnswer': ans_data_item,
                'modelAnswer': original_question.model_answer,
                'keywords': keywords,
                'wordLimit': original_question.word_limit,
            }

            if question_type == 'mcq':
                options = [opt.to_dict() for opt in original_question.options] if original_question.options else []
                correct_option_text = next((opt['text'] for opt in options if opt.get('isCorrect')), 'N/A')
                
                student_selected_option_text = None
                selected_idx = ans_data_item.get('selectedOption')
                if selected_idx is not None and 0 <= selected_idx < len(options):
                    student_selected_option_text = options[selected_idx]['text']
                
                mapped_answer['modelAnswer'] = correct_option_text
                mapped_answer['studentAnswer']['selectedOptionText'] = student_selected_option_text
                mapped_answer['isCorrect'] = (student_selected_option_text == correct_option_text)

            elif question_type == 'essay':
                student_essay_content = ans_data_item.get('content')
                model_answer_content = original_question.model_answer
                word_limit = original_question.word_limit
                
                essay_nlp_result = {}
                if student_essay_content and model_answer_content:
                    try:
                        essay_nlp_result = calculate_essay_score(
                            student_essay_content,
                            model_answer_content,
                            keywords,
                            max_mark,
                            word_limit
                        )
                        nlp_insights_summary['overallMatchPercentage'] += essay_nlp_result['nlpInsights']['overallMatchPercentage']
                        nlp_insights_summary['matchedKeywords'].extend(essay_nlp_result['nlpInsights']['matchedKeywords'])
                        nlp_insights_summary['missingKeywords'].extend(essay_nlp_result['nlpInsights']['missingKeywords'])
                        nlp_insights_summary['readabilityScore'] += essay_nlp_result['nlpInsights']['readabilityScore']
                        total_essay_questions_graded += 1
                        total_essay_score_sum += essay_nlp_result['score']
                    except Exception as e:
                        logger.error(f"Error grading essay for question {question_id}: {str(e)}", exc_info=True)
                
                mapped_answer['nlpAnalysis'] = essay_nlp_result.get('nlpInsights', {})

            elif question_type == 'file':
                mapped_answer['modelAnswer'] = "N/A (File upload, manual grading)"

            student_answers_with_details.append(mapped_answer)

        # Finalize NLP insights
        if total_essay_questions_graded > 0:
            nlp_insights_summary['overallMatchPercentage'] /= total_essay_questions_graded
            nlp_insights_summary['readabilityScore'] /= total_essay_questions_graded
            nlp_insights_summary['totalEssayQuestions'] = total_essay_questions_graded
            nlp_insights_summary['totalEssayScorePercentage'] = (total_essay_score_sum / (assessment.total_marks or 1)) * 100
            nlp_insights_summary['sentiment'] = (
                'positive' if nlp_insights_summary['overallMatchPercentage'] > 70 else
                'negative' if nlp_insights_summary['overallMatchPercentage'] < 50 else
                'neutral'
            )

        # Calculate real plagiarism report (remove mock data)
        plagiarism_report_data = {
            'similarityScore': submission.plagiarism_score or 0,
            'details': 'Plagiarism report not available' if not submission.plagiarism_score else 'Plagiarism check completed',
            'flaggedSources': []
        }

        # Calculate real assessment analytics
        assessment_submissions = Submission.query.filter_by(assessment_id=submission.assessment_id).all()
        valid_grades = [s.grade for s in assessment_submissions if s.grade is not None]
        class_average = sum(valid_grades) / len(valid_grades) if valid_grades else 0
        score_distribution = [0] * 5  # Buckets: 0-20%, 21-40%, 41-60%, 61-80%, 81-100%
        for grade in valid_grades:
            percentage = (grade / (assessment.total_marks or 1)) * 100
            bucket = min(int(percentage // 20), 4)
            score_distribution[bucket] += 1
        percentile = sum(1 for g in valid_grades if g < submission.grade) / len(valid_grades) * 100 if valid_grades and submission.grade else 50
        assessment_analytics = {
            'classAverage': class_average,
            'scoreDistribution': {
                'labels': ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
                'data': score_distribution
            },
            'percentileBadge': f"Top {int(100 - percentile)}%" if percentile > 0 else "N/A"
        }

        # Placeholder for topic mastery (requires actual data)
        topic_mastery_data = []  # Implement based on actual topic data if available

        logger.info(f"Retrieved details for submission {submission_id}")
        return jsonify({
            'submission': submission.to_dict(),
            'assessmentDetails': assessment.to_dict(),
            'studentAnswers': student_answers_with_details,
            'plagiarismReport': plagiarism_report_data,
            'nlpInsights': nlp_insights_summary,
            'assessmentAnalytics': assessment_analytics,
            'topicMasteryData': topic_mastery_data
        }), 200

    except Exception as e:
        logger.error(f"Error fetching submission details {submission_id}: {str(e)}", exc_info=True)
        return jsonify({'message': f'Failed to fetch submission details: {str(e)}'}), 500

@submission_bp.route('/grade/<int:submission_id>', methods=['PUT'])
@jwt_required()
def update_submission_grade(submission_id):
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    if not user or user.role != 'lecturer':
        return jsonify({"msg": "Lecturer access required"}), 403

    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({"msg": "Submission not found"}), 404

    assessment = Assessment.query.get(submission.assessment_id)
    # Check if the lecturer teaches the course associated with the assessment
    if not assessment or assessment.course_id not in [c.id for c in user.lectured_courses]:
        return jsonify({"msg": "Unauthorized to grade this submission"}), 403

    data = request.get_json()
    new_grade = data.get('grade')
    lecturer_comments = data.get('lecturerComments')
    flagged_for_review = data.get('flaggedForReview', False)

    if new_grade is not None:
        submission.grade = new_grade
    if lecturer_comments is not None:
        submission.lecturer_comments = lecturer_comments
    if flagged_for_review is not None:
        submission.flagged_for_review = flagged_for_review

    db.session.commit()

    return jsonify({"message": "Submission grade updated successfully", "submission": submission.to_dict()}), 200
