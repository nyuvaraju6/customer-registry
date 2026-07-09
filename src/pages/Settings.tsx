import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Sun, Moon, Database, ShieldAlert, Cpu, Heart, CheckCircle2, HardDrive } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

interface SettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Settings({ darkMode, onToggleDarkMode }: SettingsProps) {
  const toast = useToast();
  const [dbStatus, setDbStatus] = useState<{
    database: string;
    demoMode: boolean;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const health = await api.get('/api/health');
        setDbStatus(health);
      } catch (err) {
        console.error('Failed to load health indicators:', err);
      }
    }
    fetchHealth();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 text-sm"
    >
      {/* Settings Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600" /> System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Configure system themes, verify cloud run secrets, and check database statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme customization */}
        <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {darkMode ? <Moon className="w-4.5 h-4.5 text-blue-500" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
            Visual Theme Style
          </h3>
          <p className="text-xs text-slate-400">
            Choose between full high-contrast Light mode or eye-safe Glassmorphic Dark theme styles.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { if (darkMode) onToggleDarkMode(); }}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${
                !darkMode 
                  ? 'border-blue-500 bg-blue-50/20 text-blue-600 font-bold' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span>Light Theme</span>
            </button>

            <button
              onClick={() => { if (!darkMode) onToggleDarkMode(); }}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${
                darkMode 
                  ? 'border-blue-500 bg-blue-900/10 text-blue-500 font-bold' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Database Status & Diagnostics */}
        <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-blue-500" /> Database Diagnostics
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Active Database Engine</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  dbStatus?.demoMode 
                    ? 'bg-amber-500/10 text-amber-600' 
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {dbStatus?.database || 'Local JSON Fallback'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/50 pt-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Workspace Directory</span>
                <span className="font-mono text-[10px] text-slate-400 text-right shrink-0">/data/db.json</span>
              </div>
            </div>

            {dbStatus?.demoMode ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-normal">
                  <strong>Running in Demo Mode:</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    To enable MongoDB Atlas, configure the <code>MONGODB_URI</code> environment variable inside the <strong>Secrets Panel</strong> in AI Studio settings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-normal">
                  <strong>Connected to Cloud Database:</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your records are being synced in real-time to your custom production MongoDB Atlas cluster.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deployment & Environment Variables Guide */}
      <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4.5 h-4.5 text-blue-500" /> Environment Deployment Credentials
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          For full production deployment, the application reads the following secrets from your container environment. Do not commit actual credentials to code.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">MONGODB_URI</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              MongoDB Atlas standard cluster connection string with auth credentials.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">JWT_SECRET</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Secret encryption key used to sign and decrypt client-side Bearer web tokens.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">APP_URL</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Cloud Run microservice domain used for callback handshakes and reference bindings.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
