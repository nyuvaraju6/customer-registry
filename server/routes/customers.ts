import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/customers (supports search, filter, pagination)
router.get('/', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { search, status, country, page = '1', limit = '10' } = req.query;
    
    let customers = await db.customers.find();

    // 1. Search filter
    if (search) {
      const s = (search as string).toLowerCase();
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s) ||
        c.customerId.toLowerCase().includes(s) ||
        (c.city && c.city.toLowerCase().includes(s))
      );
    }

    // 2. Status filter
    if (status && status !== 'all') {
      customers = customers.filter(c => c.status === status);
    }

    // 3. Country filter
    if (country && country !== 'all') {
      customers = customers.filter(c => c.country.toLowerCase() === (country as string).toLowerCase());
    }

    // 4. Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    const paginatedCustomers = customers.slice(startIndex, endIndex);

    res.json({
      customers: paginatedCustomers,
      pagination: {
        totalItems: customers.length,
        totalPages: Math.ceil(customers.length / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error fetching customers.' });
  }
});

// GET /api/customers/export - Export CSV
router.get('/export', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const customers = await db.customers.find();
    
    // Create CSV content
    const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'Gender', 'DOB', 'Address', 'City', 'State', 'Country', 'Zip Code', 'Status', 'Created At'];
    const rows = customers.map(c => [
      c.customerId,
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      c.phone,
      c.gender,
      c.dob,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.city,
      c.state,
      c.country,
      c.zipcode,
      c.status,
      c.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers_export.csv');
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error exporting CSV.' });
  }
});

// GET /api/customers/:id
router.get('/:id', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const customer = await db.customers.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Include complaint history
    const complaints = await db.complaints.find();
    const customerComplaints = complaints.filter(c => c.customerId === id);

    res.json({
      customer,
      complaints: customerComplaints
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error fetching customer.' });
  }
});

// POST /api/customers - Create Customer
router.post('/', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, gender, dob, address, city, state, country, zipcode, status, notes, photo } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Please provide required fields (Name, Email, Phone).' });
    }

    const newCustomer = await db.customers.create({
      name,
      email,
      phone,
      gender: gender || 'male',
      dob: dob || '',
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || '',
      zipcode: zipcode || '',
      status: status || 'active',
      photo: photo || '',
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Customer added successfully',
      customer: newCustomer
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error adding customer.' });
  }
});

// POST /api/customers/import - Batch Import Customers (from CSV parsed array)
router.post('/import', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: 'Invalid payload. Expecting an array of customers.' });
    }

    const importedCustomers = [];
    for (const item of customers) {
      if (!item.name || !item.email) continue; // Skip incomplete
      
      const created = await db.customers.create({
        name: item.name,
        email: item.email,
        phone: item.phone || '',
        gender: item.gender || 'male',
        dob: item.dob || '',
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        country: item.country || '',
        zipcode: item.zipcode || '',
        status: item.status || 'active',
        notes: item.notes || ''
      });
      importedCustomers.push(created);
    }

    res.status(200).json({
      message: `Successfully imported ${importedCustomers.length} customers.`,
      importedCount: importedCustomers.length,
      customers: importedCustomers
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error importing customers.' });
  }
});

// PUT /api/customers/:id - Update Customer
router.put('/:id', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingCustomer = await db.customers.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const updated = await db.customers.update(id, updateData);
    res.json({
      message: 'Customer updated successfully',
      customer: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error updating customer.' });
  }
});

// DELETE /api/customers/:id - Delete Customer
router.delete('/:id', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existingCustomer = await db.customers.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    await db.customers.delete(id);
    res.json({
      message: 'Customer and associated complaints deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error deleting customer.' });
  }
});

export default router;
