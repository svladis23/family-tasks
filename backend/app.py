"""
Family Tasks API - Flask Backend

A simple task tracker for family members to manage household tasks
and track completion statistics.
"""

from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, DailyTask, WeeklyTask, ExtraTask, TaskCompletion, init_db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///family_tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for React frontend
CORS(app)

# Initialize database
db.init_app(app)

# Initialize database with seed data on first run
with app.app_context():
    init_db(app)


# ============ USERS ENDPOINTS ============

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users."""
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


# ============ DAILY TASKS ENDPOINTS ============

@app.route('/api/daily-tasks', methods=['GET'])
def get_daily_tasks():
    """Get all daily tasks."""
    tasks = DailyTask.query.order_by(DailyTask.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks])


@app.route('/api/daily-tasks', methods=['POST'])
def create_daily_task():
    """Create a new daily task."""
    data = request.get_json()

    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    task = DailyTask(title=data['title'].strip())
    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


@app.route('/api/daily-tasks/<int:task_id>', methods=['PUT'])
def update_daily_task(task_id):
    """Update a daily task."""
    task = DailyTask.query.get_or_404(task_id)
    data = request.get_json()

    if 'title' in data:
        task.title = data['title'].strip()
    if 'active' in data:
        task.active = data['active']

    db.session.commit()
    return jsonify(task.to_dict())


@app.route('/api/daily-tasks/<int:task_id>', methods=['DELETE'])
def delete_daily_task(task_id):
    """Delete a daily task."""
    task = DailyTask.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})


# ============ WEEKLY TASKS ENDPOINTS ============

@app.route('/api/weekly-tasks', methods=['GET'])
def get_weekly_tasks():
    """Get all weekly tasks."""
    tasks = WeeklyTask.query.order_by(WeeklyTask.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks])


@app.route('/api/weekly-tasks', methods=['POST'])
def create_weekly_task():
    """Create a new weekly task."""
    data = request.get_json()

    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    if not data.get('days_of_week'):
        return jsonify({'error': 'At least one day must be selected'}), 400

    # Validate days_of_week format
    days = data['days_of_week'].split(',')
    for day in days:
        if not day.isdigit() or int(day) < 1 or int(day) > 7:
            return jsonify({'error': 'Invalid days_of_week format'}), 400

    task = WeeklyTask(
        title=data['title'].strip(),
        days_of_week=data['days_of_week']
    )
    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


@app.route('/api/weekly-tasks/<int:task_id>', methods=['PUT'])
def update_weekly_task(task_id):
    """Update a weekly task."""
    task = WeeklyTask.query.get_or_404(task_id)
    data = request.get_json()

    if 'title' in data:
        task.title = data['title'].strip()
    if 'days_of_week' in data:
        # Validate days_of_week format
        days = data['days_of_week'].split(',')
        for day in days:
            if not day.isdigit() or int(day) < 1 or int(day) > 7:
                return jsonify({'error': 'Invalid days_of_week format'}), 400
        task.days_of_week = data['days_of_week']
    if 'active' in data:
        task.active = data['active']

    db.session.commit()
    return jsonify(task.to_dict())


@app.route('/api/weekly-tasks/<int:task_id>', methods=['DELETE'])
def delete_weekly_task(task_id):
    """Delete a weekly task."""
    task = WeeklyTask.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})


# ============ EXTRA TASKS ENDPOINTS ============

@app.route('/api/extra-tasks', methods=['GET'])
def get_extra_tasks():
    """Get all extra tasks (optionally filter by pending only)."""
    pending_only = request.args.get('pending', 'false').lower() == 'true'

    query = ExtraTask.query
    if pending_only:
        query = query.filter_by(completed=False)

    tasks = query.order_by(ExtraTask.due_date.asc()).all()
    return jsonify([t.to_dict() for t in tasks])


@app.route('/api/extra-tasks', methods=['POST'])
def create_extra_task():
    """Create a new extra task."""
    data = request.get_json()

    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    if not data.get('due_date'):
        return jsonify({'error': 'Due date is required'}), 400

    try:
        due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    task = ExtraTask(
        title=data['title'].strip(),
        due_date=due_date
    )
    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


@app.route('/api/extra-tasks/<int:task_id>', methods=['PUT'])
def update_extra_task(task_id):
    """Update an extra task."""
    task = ExtraTask.query.get_or_404(task_id)
    data = request.get_json()

    if 'title' in data:
        task.title = data['title'].strip()
    if 'due_date' in data:
        try:
            task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    db.session.commit()
    return jsonify(task.to_dict())


@app.route('/api/extra-tasks/<int:task_id>', methods=['DELETE'])
def delete_extra_task(task_id):
    """Delete an extra task."""
    task = ExtraTask.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})


@app.route('/api/extra-tasks/<int:task_id>/complete', methods=['POST'])
def complete_extra_task(task_id):
    """Mark an extra task as complete."""
    task = ExtraTask.query.get_or_404(task_id)
    data = request.get_json()

    if task.completed:
        return jsonify({'error': 'Task is already completed'}), 400

    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    user = User.query.get_or_404(user_id)

    task.completed = True
    task.completed_by_user_id = user_id
    task.completed_at = datetime.utcnow()

    # Also record in task_completions
    completion = TaskCompletion(
        completion_date=date.today(),
        task_type='extra',
        task_id=task_id,
        user_id=user_id
    )
    db.session.add(completion)
    db.session.commit()

    return jsonify(task.to_dict())


# ============ TODAY'S TASKS ENDPOINT ============

@app.route('/api/today', methods=['GET'])
def get_today_tasks():
    """Get all tasks for today with completion status."""
    today = date.today()
    # Python's weekday(): Monday=0, Sunday=6
    # We want: Sunday=1, Monday=2, ..., Thursday=5, Friday=6, Saturday=7
    # Work days are Sunday-Thursday (1-5), weekends are Friday-Saturday (6-7)
    today_day_number = ((today.weekday() + 1) % 7) + 1

    # Get today's completions
    today_completions = TaskCompletion.query.filter_by(completion_date=today).all()

    # Build completion lookup: {(task_type, task_id): [user_ids]}
    completion_map = {}
    for comp in today_completions:
        key = (comp.task_type, comp.task_id)
        if key not in completion_map:
            completion_map[key] = []
        completion_map[key].append(comp.user_id)

    # Get active daily tasks
    daily_tasks = DailyTask.query.filter_by(active=True).all()
    daily_tasks_data = []
    for task in daily_tasks:
        completed_by = completion_map.get(('daily', task.id), [])
        daily_tasks_data.append({
            **task.to_dict(),
            'completed_by_users': completed_by
        })

    # Get active weekly tasks for today
    weekly_tasks = WeeklyTask.query.filter_by(active=True).all()
    weekly_tasks_data = []
    for task in weekly_tasks:
        if task.is_scheduled_for_day(today_day_number):
            completed_by = completion_map.get(('weekly', task.id), [])
            weekly_tasks_data.append({
                **task.to_dict(),
                'completed_by_users': completed_by
            })

    # Get extra tasks due today (not yet completed)
    extra_tasks = ExtraTask.query.filter_by(due_date=today, completed=False).all()
    extra_tasks_data = [t.to_dict() for t in extra_tasks]

    return jsonify({
        'date': today.isoformat(),
        'day_of_week': today_day_number,
        'day_name': today.strftime('%A'),
        'daily_tasks': daily_tasks_data,
        'weekly_tasks': weekly_tasks_data,
        'extra_tasks': extra_tasks_data
    })


# ============ TASK COMPLETIONS ENDPOINTS ============

@app.route('/api/completions', methods=['POST'])
def toggle_completion():
    """Toggle task completion for a user on a specific date."""
    data = request.get_json()

    task_type = data.get('task_type')
    task_id = data.get('task_id')
    user_id = data.get('user_id')
    completion_date_str = data.get('date', date.today().isoformat())

    if not all([task_type, task_id, user_id]):
        return jsonify({'error': 'task_type, task_id, and user_id are required'}), 400

    if task_type not in ['daily', 'weekly']:
        return jsonify({'error': 'Invalid task_type. Use "daily" or "weekly"'}), 400

    try:
        completion_date = datetime.strptime(completion_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Check if completion exists
    existing = TaskCompletion.query.filter_by(
        completion_date=completion_date,
        task_type=task_type,
        task_id=task_id,
        user_id=user_id
    ).first()

    if existing:
        # Remove completion (uncheck)
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'completed': False, 'message': 'Completion removed'})
    else:
        # Add completion (check)
        completion = TaskCompletion(
            completion_date=completion_date,
            task_type=task_type,
            task_id=task_id,
            user_id=user_id
        )
        db.session.add(completion)
        db.session.commit()
        return jsonify({'completed': True, 'message': 'Completion added'})


@app.route('/api/completions', methods=['GET'])
def get_completions():
    """Get completions for a date range."""
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = TaskCompletion.query

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            query = query.filter(TaskCompletion.completion_date >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            query = query.filter(TaskCompletion.completion_date <= end_date)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400

    completions = query.order_by(TaskCompletion.completion_date.desc()).all()
    return jsonify([c.to_dict() for c in completions])


# ============ ANALYTICS ENDPOINT ============

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get task completion analytics for each user."""
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    users = User.query.all()

    def calculate_stats(start_date=None):
        """Calculate completion percentages for a date range."""
        query = TaskCompletion.query
        if start_date:
            query = query.filter(TaskCompletion.completion_date >= start_date)

        total = query.count()
        if total == 0:
            return {user.id: {'count': 0, 'percentage': 0} for user in users}

        stats = {}
        for user in users:
            user_count = query.filter_by(user_id=user.id).count()
            stats[user.id] = {
                'count': user_count,
                'percentage': round((user_count / total) * 100, 1) if total > 0 else 0
            }

        return stats

    # Calculate stats for each period
    week_stats = calculate_stats(week_ago)
    month_stats = calculate_stats(month_ago)
    all_time_stats = calculate_stats()

    def get_winner(stats):
        """Determine the winner based on percentage."""
        if not stats:
            return None
        max_percentage = max(s['percentage'] for s in stats.values())
        if max_percentage == 0:
            return None
        winners = [uid for uid, s in stats.items() if s['percentage'] == max_percentage]
        if len(winners) == 1:
            return winners[0]
        return None  # Tie

    return jsonify({
        'users': [u.to_dict() for u in users],
        'this_week': {
            'stats': week_stats,
            'winner': get_winner(week_stats),
            'total': sum(s['count'] for s in week_stats.values())
        },
        'this_month': {
            'stats': month_stats,
            'winner': get_winner(month_stats),
            'total': sum(s['count'] for s in month_stats.values())
        },
        'all_time': {
            'stats': all_time_stats,
            'winner': get_winner(all_time_stats),
            'total': sum(s['count'] for s in all_time_stats.values())
        }
    })


# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
