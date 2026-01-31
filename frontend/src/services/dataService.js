// Data service for Firebase Firestore operations

import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  DAILY_TASKS: 'dailyTasks',
  WEEKLY_TASKS: 'weeklyTasks',
  EXTRA_TASKS: 'extraTasks',
  COMPLETIONS: 'completions'
};

// Users (hardcoded for this app)
export const USERS = [
  { id: 1, name: 'Vlad' },
  { id: 2, name: 'Maayan' }
];

// Helper to get today's date as string (YYYY-MM-DD)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get day number (1=Sunday, 5=Thursday, 6=Friday, 7=Saturday)
const getTodayDayNumber = () => {
  const today = new Date();
  // JavaScript: Sunday=0, Monday=1, ..., Saturday=6
  // We want: Sunday=1, Monday=2, ..., Saturday=7
  return today.getDay() + 1;
};

// ============ DAILY TASKS ============

export const getDailyTasks = async () => {
  const q = query(collection(db, COLLECTIONS.DAILY_TASKS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createDailyTask = async (title) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_TASKS), {
    title: title.trim(),
    active: true,
    createdAt: Timestamp.now()
  });
  return { id: docRef.id, title: title.trim(), active: true };
};

export const updateDailyTask = async (taskId, updates) => {
  const docRef = doc(db, COLLECTIONS.DAILY_TASKS, taskId);
  await updateDoc(docRef, updates);
};

export const deleteDailyTask = async (taskId) => {
  await deleteDoc(doc(db, COLLECTIONS.DAILY_TASKS, taskId));
};

// ============ WEEKLY TASKS ============

export const getWeeklyTasks = async () => {
  const q = query(collection(db, COLLECTIONS.WEEKLY_TASKS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createWeeklyTask = async (title, daysOfWeek) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.WEEKLY_TASKS), {
    title: title.trim(),
    days_of_week: daysOfWeek,
    active: true,
    createdAt: Timestamp.now()
  });
  return { id: docRef.id, title: title.trim(), days_of_week: daysOfWeek, active: true };
};

export const updateWeeklyTask = async (taskId, updates) => {
  const docRef = doc(db, COLLECTIONS.WEEKLY_TASKS, taskId);
  await updateDoc(docRef, updates);
};

export const deleteWeeklyTask = async (taskId) => {
  await deleteDoc(doc(db, COLLECTIONS.WEEKLY_TASKS, taskId));
};

// ============ EXTRA TASKS ============

export const getExtraTasks = async (pendingOnly = false) => {
  let q;
  if (pendingOnly) {
    q = query(
      collection(db, COLLECTIONS.EXTRA_TASKS),
      where('completed', '==', false),
      orderBy('dueDate', 'asc')
    );
  } else {
    q = query(collection(db, COLLECTIONS.EXTRA_TASKS), orderBy('dueDate', 'asc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createExtraTask = async (title, dueDate) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.EXTRA_TASKS), {
    title: title.trim(),
    dueDate: dueDate,
    completed: false,
    completedByUserId: null,
    completedAt: null,
    createdAt: Timestamp.now()
  });
  return { id: docRef.id, title: title.trim(), dueDate, completed: false };
};

export const completeExtraTask = async (taskId, userId) => {
  const docRef = doc(db, COLLECTIONS.EXTRA_TASKS, taskId);
  await updateDoc(docRef, {
    completed: true,
    completedByUserId: userId,
    completedAt: Timestamp.now()
  });

  // Also add to completions
  await addDoc(collection(db, COLLECTIONS.COMPLETIONS), {
    completionDate: getTodayString(),
    taskType: 'extra',
    taskId: taskId,
    userId: userId,
    completedAt: Timestamp.now()
  });
};

export const deleteExtraTask = async (taskId) => {
  await deleteDoc(doc(db, COLLECTIONS.EXTRA_TASKS, taskId));
};

// ============ TODAY'S TASKS ============

export const getTodayData = async () => {
  const today = getTodayString();
  const todayDayNumber = getTodayDayNumber();
  const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get all active daily tasks
  const dailyQuery = query(
    collection(db, COLLECTIONS.DAILY_TASKS),
    where('active', '==', true)
  );
  const dailySnapshot = await getDocs(dailyQuery);
  const dailyTasks = dailySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get all active weekly tasks
  const weeklyQuery = query(
    collection(db, COLLECTIONS.WEEKLY_TASKS),
    where('active', '==', true)
  );
  const weeklySnapshot = await getDocs(weeklyQuery);
  const allWeeklyTasks = weeklySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Filter weekly tasks for today
  const weeklyTasks = allWeeklyTasks.filter(task => {
    const days = task.days_of_week.split(',').map(d => parseInt(d));
    return days.includes(todayDayNumber);
  });

  // Get extra tasks due today (not completed)
  const extraQuery = query(
    collection(db, COLLECTIONS.EXTRA_TASKS),
    where('dueDate', '==', today),
    where('completed', '==', false)
  );
  const extraSnapshot = await getDocs(extraQuery);
  const extraTasks = extraSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get today's completions
  const completionsQuery = query(
    collection(db, COLLECTIONS.COMPLETIONS),
    where('completionDate', '==', today)
  );
  const completionsSnapshot = await getDocs(completionsQuery);
  const completions = completionsSnapshot.docs.map(doc => doc.data());

  // Build completion map
  const completionMap = {};
  completions.forEach(comp => {
    const key = `${comp.taskType}-${comp.taskId}`;
    if (!completionMap[key]) {
      completionMap[key] = [];
    }
    completionMap[key].push(comp.userId);
  });

  // Add completion info to tasks
  const dailyTasksWithCompletions = dailyTasks.map(task => ({
    ...task,
    completed_by_users: completionMap[`daily-${task.id}`] || []
  }));

  const weeklyTasksWithCompletions = weeklyTasks.map(task => ({
    ...task,
    completed_by_users: completionMap[`weekly-${task.id}`] || []
  }));

  return {
    date: today,
    day_of_week: todayDayNumber,
    day_name: dayNames[todayDayNumber],
    daily_tasks: dailyTasksWithCompletions,
    weekly_tasks: weeklyTasksWithCompletions,
    extra_tasks: extraTasks
  };
};

// ============ COMPLETIONS ============

export const toggleCompletion = async (taskType, taskId, userId) => {
  const today = getTodayString();

  // Check if completion exists
  const q = query(
    collection(db, COLLECTIONS.COMPLETIONS),
    where('completionDate', '==', today),
    where('taskType', '==', taskType),
    where('taskId', '==', taskId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Remove completion
    await deleteDoc(snapshot.docs[0].ref);
    return { completed: false };
  } else {
    // Add completion
    await addDoc(collection(db, COLLECTIONS.COMPLETIONS), {
      completionDate: today,
      taskType: taskType,
      taskId: taskId,
      userId: userId,
      completedAt: Timestamp.now()
    });
    return { completed: true };
  }
};

// ============ ANALYTICS ============

export const getAnalytics = async () => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  const monthAgoStr = monthAgo.toISOString().split('T')[0];

  // Get all completions
  const snapshot = await getDocs(collection(db, COLLECTIONS.COMPLETIONS));
  const allCompletions = snapshot.docs.map(doc => doc.data());

  const calculateStats = (completions) => {
    const total = completions.length;
    if (total === 0) {
      return {
        stats: {
          1: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 }
        },
        total: 0,
        winner: null
      };
    }

    const stats = {};
    USERS.forEach(user => {
      const count = completions.filter(c => c.userId === user.id).length;
      stats[user.id] = {
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10
      };
    });

    // Determine winner
    let winner = null;
    const maxPercentage = Math.max(...Object.values(stats).map(s => s.percentage));
    if (maxPercentage > 0) {
      const winners = Object.entries(stats)
        .filter(([_, s]) => s.percentage === maxPercentage)
        .map(([id, _]) => parseInt(id));
      if (winners.length === 1) {
        winner = winners[0];
      }
    }

    return { stats, total, winner };
  };

  // Filter by date ranges
  const weekCompletions = allCompletions.filter(c => c.completionDate >= weekAgoStr);
  const monthCompletions = allCompletions.filter(c => c.completionDate >= monthAgoStr);

  return {
    users: USERS,
    this_week: calculateStats(weekCompletions),
    this_month: calculateStats(monthCompletions),
    all_time: calculateStats(allCompletions)
  };
};

// ============ SEED DATA ============

export const initializeSeedData = async () => {
  // Check if data already exists
  const dailySnapshot = await getDocs(collection(db, COLLECTIONS.DAILY_TASKS));
  if (!dailySnapshot.empty) {
    console.log('Data already exists, skipping seed');
    return;
  }

  console.log('Initializing seed data...');

  // Add daily tasks
  const dailyTasks = ['Wash dishes', 'Take vitamins', 'Make bed'];
  for (const title of dailyTasks) {
    await addDoc(collection(db, COLLECTIONS.DAILY_TASKS), {
      title,
      active: true,
      createdAt: Timestamp.now()
    });
  }

  // Add weekly tasks (1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu)
  const weeklyTasks = [
    { title: 'Take out trash', days_of_week: '1,4' },      // Sunday and Wednesday
    { title: 'Vacuum living room', days_of_week: '3,5' },  // Tuesday and Thursday
    { title: 'Water plants', days_of_week: '2,4' }         // Monday and Wednesday
  ];
  for (const task of weeklyTasks) {
    await addDoc(collection(db, COLLECTIONS.WEEKLY_TASKS), {
      ...task,
      active: true,
      createdAt: Timestamp.now()
    });
  }

  // Add extra tasks
  const today = getTodayString();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const extraTasks = [
    { title: 'Fix bathroom sink', dueDate: today },
    { title: 'Organize closet', dueDate: nextWeekStr }
  ];
  for (const task of extraTasks) {
    await addDoc(collection(db, COLLECTIONS.EXTRA_TASKS), {
      ...task,
      completed: false,
      completedByUserId: null,
      completedAt: null,
      createdAt: Timestamp.now()
    });
  }

  console.log('Seed data initialized!');
};
