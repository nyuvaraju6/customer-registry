import { Menu, Sun, Moon, Bell, Database, HelpCircle, HardDrive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  title: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isDemoMode: boolean;
}

export default function Topbar({ onOpenMobileMenu, title, darkMode, onToggleDarkMode, isDemoMode }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 w-full h-16 glass-nav border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6">
      {/* Mobile Menu Trigger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-3">
        {/* Connection Status Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          isDemoMode 
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        }`}>
          {isDemoMode ? (
            <>
              <HardDrive className="w-3.5 h-3.5 animate-pulse" />
              <span>Demo Mode (Local JSON DB)</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB Connected</span>
            </>
          )}
        </div>

        {/* Dark Mode toggle for mobile header (quick access) */}
        <button
          onClick={onToggleDarkMode}
          className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
          </button>
        </div>

        {/* User initials bubble */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US'}
          </div>
          <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
