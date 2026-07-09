import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/complaints (supports search, filter, pagination)
router.get('/', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { search, status, priority, category, page = '1', limit = '10' } = req.query;

    let complaints = await db.complaints.find();

    // 1. Filter by status
    if (status && status !== 'all') {
      complaints = complaints.filter(c => c.status === status);
    }

    // 2. Filter by priority
    if (priority && priority !== 'all') {
      complaints = complaints.filter(c => c.priority === priority);
    }

    // 3. Filter by category
    if (category && category !== 'all') {
      complaints = complaints.filter(c => c.category === category);
    }

    // 4. Search filter
    if (search) {
      const s = (search as string).toLowerCase();
      complaints = complaints.filter(c => 
        c.complaintId.toLowerCase().includes(s) ||
        c.customerName.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        (c.assignedTo && c.assignedTo.toLowerCase().includes(s))
      );
    }

    // 5. Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    const paginatedComplaints = complaints.slice(startIndex, endIndex);

    res.json({
      complaints: paginatedComplaints,
      pagination: {
        totalItems: complaints.length,
        totalPages: Math.ceil(complaints.length / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error fetching complaints.' });
  }
});

// GET /api/complaints/:id
router.get('/:id', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const complaint = await db.complaints.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Fetch full customer details for reference
    const customer = await db.customers.findById(complaint.customerId);

    res.json({
      complaint,
      customer
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error fetching complaint.' });
  }
});

// POST /api/complaints - Add complaint
router.post('/', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { customerId, category, priority, description, assignedTo } = req.body;

    if (!customerId || !category || !description) {
      return res.status(400).json({ error: 'Please provide customerId, category, and description.' });
    }

    // Verify customer exists
    const customer = await db.customers.findById(customerId);
    if (!customer) {
      return res.status(400).json({ error: 'Invalid customer. Customer not found.' });
    }

    const newComplaint = await db.complaints.create({
      customerId,
      customerName: customer.name,
      category,
      priority: priority || 'medium',
      status: 'pending',
      description,
      assignedTo: assignedTo || '',
      resolution: ''
    });

    res.status(201).json({
      message: 'Complaint registered successfully',
      complaint: newComplaint
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error creating complaint.' });
  }
});

// PUT /api/complaints/:id - Update complaint (including resolving)
router.put('/:id', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { category, priority, status, description, assignedTo, resolution } = req.body;

    const existingComplaint = await db.complaints.findById(id);
    if (!existingComplaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const updateFields: any = {};
    if (category) updateFields.category = category;
    if (priority) updateFields.priority = priority;
    if (status) updateFields.status = status;
    if (description) updateFields.description = description;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (resolution !== undefined) updateFields.resolution = resolution;

    const updated = await db.complaints.update(id, updateFields);

    res.json({
      message: 'Complaint updated successfully',
      complaint: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error updating complaint.' });
  }
});

// DELETE /api/complaints/:id - Delete complaint
router.delete('/:id', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existingComplaint = await db.complaints.findById(id);
    if (!existingComplaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    await db.complaints.delete(id);
    res.json({
      message: 'Complaint deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error deleting complaint.' });
  }
});

export default router;
