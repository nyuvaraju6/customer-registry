import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { Users, UserCheck, UserX, MessageSquare, Clock, CheckCheck, ChevronRight, AlertCircle, Sparkles, Database, ExternalLink, ShieldAlert } from 'lucide-react';
import { DashboardStats, Customer, Complaint } from '../types';
import { api } from '../lib/api';
import { StatCardSkeleton, LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await api.get('/api/dashboard/stats');
        setData(stats);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message || 'Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 border border-rose-500/10">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Analytics Load Failed</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); }}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, recentCustomers, recentComplaints, byCategory, byPriority, trendData, isDemoMode, mongoURIProvided, mongoConnectionError } = data;

  // Custom styling for cards
  const cards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: `${stats.activeCustomers} active / ${stats.inactiveCustomers} inactive`,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 border-blue-500/20'
    },
    {
      title: 'Active Accounts',
      value: stats.activeCustomers,
      change: 'Subscribed & operational',
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Pending Complaints',
      value: stats.pendingComplaints,
      change: `${stats.highPriorityComplaints} marked critical`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20'
    },
    {
      title: 'Resolved Disputes',
      value: stats.resolvedComplaints,
      change: '100% satisfaction rate',
      icon: CheckCheck,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400 border-indigo-500/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-500/10 shadow-md bg-gradient-to-br from-blue-500/5 via-indigo-500/2 to-transparent dark:from-blue-500/10 dark:via-indigo-500/5 dark:to-transparent">
        {/* Abstract premium glowing decor */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-md">
              Overview
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Registry Metrics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics and support dispatch board status.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 shrink-0">
          <button
            onClick={() => onNavigate('customers')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            Add Customer
          </button>
          <button
            onClick={() => onNavigate('complaints')}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer"
          >
            Manage Complaints
          </button>
        </div>
      </div>

      {/* MongoDB Connectivity Diagnostic Warning */}
      {mongoURIProvided && mongoConnectionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden glass-card rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-amber-500/1 to-transparent dark:from-amber-500/10 dark:via-amber-500/2 dark:to-transparent shadow-lg"
        >
          {/* Abstract background decor */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-5 items-start relative z-10">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-amber-100 tracking-tight flex items-center gap-2">
                  <span>Database Connection Action Required</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-md">
                    Atlas IP Blocked
                  </span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Your custom database URI is configured, but connection failed. 
                  MongoDB Atlas is blocking the connection because our hosting platform (Cloud Run) uses dynamic outgoing IP addresses that are not currently whitelisted.
                </p>
              </div>

              {/* Action Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-500/5 dark:bg-slate-900/40 border border-slate-500/10 p-3.5 rounded-xl space-y-1">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">🔧 How to enable MongoDB Atlas:</h4>
                  <ol className="list-decimal pl-4 text-slate-500 dark:text-slate-400 space-y-1 mt-1.5">
                    <li>Go to your <strong className="text-blue-600 dark:text-blue-400">MongoDB Atlas Network Access</strong> tab.</li>
                    <li>Click <strong className="text-slate-700 dark:text-slate-300">Add IP Address</strong>.</li>
                    <li>Select <strong className="text-slate-700 dark:text-slate-300">Allow Access From Anywhere</strong> (<code className="bg-slate-200 dark:bg-slate-800 px-1 rounded font-mono">0.0.0.0/0</code>).</li>
                    <li>Save, and your app will automatically connect!</li>
                  </ol>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Seamless Local Fallback Active
                    </h4>
                    <p className="text-emerald-600/90 dark:text-emerald-400/80 mt-1.5 leading-relaxed">
                      <strong>No rush!</strong> Our robust local database fallback is fully active. All operations (creating customers, filing tickets, exporting CSVs) are running 100% locally and safely in the background.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                    Diagnostic message: {mongoConnectionError}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Unified Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Metric Card 1: Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="lg:col-span-3 glass-card p-6 rounded-2xl shadow-xs border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative z-10 flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Customers</span>
            <div className="p-2.5 rounded-xl border text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 border-blue-500/20 transition-all duration-300 group-hover:scale-110">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.totalCustomers}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {stats.activeCustomers} active / {stats.inactiveCustomers} inactive
            </p>
          </div>
        </motion.div>

        {/* Metric Card 2: Active Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="lg:col-span-3 glass-card p-6 rounded-2xl shadow-xs border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative z-10 flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Accounts</span>
            <div className="p-2.5 rounded-xl border text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20 transition-all duration-300 group-hover:scale-110">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.activeCustomers}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Subscribed & operational
            </p>
          </div>
        </motion.div>

        {/* Metric Card 3: Pending Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="lg:col-span-3 glass-card p-6 rounded-2xl shadow-xs border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative z-10 flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Complaints</span>
            <div className="p-2.5 rounded-xl border text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20 transition-all duration-300 group-hover:scale-110">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.pendingComplaints}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {stats.highPriorityComplaints} marked critical
            </p>
          </div>
        </motion.div>

        {/* Metric Card 4: Resolved Disputes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="lg:col-span-3 glass-card p-6 rounded-2xl shadow-xs border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative z-10 flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Resolved Disputes</span>
            <div className="p-2.5 rounded-xl border text-indigo-600 bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400 border-indigo-500/20 transition-all duration-300 group-hover:scale-110">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.resolvedComplaints}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              100% satisfaction rate
            </p>
          </div>
        </motion.div>

        {/* Line Chart: Customer Growth & Complaint trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="md:col-span-2 lg:col-span-8 glass-card p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Growth & Complaints Trend</h3>
              <p className="text-xs text-slate-400">Customer acquisition vs registered disputes (6 months)</p>
            </div>
          </div>
          <div className="h-72 w-full text-xs relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    color: '#1E293B'
                  }}
                  itemStyle={{ color: '#1E293B' }}
                />
                <Legend />
                <Line type="monotone" dataKey="customers" name="New Customers" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="complaints" name="Complaints Filed" stroke="#EF4444" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: Complaints by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="md:col-span-1 lg:col-span-4 glass-card p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Priority Distribution</h3>
            <p className="text-xs text-slate-400">Breakdown of support tickets by urgency</p>
          </div>
          
          <div className="h-56 w-full flex items-center justify-center relative my-3 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {byPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val} complaints`, 'Count']}
                  contentStyle={{ borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Text */}
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {stats.totalComplaints}
              </span>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Disputes
              </p>
            </div>
          </div>

          <div className="space-y-1.5 relative z-10">
            {byPriority.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} Urgency
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="md:col-span-1 lg:col-span-6 glass-card p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Additions</h3>
              <p className="text-xs text-slate-400">Latest additions to the customer ledger</p>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View ledger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50 relative z-10">
            {recentCustomers.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No customers registered yet.</div>
            ) : (
              recentCustomers.map((cust) => (
                <div
                  key={cust._id}
                  onClick={() => onNavigate('customer-detail', cust._id)}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-200/10 dark:hover:bg-slate-800/10 px-2 rounded-xl cursor-pointer transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {cust.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{cust.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      cust.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-400/10 text-slate-500'
                    }`}>
                      {cust.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="md:col-span-1 lg:col-span-6 glass-card p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/2 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Latest Tickets</h3>
              <p className="text-xs text-slate-400">Recently filed disputes requiring action</p>
            </div>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open hub <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50 relative z-10">
            {recentComplaints.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No complaints logged yet.</div>
            ) : (
              recentComplaints.map((comp) => (
                <div
                  key={comp._id}
                  onClick={() => onNavigate('complaints')}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-200/10 dark:hover:bg-slate-800/10 px-2 rounded-xl cursor-pointer transition-colors duration-200"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {comp.complaintId}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                        comp.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : comp.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {comp.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {comp.customerName}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{comp.description}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize border ${
                      comp.status === 'resolved' 
                        ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                        : 'bg-amber-500/5 text-amber-500 border-amber-500/10'
                    }`}>
                      {comp.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
