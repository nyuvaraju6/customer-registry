import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Complaints from './pages/Complaints';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Layout Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function AppContent() {
  const { user, authLoading } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Dark/Light Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch db configuration details
  useEffect(() => {
    if (user) {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          setIsDemoMode(data.demoMode);
        })
        .catch(err => console.error('Failed to parse health parameters:', err));
    }
  }, [user]);

  // Route View title mapping
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'System Dispatch Analytics';
      case 'customers':
        return 'Customer Ledger database';
      case 'customer-detail':
        return 'Customer Profile dossier';
      case 'complaints':
        return 'Support Ticket Hub';
      case 'profile':
        return 'Operator preferences';
      case 'settings':
        return 'Application Diagnostics';
      default:
        return 'SaaS Portal';
    }
  };

  const handleNavigate = (view: string, id: string | null = null) => {
    setCurrentView(view);
    if (id) {
      setSelectedId(id);
    } else {
      setSelectedId(null);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullPage={true} />;
  }

  // 1. Unauthenticated operator layout
  if (!user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        {isRegisterView ? (
          <Register onNavigateToLogin={() => setIsRegisterView(false)} />
        ) : (
          <Login onNavigateToRegister={() => setIsRegisterView(true)} />
        )}
      </div>
    );
  }

  // 2. Authenticated SaaS layout
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200`}>
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          title={getViewTitle()}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          isDemoMode={isDemoMode}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} />
          )}
          {currentView === 'customers' && (
            <Customers onNavigate={handleNavigate} />
          )}
          {currentView === 'customer-detail' && selectedId && (
            <CustomerDetail customerId={selectedId} onNavigate={handleNavigate} />
          )}
          {currentView === 'complaints' && (
            <Complaints />
          )}
          {currentView === 'profile' && (
            <Profile />
          )}
          {currentView === 'settings' && (
            <Settings darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
