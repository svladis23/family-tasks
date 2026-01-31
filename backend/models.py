"""Database models for the Family Tasks application."""

from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """User model - represents family members."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class DailyTask(db.Model):
    """Daily recurring tasks that appear every day."""
    __tablename__ = 'daily_tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class WeeklyTask(db.Model):
    """Weekly recurring tasks that appear on specific days of the week."""
    __tablename__ = 'weekly_tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    days_of_week = db.Column(db.String(20), nullable=False)  # Comma-separated: "1,3,5" for Mon/Wed/Fri
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'days_of_week': self.days_of_week,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def is_scheduled_for_day(self, day_number):
        """Check if task is scheduled for a specific day (1=Monday, 7=Sunday)."""
        days = [int(d) for d in self.days_of_week.split(',') if d]
        return day_number in days


class ExtraTask(db.Model):
    """One-time tasks with a specific due date."""
    __tablename__ = 'extra_tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    completed_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    completed_by = db.relationship('User', backref='completed_extra_tasks')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed': self.completed,
            'completed_by_user_id': self.completed_by_user_id,
            'completed_by_name': self.completed_by.name if self.completed_by else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TaskCompletion(db.Model):
    """Records of task completions by users."""
    __tablename__ = 'task_completions'

    id = db.Column(db.Integer, primary_key=True)
    completion_date = db.Column(db.Date, nullable=False)
    task_type = db.Column(db.String(20), nullable=False)  # 'daily', 'weekly', or 'extra'
    task_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='completions')

    def to_dict(self):
        return {
            'id': self.id,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'task_type': self.task_type,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


def init_db(app):
    """Initialize the database with seed data."""
    with app.app_context():
        db.create_all()

        # Check if users already exist
        if User.query.count() == 0:
            # Add users
            vlad = User(id=1, name='Vlad')
            maayan = User(id=2, name='Maayan')
            db.session.add(vlad)
            db.session.add(maayan)

            # Add sample daily tasks
            daily_tasks = [
                DailyTask(title='Wash dishes'),
                DailyTask(title='Take vitamins'),
                DailyTask(title='Make bed'),
            ]
            for task in daily_tasks:
                db.session.add(task)

            # Add sample weekly tasks
            weekly_tasks = [
                WeeklyTask(title='Take out trash', days_of_week='1,4'),  # Monday and Thursday
                WeeklyTask(title='Vacuum living room', days_of_week='3,6'),  # Wednesday and Saturday
                WeeklyTask(title='Water plants', days_of_week='2,5'),  # Tuesday and Friday
            ]
            for task in weekly_tasks:
                db.session.add(task)

            # Add sample extra tasks
            today = date.today()
            extra_tasks = [
                ExtraTask(title='Fix bathroom sink', due_date=today),
                ExtraTask(title='Organize closet', due_date=date(today.year, today.month, min(today.day + 7, 28))),
            ]
            for task in extra_tasks:
                db.session.add(task)

            db.session.commit()
            print("Database initialized with seed data!")
