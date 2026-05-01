
import { Navigate, Route, Routes } from 'react-router-dom';
import SkillDashboard from './screens/SkillDashboard';
import LoginScreen from './screens/LoginScreen';
import MainLayout from './layouts/MainLayout';
import ViewJourney from './screens/ViewJourney';
import SessionMode from './screens/SessionMode';
import RequireAuth from './components/auth/RequireAuth';
import GlobalTimerWidget from './components/ui/GlobalTimerWidget';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <MainLayout>
                <SkillDashboard />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/journey"
          element={
            <RequireAuth>
              <MainLayout>
                <ViewJourney />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/session"
          element={
            <RequireAuth>
              <SessionMode />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <GlobalTimerWidget />
    </>
  );
}
