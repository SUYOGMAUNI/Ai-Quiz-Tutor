import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Quiz from './pages/Quiz';
import Stats from './pages/Stats';

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token) ?? localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="/quiz/:pdfId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
          <Route path="/stats/:pdfId" element={<PrivateRoute><Stats /></PrivateRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
