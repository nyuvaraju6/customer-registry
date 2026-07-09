import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, MessageSquare, Clock, CheckCircle, Trash2, Edit, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Complaint } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/LoadingSpinner';
import ComplaintModal from '../components/ComplaintModal';

export default function Complaints() {
  const toast = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Delete confirm dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status,
        priority,
        category,
        page: page.toString(),
        limit: '10'
      });
      const data = await api.get(`/api/complaints?${query.toString()}`);
      setComplaints(data.complaints);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle Save (Create or Update/Resolve)
  const handleSaveComplaint = async (formData: Partial<Complaint>) => {
    try {
      if (selectedComplaint) {
        // Edit Mode
        await api.put(`/api/complaints/${selectedComplaint._id}`, formData);
        toast.success(`Complaint ${selectedComplaint.complaintId} updated successfully.`);
      } else {
        // Create Mode
        await api.post('/api/complaints', formData);
        toast.success('Complaint ticket filed successfully.');
        setPage(1);
      }
      fetchComplaints();
    } catch (err: any) {
      throw err;
    }
  };

  // Handle Delete
  const handleDeleteComplaint = async (id: string) => {
    try {
      await api.delete(`/api/complaints/${id}`);
      toast.success('Complaint ticket deleted successfully.');
      setDeleteConfirmId(null);
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete complaint.');
    }
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header card */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-md bg-gradient-to-br from-blue-500/5 via-indigo-500/2 to-transparent dark:from-blue-500/10 dark:via-indigo-500/5 dark:to-transparent">
        {/* Abstract premium glowing decor */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Complaints Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Audit customer complaints, dispatch support, and track resolution metrics.</p>
        </div>
        
        <button
          onClick={() => { setSelectedComplaint(null); setIsModalOpen(true); }}
          className="relative z-10 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 text-white font-medium transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" /> File Support Ticket
        </button>
      </div>

      {/* Advanced Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ticket ID, customer or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 text-xs font-medium"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold appearance-none cursor-pointer"
          >
            <option value="all">Status: All Statuses</option>
            <option value="pending">Status: Pending only</option>
            <option value="resolved">Status: Resolved only</option>
          </select>
          <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold appearance-none cursor-pointer"
          >
            <option value="all">Priority: All Urgencies</option>
            <option value="high">Priority: High Priority</option>
            <option value="medium">Priority: Medium Priority</option>
            <option value="low">Priority: Low Priority</option>
          </select>
          <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold appearance-none cursor-pointer"
          >
            <option value="all">Category: All Categories</option>
            <option value="General">Category: General</option>
            <option value="Billing">Category: Billing & Checkout</option>
            <option value="Product">Category: Product Defect</option>
            <option value="Service">Category: Support Service</option>
            <option value="Delivery">Category: Delivery Shipping</option>
            <option value="Other">Category: Other Issues</option>
          </select>
          <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Tickets Hub Table */}
      <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonLoader rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-rose-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button onClick={fetchComplaints} className="mt-2 text-xs underline text-blue-500 font-semibold flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No Tickets Filed</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No active or resolved support tickets match your search parameters. Try modifying your filter.
              </p>
            </div>
            <button
              onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); setCategory('all'); setPage(1); }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
            >
              Clear Search filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50 uppercase">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Description details</th>
                  <th className="p-4">Assigned Dispatch</th>
                  <th className="p-4">Ticket Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-200/10 dark:hover:bg-slate-800/10 transition-colors group">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-400 uppercase">{comp.complaintId}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{comp.customerName}</td>
                    <td className="p-4">{comp.category}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold capitalize ${
                        comp.priority === 'high' 
                          ? 'bg-rose-500/15 text-rose-500' 
                          : comp.priority === 'medium' 
                            ? 'bg-amber-500/15 text-amber-500' 
                            : 'bg-emerald-500/15 text-emerald-600'
                      }`}>
                        {comp.priority}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate leading-normal text-slate-500 dark:text-slate-400" title={comp.description}>
                      {comp.description}
                    </td>
                    <td className="p-4">
                      {comp.assignedTo ? (
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {comp.assignedTo}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                        comp.status === 'resolved' 
                          ? 'bg-emerald-500/15 text-emerald-600' 
                          : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {comp.status === 'resolved' ? (
                          <CheckCircle className="w-3 h-3 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 shrink-0 animate-pulse" />
                        )}
                        {comp.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedComplaint(comp); setIsModalOpen(true); }}
                          title="Audit & Resolve Ticket"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(comp._id)}
                          title="Delete Ticket"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loading && complaints.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
            <span>
              Showing Page <strong className="text-slate-800 dark:text-slate-200">{page}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({totalItems} items total)
            </span>
            
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket audit / editing form modal */}
      <ComplaintModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedComplaint(null); }}
        onSave={handleSaveComplaint}
        complaint={selectedComplaint}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Delete Ticket?</h3>
                <p className="text-xs text-slate-400">
                  This action will permanently delete this support ticket from database logs.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirmId && handleDeleteComplaint(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-md shadow-rose-500/10"
                >
                  Delete Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
