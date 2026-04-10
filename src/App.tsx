import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './store/mockDb';
import { useState, useEffect } from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import PatientSearch from './components/PatientSearch';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ChangePassword from './pages/ChangePassword';
import SurgicalLog from './pages/SurgicalLog';
import CommunityFeed from './pages/CommunityFeed';
import PatientProfile from './pages/PatientProfile';
import CaseDetails from './pages/CaseDetails';

export default function App() {
  const { currentUser, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleRtl = () => setIsRtl(!isRtl);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200 font-sans">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur print:hidden">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center text-white font-bold">
                O
              </div>
              <span className="font-semibold text-lg hidden sm:inline-block">OrthoLog</span>
            </Link>

            {currentUser && currentUser.role === 'doctor' && !currentUser.mustChangePassword && (
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <PatientSearch />
              </div>
            )}

            <div className="flex items-center gap-4">
              <button onClick={toggleRtl} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle RTL/LTR">
                <Languages className="w-5 h-5" />
              </button>
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle Dark Mode">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {currentUser && (
                <div className="flex items-center gap-4 ml-4 border-l pl-4 border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <button 
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Search */}
          {currentUser && currentUser.role === 'doctor' && !currentUser.mustChangePassword && (
            <div className="md:hidden px-4 pb-3">
              <PatientSearch />
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              !currentUser ? <Navigate to="/login" /> :
              currentUser.mustChangePassword ? <Navigate to="/change-password" /> :
              currentUser.role === 'admin' ? <AdminDashboard /> : <DoctorDashboard />
            } />
            
            <Route path="/change-password" element={
              !currentUser ? <Navigate to="/login" /> :
              !currentUser.mustChangePassword ? <Navigate to="/" /> :
              <ChangePassword />
            } />

            <Route path="/log-surgery" element={
              !currentUser ? <Navigate to="/login" /> :
              currentUser.role !== 'doctor' ? <Navigate to="/" /> :
              <SurgicalLog />
            } />

            <Route path="/edit-case/:id" element={
              !currentUser ? <Navigate to="/login" /> :
              currentUser.role !== 'doctor' ? <Navigate to="/" /> :
              <SurgicalLog />
            } />

            <Route path="/patient/:id" element={
              !currentUser ? <Navigate to="/login" /> :
              currentUser.role !== 'doctor' ? <Navigate to="/" /> :
              <PatientProfile />
            } />

            <Route path="/case/:id" element={
              !currentUser ? <Navigate to="/login" /> :
              <CaseDetails />
            } />

            <Route path="/community" element={
              !currentUser ? <Navigate to="/login" /> :
              <CommunityFeed />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
