export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt?: string;
}

export interface Customer {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  status: 'active' | 'inactive';
  photo?: string;
  notes?: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  customerId: string;
  customerName: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'resolved';
  description: string;
  assignedTo: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    highPriorityComplaints: number;
  };
  recentCustomers: Customer[];
  recentComplaints: Complaint[];
  byCategory: { name: string; value: number }[];
  byPriority: { name: string; value: number; color: string }[];
  byStatus: { name: string; value: number }[];
  trendData: {
    month: string;
    customers: number;
    complaints: number;
    resolved: number;
  }[];
  isDemoMode: boolean;
  mongoURIProvided?: boolean;
  mongoConnectionError?: string | null;
}
