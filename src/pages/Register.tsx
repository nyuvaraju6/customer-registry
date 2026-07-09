import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function Register({ onNavigateToLogin }: RegisterProps) {
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please enter all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      // error toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb10_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 text-white font-extrabold text-2xl mx-auto">
            CR
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">CustRegistry Portal</h2>
            <p className="text-xs text-slate-400 font-medium">Customer Ledger & Support Ticket Dashboard</p>
          </div>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-2xl relative overflow-hidden text-sm">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Create Operator Account</h3>
              <p className="text-xs text-slate-400">Register as a CRM operator to manage active customer ledgers.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Operator Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Staff Member"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 text-white rounded-xl font-semibold transition-all disabled:opacity-70"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : null}
                Register Operator Profile
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 flex items-center justify-center gap-1">
              <button
                onClick={onNavigateToLogin}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login Screen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
