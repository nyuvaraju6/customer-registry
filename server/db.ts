import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';

// Interface definitions for our data
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface ICustomer {
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

export interface IComplaint {
  _id: string;
  complaintId: string;
  customerId: string; // references Customer._id
  customerName: string; // cached for easy reading
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'resolved';
  description: string;
  assignedTo: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// MONGOOSE SCHEMAS
// ----------------------------------------------------
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const CustomerSchema = new Schema<ICustomer>({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipcode: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  photo: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ComplaintSchema = new Schema<IComplaint>({
  complaintId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  description: { type: String, required: true },
  assignedTo: { type: String, default: '' },
  resolution: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

// Let Mongoose compile the models or reuse existing ones
let MongooseUser: any;
let MongooseCustomer: any;
let MongooseComplaint: any;

try {
  MongooseUser = mongoose.model<IUser>('User', UserSchema);
  MongooseCustomer = mongoose.model<ICustomer>('Customer', CustomerSchema);
  MongooseComplaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
} catch (e) {
  MongooseUser = mongoose.model('User');
  MongooseCustomer = mongoose.model('Customer');
  MongooseComplaint = mongoose.model('Complaint');
}

// ----------------------------------------------------
// LOCAL PERSISTENT JSON DATABASE FALLBACK
// ----------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface ILocalDBData {
  users: IUser[];
  customers: ICustomer[];
  complaints: IComplaint[];
}

function initLocalFileDB(): ILocalDBData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    const defaultData: ILocalDBData = {
      users: [],
      customers: [],
      complaints: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON DB file, resetting database:', err);
    const defaultData = { users: [], customers: [], complaints: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function saveLocalFileDB(data: ILocalDBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save JSON DB file:', err);
  }
}

// State management
let isUsingMongoDB = false;
let lastConnectionError: string | null = null;

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('----------------------------------------------------');
    console.log('⚠️  MONGODB_URI is not set. Using Local JSON Database Fallback.');
    console.log(`📂  Data will be saved to: ${DB_FILE}`);
    console.log('----------------------------------------------------');
    isUsingMongoDB = false;
    lastConnectionError = 'MONGODB_URI is not set';
    return false;
  }

  try {
    // 8s connection timeout so we don't block the server indefinitely if Mongo is down
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('----------------------------------------------------');
    console.log('🚀 Successfully connected to MongoDB Atlas!');
    console.log('----------------------------------------------------');
    isUsingMongoDB = true;
    lastConnectionError = null;
    return true;
  } catch (err: any) {
    lastConnectionError = err.message || String(err);
    console.log('----------------------------------------------------');
    console.log('⚠️  MongoDB Connection failed. Using local JSON database.');
    console.log(`ℹ️  Reason: ${lastConnectionError}`);
    console.log('----------------------------------------------------');
    isUsingMongoDB = false;
    return false;
  }
}

export function isDbUsingMongo() {
  return isUsingMongoDB;
}

export function getMongoConnectionError() {
  return lastConnectionError;
}

// ----------------------------------------------------
// UNIFIED DATA SERVICE INTERFACE
// ----------------------------------------------------
export const db = {
  users: {
    async find() {
      if (isUsingMongoDB) {
        return await MongooseUser.find().lean();
      } else {
        const fileData = initLocalFileDB();
        return fileData.users;
      }
    },
    async findOne(query: Partial<IUser>) {
      if (isUsingMongoDB) {
        return await MongooseUser.findOne(query).lean();
      } else {
        const fileData = initLocalFileDB();
        return fileData.users.find(u => {
          return Object.entries(query).every(([key, value]) => (u as any)[key] === value);
        }) || null;
      }
    },
    async findById(id: string) {
      if (isUsingMongoDB) {
        return await MongooseUser.findById(id).lean();
      } else {
        const fileData = initLocalFileDB();
        return fileData.users.find(u => u._id === id) || null;
      }
    },
    async create(userData: Partial<IUser>) {
      if (isUsingMongoDB) {
        const user = new MongooseUser(userData);
        await user.save();
        return user.toObject();
      } else {
        const fileData = initLocalFileDB();
        const newUser: IUser = {
          _id: Math.random().toString(36).substring(2, 11),
          name: userData.name || '',
          email: userData.email || '',
          password: userData.password || '',
          role: userData.role || 'staff',
          createdAt: new Date().toISOString(),
          ...userData
        };
        fileData.users.push(newUser);
        saveLocalFileDB(fileData);
        return newUser;
      }
    },
    async update(id: string, updateData: Partial<IUser>) {
      if (isUsingMongoDB) {
        return await MongooseUser.findByIdAndUpdate(id, updateData, { new: true }).lean();
      } else {
        const fileData = initLocalFileDB();
        const index = fileData.users.findIndex(u => u._id === id);
        if (index === -1) return null;
        fileData.users[index] = { ...fileData.users[index], ...updateData };
        saveLocalFileDB(fileData);
        return fileData.users[index];
      }
    }
  },

  customers: {
    async find() {
      if (isUsingMongoDB) {
        return await MongooseCustomer.find().sort({ createdAt: -1 }).lean();
      } else {
        const fileData = initLocalFileDB();
        return [...fileData.customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    },
    async findById(id: string) {
      if (isUsingMongoDB) {
        return await MongooseCustomer.findById(id).lean();
      } else {
        const fileData = initLocalFileDB();
        return fileData.customers.find(c => c._id === id) || null;
      }
    },
    async findOne(query: Partial<ICustomer>) {
      if (isUsingMongoDB) {
        return await MongooseCustomer.findOne(query).lean();
      } else {
        const fileData = initLocalFileDB();
        return fileData.customers.find(c => {
          return Object.entries(query).every(([key, value]) => (c as any)[key] === value);
        }) || null;
      }
    },
    async create(customerData: Partial<ICustomer>) {
      if (isUsingMongoDB) {
        // Generate auto ID if not provided
        if (!customerData.customerId) {
          const count = await MongooseCustomer.countDocuments();
          customerData.customerId = `CUST-${1000 + count + 1}`;
        }
        const customer = new MongooseCustomer(customerData);
        await customer.save();
        return customer.toObject();
      } else {
        const fileData = initLocalFileDB();
        const nextIdNum = 1000 + fileData.customers.length + 1;
        const customerId = customerData.customerId || `CUST-${nextIdNum}`;
        const newCustomer: ICustomer = {
          _id: Math.random().toString(36).substring(2, 11),
          customerId,
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          gender: customerData.gender || 'male',
          dob: customerData.dob || '',
          address: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          country: customerData.country || '',
          zipcode: customerData.zipcode || '',
          status: customerData.status || 'active',
          photo: customerData.photo || '',
          notes: customerData.notes || '',
          createdAt: new Date().toISOString(),
          ...customerData
        };
        fileData.customers.push(newCustomer);
        saveLocalFileDB(fileData);
        return newCustomer;
      }
    },
    async update(id: string, updateData: Partial<ICustomer>) {
      if (isUsingMongoDB) {
        return await MongooseCustomer.findByIdAndUpdate(id, updateData, { new: true }).lean();
      } else {
        const fileData = initLocalFileDB();
        const index = fileData.customers.findIndex(c => c._id === id);
        if (index === -1) return null;
        fileData.customers[index] = { ...fileData.customers[index], ...updateData };
        saveLocalFileDB(fileData);
        return fileData.customers[index];
      }
    },
    async delete(id: string) {
      if (isUsingMongoDB) {
        return await MongooseCustomer.findByIdAndDelete(id).lean();
      } else {
        const fileData = initLocalFileDB();
        const index = fileData.customers.findIndex(c => c._id === id);
        if (index === -1) return null;
        const deleted = fileData.customers[index];
        fileData.customers.splice(index, 1);
        
        // cascade delete customer complaints
        fileData.complaints = fileData.complaints.filter(comp => comp.customerId !== id);
        
        saveLocalFileDB(fileData);
        return deleted;
      }
    }
  },

  complaints: {
    async find() {
      if (isUsingMongoDB) {
        return await MongooseComplaint.find().sort({ createdAt: -1 }).lean();
      } else {
        const fileData = initLocalFileDB();
        return [...fileData.complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    },
    async findById(id: string) {
      if (isUsingMongoDB) {
        return await MongooseComplaint.findById(id).lean();
      } else {
        const fileData = initLocalFileDB();
        return fileData.complaints.find(c => c._id === id) || null;
      }
    },
    async create(complaintData: Partial<IComplaint>) {
      if (isUsingMongoDB) {
        if (!complaintData.complaintId) {
          const count = await MongooseComplaint.countDocuments();
          complaintData.complaintId = `COMP-${1000 + count + 1}`;
        }
        const complaint = new MongooseComplaint(complaintData);
        await complaint.save();
        return complaint.toObject();
      } else {
        const fileData = initLocalFileDB();
        const nextIdNum = 1000 + fileData.complaints.length + 1;
        const complaintId = complaintData.complaintId || `COMP-${nextIdNum}`;
        const newComplaint: IComplaint = {
          _id: Math.random().toString(36).substring(2, 11),
          complaintId,
          customerId: complaintData.customerId || '',
          customerName: complaintData.customerName || '',
          category: complaintData.category || 'General',
          priority: complaintData.priority || 'medium',
          status: complaintData.status || 'pending',
          description: complaintData.description || '',
          assignedTo: complaintData.assignedTo || '',
          resolution: complaintData.resolution || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...complaintData
        };
        fileData.complaints.push(newComplaint);
        saveLocalFileDB(fileData);
        return newComplaint;
      }
    },
    async update(id: string, updateData: Partial<IComplaint>) {
      if (isUsingMongoDB) {
        updateData.updatedAt = new Date().toISOString();
        return await MongooseComplaint.findByIdAndUpdate(id, updateData, { new: true }).lean();
      } else {
        const fileData = initLocalFileDB();
        const index = fileData.complaints.findIndex(c => c._id === id);
        if (index === -1) return null;
        fileData.complaints[index] = { 
          ...fileData.complaints[index], 
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        saveLocalFileDB(fileData);
        return fileData.complaints[index];
      }
    },
    async delete(id: string) {
      if (isUsingMongoDB) {
        return await MongooseComplaint.findByIdAndDelete(id).lean();
      } else {
        const fileData = initLocalFileDB();
        const index = fileData.complaints.findIndex(c => c._id === id);
        if (index === -1) return null;
        const deleted = fileData.complaints[index];
        fileData.complaints.splice(index, 1);
        saveLocalFileDB(fileData);
        return deleted;
      }
    }
  }
};
