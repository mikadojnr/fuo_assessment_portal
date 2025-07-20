import json
from app import db
from datetime import datetime, timedelta

class AssessmentDraft(db.Model):
    __tablename__ = 'assessment_drafts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=True)
    content = db.Column(db.JSON, nullable=False)  # Store the entire draft as JSON
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='drafts')
    course = db.relationship('Course', backref='drafts')
    
    def to_dict(self):
        return {
            'id': self.id,
            # 'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'courseId': self.course_id,
            'content': self.content,
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Assessment(db.Model):
    __tablename__ = 'assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(50), nullable=False)  # 'assignment', 'quiz', 'exam', etc.
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    total_marks = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Advanced settings
    shuffle_questions = db.Column(db.Boolean, default=False)
    shuffle_options = db.Column(db.Boolean, default=True)
    enable_plagiarism_check = db.Column(db.Boolean, default=True)
    similarity_threshold = db.Column(db.Float, default=30.0)
    ignore_quotes = db.Column(db.Boolean, default=True)
    ignore_references = db.Column(db.Boolean, default=True)
    cosine_similarity_threshold = db.Column(db.Float, default=0.7)
    
    # Relationships
    questions = db.relationship('Question', backref='assessment', lazy=True, cascade="all, delete-orphan")
    submissions = db.relationship('Submission', back_populates='assessment', lazy=True)
    student_progress = db.relationship('StudentProgress', backref='assessment', lazy=True, cascade="all, delete-orphan")
    
    def duration_minutes(self):
        """Returns the duration of the assessment in minutes."""
        duration: timedelta = self.end_date - self.start_date
        return int(duration.total_seconds() / 60)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'courseId': self.course_id,
            'courseCode': self.course.code if self.course else None,
            'courseTitle': self.course.title if self.course else None,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'durationMinutes': self.duration_minutes(),  # Fixed typo and ensured method call
            'totalMarks': self.total_marks,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'shuffleQuestions': self.shuffle_questions,
            'shuffleOptions': self.shuffle_options,
            'enablePlagiarismCheck': self.enable_plagiarism_check,
            'similarityThreshold': self.similarity_threshold,
            'ignoreQuotes': self.ignore_quotes,
            'ignoreReferences': self.ignore_references,
            'cosineSimilarityThreshold': self.cosine_similarity_threshold
        }

class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'mcq', 'essay', 'short_answer', etc.
    difficulty = db.Column(db.String(20), nullable=True)  # 'easy', 'medium', 'hard'
    marks = db.Column(db.Integer, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # For essay questions
    word_limit = db.Column(db.Integer, nullable=True)
    model_answer = db.Column(db.Text, nullable=True)
    keywords = db.Column(db.Text, nullable=True)  # Stored as JSON string
    
    # Relationships
    options = db.relationship('QuestionOption', backref='question', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        result = {
            'id': self.id,
            'assessmentId': self.assessment_id,
            'text': self.text,
            'type': self.type,
            'difficulty': self.difficulty,
            'maxMark': self.marks,
            'createdBy': self.created_by,
            'createdAt': self.created_at.isoformat(),
        }
        
        # Add type-specific fields
        if self.type == 'mcq':
            result['options'] = [option.to_dict() for option in self.options]
            # Find the correct option index
            for i, option in enumerate(self.options):
                if option.is_correct:
                    result['correctOption'] = i
                    break
            else:
                result['correctOption'] = None
        elif self.type == 'essay':
            result['wordLimit'] = self.word_limit
            result['modelAnswer'] = self.model_answer
            # Parse keywords JSON
            try:
                import json
                result['keywords'] = json.loads(self.keywords) if self.keywords else []
            except:
                result['keywords'] = []
                
        return result

class QuestionOption(db.Model):
    __tablename__ = 'question_options'
    
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'isCorrect': self.is_correct
        }

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    answers_json = db.Column(db.Text, nullable=True) # JSON string of student's answers
    flagged_questions_json = db.Column(db.Text, nullable=True) # JSON string of flagged questions for review
    is_late = db.Column(db.Boolean, default=False)

    # New fields for grading
    grade = db.Column(db.Float, nullable=True) # Score given by lecturer
    lecturer_comments = db.Column(db.Text, nullable=True)
    flagged_for_review = db.Column(db.Boolean, default=False)
    
    # For automated grading/analytics
    plagiarism_score = db.Column(db.Float, nullable=True)
    time_spent_seconds = db.Column(db.Integer, nullable=True) # New field to store time spent
    
    # Relationships
    user = db.relationship('User', backref='submissions')
    assessment = db.relationship('Assessment', back_populates='submissions') # Renamed to avoid conflict with 'submissions' backref on Assessment

    def to_dict(self):
        answers = []
        if self.answers_json:
          try:
              answers = json.loads(self.answers_json)
          except json.JSONDecodeError:
              answers = []
        
        return {
            'id': self.id,
            'assessmentId': self.assessment_id,
            'userId': self.user_id,
            'submittedAt': self.submitted_at.isoformat(),
            'answers': answers,
            'isLate': self.is_late,
            'grade': self.grade,
            'lecturerComments': self.lecturer_comments,
            'flaggedForReview': self.flagged_for_review,
            'plagiarismScore': self.plagiarism_score,
            'timeSpentSeconds': self.time_spent_seconds,
            'studentName': f"{self.user.first_name} {self.user.last_name}" if self.user else 'N/A',
            'studentUniversityId': self.user.university_id if self.user else 'N/A',
            'assessmentTitle': self.assessment.title if self.assessment else 'N/A',
            'courseCode': self.assessment.course.code if self.assessment and self.assessment.course else 'N/A',
            'totalMarks': self.assessment.total_marks if self.assessment else None,
            'answersJson': json.loads(self.answers_json) if self.answers_json else [],
            'flaggedQuestionsJson': json.loads(self.flagged_questions_json) if self.flagged_questions_json else []
        }

class StudentProgress(db.Model):
    __tablename__ = 'student_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)  # Percentage of completion
    status = db.Column(db.String(20), default='not_started')  # 'not_started', 'in_progress', 'completed'
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    
    time_spent_seconds = db.Column(db.Integer, default=0) # New field

    answers_json = db.Column(db.JSON, nullable=True) # Store all answers as JSON
    flagged_questions_json = db.Column(db.JSON, nullable=True) # Store flagged questions as JSON
    
    user = db.relationship('User', backref=db.backref('assessment_progress', lazy=True))

    __table_args__ = (db.UniqueConstraint('user_id', 'assessment_id', name='_user_assessment_uc'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'assessmentId': self.assessment_id,
            'progress': self.progress,
            'status': self.status,
            'lastAccessed': self.last_accessed.isoformat(),
            'answers': self.answers_json,
            'flaggedQuestions': self.flagged_questions_json,
            'timeSpentSeconds': self.time_spent_seconds
        }
