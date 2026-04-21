
import { Navigate, Route, Routes } from 'react-router-dom';
import SkillDashboard from './screens/SkillDashboard';
import LoginScreen from './screens/LoginScreen';
import MainLayout from './layouts/MainLayout';
import ViewJourney from './screens/ViewJourney';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <SkillDashboard />
          </MainLayout>
        }
      />
      <Route
        path="/journey"
        element={
          <MainLayout>
            <ViewJourney />
          </MainLayout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
