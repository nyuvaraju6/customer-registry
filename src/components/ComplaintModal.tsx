import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { Complaint, Customer } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Complaint>) => Promise<void>;
  complaint?: Complaint | null;
  preselectedCustomerId?: string | null;
}

export default function ComplaintModal({ isOpen, onClose, onSave, complaint, preselectedCustomerId }: ComplaintModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<Complaint>>({
    customerId: '',
    category: 'General',
    priority: 'medium',
    status: 'pending',
    description: '',
    assignedTo: '',
    resolution: ''
  });

  // Fetch customers list for selection if creating new and no preselected customer
  useEffect(() => {
    async function fetchCustomers() {
      if (!complaint && !preselectedCustomerId && isOpen) {
        try {
          // fetch active customers for filing complaints
          const res = await api.get('/api/customers?limit=100');
          setCustomers(res.customers);
        } catch (err) {
          console.error('Error fetching customers:', err);
        }
      }
    }
    fetchCustomers();
  }, [complaint, preselectedCustomerId, isOpen]);

  useEffect(() => {
    if (complaint) {
      setFormData({
        ...complaint
      });
    } else {
      setFormData({
        customerId: preselectedCustomerId || '',
        category: 'General',
        priority: 'medium',
        status: 'pending',
        description: '',
        assignedTo: '',
        resolution: ''
      });
    }
  }, [complaint, preselectedCustomerId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error('Please select a customer.');
      return;
    }
    if (!formData.category || !formData.description) {
      toast.error('Please enter category and complaint details.');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving complaint.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter customers based on lookup search
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-600/15 flex items-center justify-center text-rose-500 dark:text-rose-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {complaint ? 'Audit Support Ticket' : 'File Support Ticket'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {/* Customer Selection Block */}
          {!complaint && !preselectedCustomerId ? (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Select Customer <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search customer ledger name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
                
                {formData.customerId ? (
                  <div className="p-3 bg-emerald-500/10 rounded-xl flex items-center justify-between border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                    <span>
                      Selected Customer:{' '}
                      {customers.find(c => c._id === formData.customerId)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, customerId: '' }))}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="max-h-32 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-slate-400 text-center">No active customers matching search query.</div>
                    ) : (
                      filteredCustomers.map(cust => (
                        <button
                          key={cust._id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, customerId: cust._id }))}
                          className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex justify-between items-center transition-colors"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{cust.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{cust.customerId}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            complaint && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active Customer Name</span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{complaint.customerName}</h4>
                <p className="text-xs font-mono text-slate-400">TICKET: {complaint.complaintId}</p>
              </div>
            )
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                name="category"
                value={formData.category || 'General'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="General">General</option>
                <option value="Billing">Billing & Checkout</option>
                <option value="Product">Product Defect</option>
                <option value="Service">Technical Support</option>
                <option value="Delivery">Shipping & Courier</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Urgency Priority</label>
              <select
                name="priority"
                value={formData.priority || 'medium'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Description details */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 font-semibold">
              Complaint Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="State full details about customer's problem or incident log..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Assignment & Resolution (For auditing/status changes) */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Staff Assignment & Resolution Notes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assigned Dispatch Staff</label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo || ''}
                  onChange={handleChange}
                  placeholder="Support Staff Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ticket Status</label>
                <select
                  name="status"
                  value={formData.status || 'pending'}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                >
                  <option value="pending">Pending (Active Dispute)</option>
                  <option value="resolved">Resolved (Closed Dispute)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Resolution Dialogue Logs</label>
              <textarea
                name="resolution"
                rows={3}
                value={formData.resolution || ''}
                onChange={handleChange}
                placeholder="Details of the agreement or resolution with customer..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/10"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : null}
              {complaint ? 'Resolve Ticket' : 'File Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
