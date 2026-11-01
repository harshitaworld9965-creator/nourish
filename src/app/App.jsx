import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NourishProvider } from '../store/NourishProvider.jsx';
import { ToastProvider } from '../components/ui/Toast.jsx';
import { AppShell } from '../components/AppShell/AppShell.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Diary from '../pages/Diary/Diary.jsx';

// Chart-heavy and less-used pages load on demand to keep first paint fast
const FoodDatabase = lazy(() => import('../pages/FoodDatabase/FoodDatabase.jsx'));
const Weight = lazy(() => import('../pages/Weight/Weight.jsx'));
const Activity = lazy(() => import('../pages/Activity/Activity.jsx'));
const Analytics = lazy(() => import('../pages/Analytics/Analytics.jsx'));
const Settings = lazy(() => import('../pages/Settings/Settings.jsx'));

export default function App() {
  return (
    <NourishProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="diary" element={<Diary />} />
              <Route path="foods" element={<FoodDatabase />} />
              <Route path="weight" element={<Weight />} />
              <Route path="activity" element={<Activity />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </NourishProvider>
  );
}
