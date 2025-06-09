from app import create_app, db
from app.models.user import User, Department, Course
from werkzeug.security import generate_password_hash
from datetime import datetime
import uuid

# Association table
from app.models.user import student_courses

app = create_app()

def seed_data():
    with app.app_context():
        db.create_all()

        if not Department.query.first():
            # Department
            cs_dept = Department(id='CSC', name='Computer Science')
            db.session.add(cs_dept)
            db.session.commit()

            # Students
            student1 = User(
                uuid=str(uuid.uuid4()),
                first_name='Mikado',
                last_name='Jnr',
                email='edidavo.97@gmail.com',
                
                university_id='STUDENT/001',
                role='student',
                department_id='CSC'
            )
            student1.set_password('1234567890')
            
            
            student2 = User(
                uuid=str(uuid.uuid4()),
                first_name='Student_2',
                last_name='Last_name',
                email='student@mail.com',
               
                university_id='STUDENT/002',
                role='student',
                department_id='CSC'
            )
            student2.set_password('1234567890')

            db.session.add_all([student1, student2 ])
            db.session.commit()

            # Lecturer
            lecturer = User(
                uuid=str(uuid.uuid4()),
                first_name='Edidiong',
                last_name='Mikado',
                email='officialudobad@gmail.com',
                
                university_id='STAFF/001',
                role='lecturer',
                department_id='CSC'
            )
            lecturer.set_password('1234567890')
            db.session.add(lecturer)
            db.session.commit()

            # Course
            course1 = Course(
                code='CSC101',
                title='Intro to Computer Science',
                description='Fundamentals of computing.',
                department_id='CSC',
                lecturer_id=lecturer.id
            )

            course2 = Course(
                code='CSC102',
                title='Data Structures',
                description='Study of common data structures.',
                department_id='CSC',
                lecturer_id=lecturer.id
            )

            course3 = Course(
                code='CSC103',
                title='Algorithms',
                description='Problem solving and algorithm design.',
                department_id='CSC',
                lecturer_id=lecturer.id
            )

            db.session.add_all([course1, course2, course3])
            db.session.commit()

            # Register students for selected courses
            db.session.execute(student_courses.insert().values(
                student_id=student1.id,
                course_id=course1.id  # Mikado registered only for CSC101
            ))

            db.session.execute(student_courses.insert().values(
                student_id=student2.id,
                course_id=course2.id  # Edidiong registered only for CSC102
            ))

            db.session.execute(student_courses.insert().values(
                student_id=student2.id,
                course_id=course3.id  # Edidiong also registered for CSC103
            ))

            db.session.commit()

        print("✔️ Database seeded successfully.")

if __name__ == '__main__':
    seed_data()
