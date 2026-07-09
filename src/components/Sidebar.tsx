import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, MessageSquareWarning, User, Settings, LogOut, Moon, Sun, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({ currentView, onNavigate, isOpen, onClose, darkMode, onToggleDarkMode }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer Registry', icon: Users },
    { id: 'complaints', label: 'Complaints Hub', icon: MessageSquareWarning },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50/80 dark:bg-slate-900/80 border-r border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
            CR
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight">CustRegistry</h1>
            <p className="text-xs text-slate-400 font-medium">SaaS Admin Portal</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'customers' && currentView === 'customer-detail');
          
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'text-blue-600 dark:text-white bg-blue-50/50 dark:bg-blue-600/10'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Quick Action / Mode / User Card */}
      <div className="p-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4">
        {/* Dark/Light Mode fast action */}
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-200/25 dark:hover:bg-slate-800/25 transition-colors text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
          <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded uppercase">
            Toggle
          </span>
        </button>

        {/* User context card */}
        <div className="p-3 bg-slate-200/40 dark:bg-slate-800/30 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/20">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</h4>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                user?.role === 'admin' ? 'bg-rose-500/15 text-rose-500' : 'bg-blue-500/15 text-blue-500'
              }`}>
                {user?.role || 'staff'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-500/15 rounded-lg"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 h-screen fixed top-0 left-0 z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
            />
            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
