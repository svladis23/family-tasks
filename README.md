# Family Tasks

A simple task tracker for family members to manage household tasks and track completion statistics.

## Features

- **Daily Tasks**: Recurring tasks that appear every day
- **Weekly Tasks**: Recurring tasks on specific days of the week
- **Extra Tasks**: One-time tasks with due dates
- **Analytics**: Track who's completing more tasks with weekly, monthly, and all-time stats

## Tech Stack

- **Backend**: Python Flask with SQLite database
- **Frontend**: React with custom CSS (mobile-friendly)
- **No authentication required** - designed for 2 hardcoded users (Vlad and Maayan)

## Project Structure

```
family-tasks/
├── backend/
│   ├── app.py           # Flask application with API routes
│   ├── models.py        # Database models (SQLAlchemy)
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── TodayPage.js      # Main dashboard
│   │   │   ├── DailyTasksPage.js # Manage daily tasks
│   │   │   ├── WeeklyTasksPage.js# Manage weekly tasks
│   │   │   ├── ExtraTasksPage.js # Manage extra tasks
│   │   │   └── AnalyticsPage.js  # View statistics
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Get all users

### Daily Tasks
- `GET /api/daily-tasks` - Get all daily tasks
- `POST /api/daily-tasks` - Create a daily task
- `PUT /api/daily-tasks/:id` - Update a daily task
- `DELETE /api/daily-tasks/:id` - Delete a daily task

### Weekly Tasks
- `GET /api/weekly-tasks` - Get all weekly tasks
- `POST /api/weekly-tasks` - Create a weekly task
- `PUT /api/weekly-tasks/:id` - Update a weekly task
- `DELETE /api/weekly-tasks/:id` - Delete a weekly task

### Extra Tasks
- `GET /api/extra-tasks` - Get all extra tasks (use `?pending=true` for pending only)
- `POST /api/extra-tasks` - Create an extra task
- `PUT /api/extra-tasks/:id` - Update an extra task
- `DELETE /api/extra-tasks/:id` - Delete an extra task
- `POST /api/extra-tasks/:id/complete` - Mark an extra task as complete

### Today's Tasks
- `GET /api/today` - Get all tasks for today with completion status

### Completions
- `POST /api/completions` - Toggle task completion for a user
- `GET /api/completions` - Get completions (optional: `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`)

### Analytics
- `GET /api/analytics` - Get completion statistics for each user

## Database Schema

```sql
users:
- id (primary key)
- name (text)

daily_tasks:
- id (primary key)
- title (text)
- active (boolean)
- created_at (timestamp)

weekly_tasks:
- id (primary key)
- title (text)
- days_of_week (text, e.g., "1,3,5" for Mon/Wed/Fri)
- active (boolean)
- created_at (timestamp)

extra_tasks:
- id (primary key)
- title (text)
- due_date (date)
- completed (boolean)
- completed_by_user_id (foreign key)
- completed_at (timestamp)

task_completions:
- id (primary key)
- completion_date (date)
- task_type (text: 'daily', 'weekly', 'extra')
- task_id (integer)
- user_id (foreign key)
- completed_at (timestamp)
```

## Seed Data

The database is automatically initialized with:

**Users:**
- Vlad (id=1)
- Maayan (id=2)

**Sample Daily Tasks:**
- Wash dishes
- Take vitamins
- Make bed

**Sample Weekly Tasks:**
- Take out trash (Mon, Thu)
- Vacuum living room (Wed, Sat)
- Water plants (Tue, Fri)

**Sample Extra Tasks:**
- Fix bathroom sink (today)
- Organize closet (next week)

## Usage

1. **Today's Tasks**: View and complete tasks for the current day. Check the box next to your name to mark a task as done.

2. **Daily Tasks**: Add, edit, or delete recurring daily tasks. Toggle active/inactive status.

3. **Weekly Tasks**: Manage tasks that occur on specific days. Select which days of the week each task should appear.

4. **Extra Tasks**: Create one-time tasks with due dates. Click your name to mark as complete.

5. **Analytics**: See who's winning the household task competition with weekly, monthly, and all-time statistics.

## Color Coding

- **Vlad**: Blue (#3b82f6)
- **Maayan**: Pink (#ec4899)
