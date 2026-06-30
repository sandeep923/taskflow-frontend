import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import { useAuthStore } from './store/authStore';
import Spinner from './components/Spinner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isInitialized } = useAuthStore();

  // Wait until localStorage is checked
if (!isInitialized) {
  return <Spinner />;
}
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;