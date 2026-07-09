import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Edit, Plus, CheckCircle, Clock, MessageSquare, Phone, Mail, MapPin, Calendar, Heart, AlertCircle, Save, CalendarDays } from 'lucide-react';
import { Customer, Complaint } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import CustomerModal from '../components/CustomerModal';
import ComplaintModal from '../components/ComplaintModal';

interface CustomerDetailProps {
  customerId: string;
  onNavigate: (view: string, id?: string) => void;
}

export default function CustomerDetail({ customerId, onNavigate }: CustomerDetailProps) {
  const toast = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes inline state
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Fetch full details
  const fetchCustomerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/customers/${customerId}`);
      setCustomer(data.customer);
      setComplaints(data.complaints);
      setNotes(data.customer.notes || '');
    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError(err.message || 'Failed to load customer profile.');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleUpdateNotes = async () => {
    if (!customer) return;
    setSavingNotes(true);
    try {
      await api.put(`/api/customers/${customer._id}`, { notes });
      toast.success('Notes updated successfully.');
      setCustomer(prev => prev ? { ...prev, notes } : null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update CRM notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Save changes to customer info
  const handleSaveCustomer = async (formData: Partial<Customer>) => {
    try {
      await api.put(`/api/customers/${customerId}`, formData);
      toast.success('Profile details refreshed.');
      fetchCustomerDetails();
    } catch (err: any) {
      throw err;
    }
  };

  // Add a complaint
  const handleSaveComplaint = async (formData: Partial<Complaint>) => {
    try {
      if (selectedComplaint) {
        await api.put(`/api/complaints/${selectedComplaint._id}`, formData);
        toast.success('Complaint status resolved.');
      } else {
        await api.post('/api/complaints', { ...formData, customerId });
        toast.success('New support ticket filed for customer.');
      }
      fetchCustomerDetails();
    } catch (err: any) {
      throw err;
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !customer) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Profile Loading Failed</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{error || 'This customer profile could not be located.'}</p>
        <button
          onClick={() => onNavigate('customers')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Return to Ledger
        </button>
      </div>
    );
  }

  // Create timeline activities dynamically
  const activities = [
    {
      title: 'Profile Created',
      desc: 'Added to customer ledger databases.',
      time: new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      icon: Heart,
      color: 'bg-emerald-500/15 text-emerald-600'
    },
    ...complaints.map(comp => ({
      title: `Ticket Raised (${comp.complaintId})`,
      desc: `Filed under ${comp.category}: "${comp.description.slice(0, 50)}..."`,
      time: new Date(comp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      icon: MessageSquare,
      color: comp.status === 'resolved' ? 'bg-indigo-500/15 text-indigo-500' : 'bg-amber-500/15 text-amber-500'
    }))
  ].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div className="space-y-6 text-sm">
      {/* Breadcrumb nav header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('customers')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Customer Ledger
        </button>
        
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Edit className="w-4 h-4" /> Edit Profile Details
        </button>
      </div>

      {/* Main Profile Layout split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Personal Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6 text-center space-y-4">
            {/* Large avatar */}
            <div className="relative w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto border shadow-md">
              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                customer.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
            </div>
            
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{customer.customerId}</span>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">{customer.name}</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 capitalize ${
                customer.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-400/10 text-slate-500'
              }`}>
                {customer.status} Account
              </span>
            </div>

            {/* Quick Contact Icons */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 text-left pt-3 space-y-3.5 text-xs font-medium">
              <div className="flex items-start gap-3 pt-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">Email Address</span>
                  <a href={`mailto:${customer.email}`} className="text-slate-700 dark:text-slate-300 hover:underline truncate block">
                    {customer.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Phone Number</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{customer.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3.5">
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Date of Birth</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {customer.dob ? new Date(customer.dob).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Mailing Address</span>
                  <span className="text-slate-700 dark:text-slate-300 block leading-relaxed">
                    {customer.address || 'No street address'}
                  </span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    {customer.city ? `${customer.city}, ${customer.state} ${customer.zipcode}, ${customer.country}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inline CRM Notes Card */}
          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Private CRM notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Private comments, credit standings, customer mood logs..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            />
            <button
              onClick={handleUpdateNotes}
              disabled={savingNotes}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-75 shadow-md shadow-blue-500/5"
            >
              <Save className="w-3.5 h-3.5" /> {savingNotes ? 'Saving Notes...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Right Column: Complaint history & timeline activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaints Table Card */}
          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Active Support Tickets</h3>
                <p className="text-xs text-slate-400">Chronological list of all tickets reported by this account.</p>
              </div>
              
              <button
                onClick={() => { setSelectedComplaint(null); setIsComplaintOpen(true); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> File Ticket
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {complaints.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No support tickets associated with this account.</div>
              ) : (
                complaints.map(comp => (
                  <div key={comp._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">{comp.complaintId}</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{comp.category}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.2 rounded capitalize ${
                          comp.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : comp.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {comp.priority} priority
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {comp.description}
                      </p>
                      {comp.resolution && (
                        <div className="mt-2 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-400">
                          <strong>Resolution notes:</strong> {comp.resolution}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                        comp.status === 'resolved' 
                          ? 'bg-emerald-500/15 text-emerald-600' 
                          : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {comp.status === 'resolved' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-pulse" />}
                        {comp.status}
                      </span>
                      
                      <button
                        onClick={() => { setSelectedComplaint(comp); setIsComplaintOpen(true); }}
                        className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 font-semibold"
                      >
                        Audit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visual Lifecycle Timeline */}
          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Customer Timeline Ledger</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {activities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle Indicator */}
                    <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center ${act.color} z-10`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{act.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit modal */}
      <CustomerModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveCustomer}
        customer={customer}
      />

      {/* Ticket Edit modal */}
      <ComplaintModal
        isOpen={isComplaintOpen}
        onClose={() => { setIsComplaintOpen(false); setSelectedComplaint(null); }}
        onSave={handleSaveComplaint}
        complaint={selectedComplaint}
        preselectedCustomerId={customerId}
      />
    </div>
  );
}
