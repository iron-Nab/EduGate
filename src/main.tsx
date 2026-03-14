import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './lib/i18n';
import './index.css';
import App from './App';
import { DashboardPage } from './pages/DashboardPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { RoomsPage } from './pages/RoomsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { CoursesPage } from './pages/CoursesPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { StudentGroupsPage } from './pages/StudentGroupsPage';
import { TimeSlotsPage } from './pages/TimeSlotsPage';
import { SemestersPage } from './pages/SemestersPage';
import { TimetablePage } from './pages/TimetablePage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="instructors" element={<InstructorsPage />} />
          <Route path="groups" element={<StudentGroupsPage />} />
          <Route path="timeslots" element={<TimeSlotsPage />} />
          <Route path="semesters" element={<SemestersPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);
