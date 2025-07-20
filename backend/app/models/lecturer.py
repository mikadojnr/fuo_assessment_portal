from app import db
from datetime import datetime

class PlagiarismReport(db.Model):
    __tablename__ = 'plagiarism_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=False)
    similarity_score = db.Column(db.Float, nullable=False)
    matched_sources = db.Column(db.Text, nullable=True)  # JSON string of matched sources
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed = db.Column(db.Boolean, default=False)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    submission = db.relationship('Submission', backref='plagiarism_report', uselist=False)
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_plagiarism_reports')
    
    def to_dict(self):
        return {
            'id': self.id,
            'submissionId': self.submission_id,
            'similarityScore': self.similarity_score,
            'matchedSources': self.matched_sources,
            'createdAt': self.created_at.isoformat(),
            'reviewed': self.reviewed,
            'reviewedBy': self.reviewed_by,
            'reviewedAt': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'student': self.submission.user.to_dict() if self.submission and self.submission.user else None,
            'assessment': self.submission.assessment.to_dict() if self.submission and self.submission.assessment else None
        }

class StudentEngagement(db.Model):
    __tablename__ = 'student_engagement'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    login_count = db.Column(db.Integer, default=0)
    submission_count = db.Column(db.Integer, default=0)
    resource_access_count = db.Column(db.Integer, default=0)
    forum_post_count = db.Column(db.Integer, default=0)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    engagement_score = db.Column(db.Float, default=0.0)  # Calculated score
    
    # Relationships
    user = db.relationship('User', backref='engagement_metrics', lazy=True)
    course = db.relationship('Course', backref='student_engagement', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'courseId': self.course_id,
            'loginCount': self.login_count,
            'submissionCount': self.submission_count,
            'resourceAccessCount': self.resource_access_count,
            'forumPostCount': self.forum_post_count,
            'lastActive': self.last_active.isoformat(),
            'engagementScore': self.engagement_score,
            'student': self.user.to_dict() if self.user else None,
            'course': self.course.to_dict() if self.course else None
        }
