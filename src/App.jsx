import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';

function AppContent() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (user.role === 'instructor') {
    return <InstructorDashboard />;
  }

  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
