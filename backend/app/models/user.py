from app import db
from datetime import datetime
import bcrypt
import uuid


class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    users = db.relationship('User', backref='department', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    department_id = db.Column(db.String(50), db.ForeignKey('departments.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lecturer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Lecturer assigned to course

    # Relationships
    assessments = db.relationship('Assessment', backref='course', lazy=True)
    students = db.relationship('User', secondary='student_courses',
                               backref=db.backref('registered_courses', lazy='dynamic'),
                               primaryjoin="and_(Course.id==student_courses.c.course_id)",
                               secondaryjoin="and_(User.id==student_courses.c.student_id, User.role=='student')")

    lecturer = db.relationship('User', foreign_keys=[lecturer_id], backref='lectured_courses')

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'title': self.title,
            'description': self.description,
            'department': self.department.name if self.department else None,
            'lecturer': f"{self.lecturer.first_name} {self.lecturer.last_name}" if self.lecturer else None,
            'createdAt': self.created_at.isoformat()
        }

student_courses = db.Table('student_courses',
    db.Column('student_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    university_id = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'lecturer'
    department_id = db.Column(db.String(50), db.ForeignKey('departments.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    
    
    # registered_courses: many-to-many via student_courses (backref from Course)
    # lectured_courses: one-to-many via Course.lecturer_id (backref from Course)

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.uuid,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'universityId': self.university_id,
            'role': self.role,
            'department': self.department.to_dict() if self.department else None,
            'createdAt': self.created_at.isoformat(),
        }
