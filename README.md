# Family Tasks

A simple task tracker for family members to manage household tasks and track completion statistics. Deployed on GitHub Pages with Firebase for real-time data sync.

**Live URL**: https://svladis23.github.io/family-tasks

## Features

- **Daily Tasks**: Recurring tasks that appear every day
- **Weekly Tasks**: Recurring tasks on specific days of the week (Sun-Thu work week)
- **Extra Tasks**: One-time tasks with due dates
- **Analytics**: Track who's completing more tasks with weekly, monthly, and all-time stats
- **Real-time sync**: Data syncs across all devices via Firebase

## Tech Stack

- **Frontend**: React with custom CSS (mobile-friendly)
- **Database**: Firebase Firestore (cloud-based, real-time sync)
- **Hosting**: GitHub Pages
- **Users**: 2 hardcoded users (Vlad and Maayan)

## Setup Instructions

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter a project name (e.g., "family-tasks")
4. Disable Google Analytics (optional) and click **"Create project"**

### Step 2: Create Firestore Database

1. In your Firebase project, go to **"Build"** > **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location close to you and click **"Enable"**

### Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click the web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "family-tasks-web")
5. Copy the `firebaseConfig` object

### Step 4: Update Firebase Config in Code

1. Open `frontend/src/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Install Dependencies and Run Locally

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

### Step 6: Initialize Sample Data (First Run)

On first load, the app will automatically create sample tasks if the database is empty.

### Step 7: Deploy to GitHub Pages

```bash
cd frontend
npm run deploy
```

This will build the app and push it to the `gh-pages` branch.

### Step 8: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** > **Pages**
3. Under "Source", select **"Deploy from a branch"**
4. Select branch: **gh-pages** and folder: **/ (root)**
5. Click **Save**

Your app will be live at: `https://YOUR_USERNAME.github.io/family-tasks`

## Firestore Security Rules (Production)

For production, update your Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: These rules allow anyone to read/write. For a private family app, this is acceptable. For more security, consider adding Firebase Authentication.

## Project Structure

```
family-tasks/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── services/
│   │   │   └── dataService.js   # Firebase data operations
│   │   ├── pages/
│   │   │   ├── TodayPage.js     # Main dashboard
│   │   │   ├── DailyTasksPage.js
│   │   │   ├── WeeklyTasksPage.js
│   │   │   ├── ExtraTasksPage.js
│   │   │   └── AnalyticsPage.js
│   │   ├── firebase.js          # Firebase config
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── backend/                      # Legacy (not needed with Firebase)
└── README.md
```

## Firestore Collections

```
dailyTasks:
- title (string)
- active (boolean)
- createdAt (timestamp)

weeklyTasks:
- title (string)
- days_of_week (string, e.g., "1,3,5" for Sun/Tue/Thu)
- active (boolean)
- createdAt (timestamp)

extraTasks:
- title (string)
- dueDate (string, YYYY-MM-DD)
- completed (boolean)
- completedByUserId (number, nullable)
- completedAt (timestamp, nullable)
- createdAt (timestamp)

completions:
- completionDate (string, YYYY-MM-DD)
- taskType (string: 'daily', 'weekly', 'extra')
- taskId (string)
- userId (number)
- completedAt (timestamp)
```

## Usage

1. **Today's Tasks**: View and complete tasks for the current day. Check the box next to your name to mark a task as done.

2. **Daily Tasks**: Add, edit, or delete recurring daily tasks. Toggle active/inactive status.

3. **Weekly Tasks**: Manage tasks that occur on specific days (Sun-Thu). Select which days each task should appear.

4. **Extra Tasks**: Create one-time tasks with due dates. Click your name to mark as complete.

5. **Analytics**: See who's winning the household task competition with weekly, monthly, and all-time statistics.

## Work Week

- **Work days**: Sunday, Monday, Tuesday, Wednesday, Thursday (1-5)
- **Weekend**: Friday, Saturday (no tasks)

## Color Coding

- **Vlad**: Blue (#3b82f6)
- **Maayan**: Pink (#ec4899)
