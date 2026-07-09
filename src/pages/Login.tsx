import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, RefreshCw, KeyRound, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onNavigateToRegister: () => void;
}

type AuthScreenState = 'login' | 'forgot' | 'reset';

export default function Login({ onNavigateToRegister }: LoginProps) {
  const { login } = useAuth();
  const toast = useToast();

  const [screen, setScreen] = useState<AuthScreenState>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Reset password state (UI only)
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      // error toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSent(true);
      toast.success('Demonstration Reset Link transmitted successfully.');
    }, 1000);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      toast.error('Please enter the reset code and a new password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Your account password was updated successfully (Demo).');
      setScreen('login');
      setForgotSent(false);
      setForgotEmail('');
      setResetCode('');
      setNewPassword('');
    }, 1000);
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

        {/* Auth Glass Card */}
        <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-2xl relative overflow-hidden text-sm">
          <AnimatePresence mode="wait">
            {/* LOGIN SCREEN */}
            {screen === 'login' && (
              <motion.div
                key="login-screen"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Sign In</h3>
                  <p className="text-xs text-slate-400">Welcome back. Authenticate with your email below.</p>
                </div>

                {/* Quick login helper info */}
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/15 flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-400">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Demo Admin Login:</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Email: <code>admin@example.com</code> / Password: <code>password123</code>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setScreen('forgot')}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Remember Me Toggle */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-200 dark:border-slate-800 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      Remember this session
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 text-white rounded-xl font-semibold transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : null}
                    Authenticate Session
                  </button>
                </form>

                <div className="text-center text-xs text-slate-400 pt-2">
                  Don't have an operator account?{' '}
                  <button
                    onClick={onNavigateToRegister}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Register One Now
                  </button>
                </div>
              </motion.div>
            )}

            {/* FORGOT PASSWORD SCREEN */}
            {screen === 'forgot' && (
              <motion.div
                key="forgot-screen"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <button
                  onClick={() => { setScreen('login'); setForgotSent(false); }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Recover Account</h3>
                  <p className="text-xs text-slate-400">Enter your email and we'll transmit recovery parameters.</p>
                </div>

                {!forgotSent ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="johndoe@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-75"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                      Transmit Recovery Link
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Reset Code Transmitted</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        We sent a simulated recovery link to <strong>{forgotEmail}</strong>. (Demo mode)
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setScreen('reset')}
                        className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                      >
                        Proceed to Reset Password UI
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* RESET PASSWORD SCREEN */}
            {screen === 'reset' && (
              <motion.div
                key="reset-screen"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Reset Account Password</h3>
                  <p className="text-xs text-slate-400">Provide the 6-digit verification code sent to your email.</p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 text-center tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">New Account Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-75"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    Confirm Password Reset
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
