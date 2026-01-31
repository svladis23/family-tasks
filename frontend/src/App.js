import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import TodayPage from './pages/TodayPage';
import DailyTasksPage from './pages/DailyTasksPage';
import WeeklyTasksPage from './pages/WeeklyTasksPage';
import ExtraTasksPage from './pages/ExtraTasksPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Today
          </NavLink>
          <NavLink to="/daily" className={({ isActive }) => isActive ? 'active' : ''}>
            Daily
          </NavLink>
          <NavLink to="/weekly" className={({ isActive }) => isActive ? 'active' : ''}>
            Weekly
          </NavLink>
          <NavLink to="/extra" className={({ isActive }) => isActive ? 'active' : ''}>
            Extra
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            Analytics
          </NavLink>
        </div>
      </nav>

      {/* Main content */}
      <main className="container">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/daily" element={<DailyTasksPage />} />
          <Route path="/weekly" element={<WeeklyTasksPage />} />
          <Route path="/extra" element={<ExtraTasksPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
