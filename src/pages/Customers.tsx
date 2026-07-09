import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, FileSpreadsheet, Download, Filter, Trash2, Edit, Eye, UserX, UserCheck, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Customer } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/LoadingSpinner';
import CustomerModal from '../components/CustomerModal';
import CSVImportModal from '../components/CSVImportModal';

interface CustomersProps {
  onNavigate: (view: string, id?: string) => void;
}

export default function Customers({ onNavigate }: CustomersProps) {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals Toggles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Delete confirm dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch Customers list
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        limit: '10'
      });
      const data = await api.get(`/api/customers?${query.toString()}`);
      setCustomers(data.customers);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle Save (Create or Update)
  const handleSaveCustomer = async (formData: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        // Edit Mode
        const res = await api.put(`/api/customers/${selectedCustomer._id}`, formData);
        toast.success(`Customer ${formData.name} updated successfully.`);
        fetchCustomers();
      } else {
        // Add Mode
        const res = await api.post('/api/customers', formData);
        toast.success(`Customer ${formData.name} added successfully.`);
        setPage(1); // Back to first page to see the new entry
        fetchCustomers();
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Handle Delete
  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.delete(`/api/customers/${id}`);
      toast.success('Customer and related complaints deleted.');
      setDeleteConfirmId(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer.');
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // Using simple fetch to handle headers or window.open with authorization token query param
    // Let's download by building an anchor tag
    const downloadUrl = `/api/customers/export`;
    
    // We fetch it because we need custom Authorization header
    fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers_registry_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV exported successfully.');
    })
    .catch(err => {
      toast.error('Failed to export CSV: ' + err.message);
    });
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header bar */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-md bg-gradient-to-br from-blue-500/5 via-indigo-500/2 to-transparent dark:from-blue-500/10 dark:via-indigo-500/5 dark:to-transparent">
        {/* Abstract premium glowing decor */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Customer Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Maintain, search, and audit your customer ledger databases.</p>
        </div>
        
        {/* Actions row */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Batch Import
          </button>
          
          <button
            onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by full name, email address, phone, city or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 font-medium text-xs shadow-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold appearance-none cursor-pointer"
          >
            <option value="all">Filter: All Lifecycle Statuses</option>
            <option value="active">Filter: Active Accounts only</option>
            <option value="inactive">Filter: Inactive / Suspended only</option>
          </select>
          <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonLoader rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-rose-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button onClick={fetchCustomers} className="mt-2 text-xs underline text-blue-500 font-semibold flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <UserX className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No Customers Registered</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No profiles match your search criteria. Try modifying your filter, importing or adding.
              </p>
            </div>
            <button
              onClick={() => { setSearch(''); setStatus('all'); setPage(1); }}
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
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-200/10 dark:hover:bg-slate-800/10 transition-colors group">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-400 uppercase">{cust.customerId}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center shrink-0">
                          {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{cust.name}</h4>
                          <span className="text-[10px] text-slate-400 capitalize">{cust.gender}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 truncate max-w-[160px]">{cust.email}</td>
                    <td className="p-4 font-mono">{cust.phone}</td>
                    <td className="p-4 truncate">
                      {cust.city ? `${cust.city}, ${cust.country || 'US'}` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                        cust.status === 'active' 
                          ? 'bg-emerald-500/15 text-emerald-600' 
                          : 'bg-slate-400/15 text-slate-500'
                      }`}>
                        {cust.status === 'active' ? (
                          <UserCheck className="w-3 h-3 shrink-0" />
                        ) : (
                          <UserX className="w-3 h-3 shrink-0" />
                        )}
                        {cust.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onNavigate('customer-detail', cust._id)}
                          title="View Profile Details"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedCustomer(cust); setIsModalOpen(true); }}
                          title="Edit Customer Profile"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cust._id)}
                          title="Delete Customer Profile"
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
        {!loading && customers.length > 0 && (
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

      {/* Add / Edit customer profile modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCustomer(null); }}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* CSV Batch Import Modal */}
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => { setPage(1); fetchCustomers(); }}
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
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Permanently Delete?</h3>
                <p className="text-xs text-slate-400">
                  Deleting this customer will cascade delete all associated complaints. This operation is irreversible.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Keep Record
                </button>
                <button
                  onClick={() => deleteConfirmId && handleDeleteCustomer(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-md shadow-rose-500/10"
                >
                  Delete Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
