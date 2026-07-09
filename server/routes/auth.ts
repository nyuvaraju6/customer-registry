import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-registry-secret-key-2026';

// Helper to seed default admin
export async function seedDefaultAdmin() {
  try {
    const users = await db.users.find();
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.users.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✨ Seeded default admin account: admin@example.com / password123');
    }
  } catch (err) {
    console.error('Failed to seed default admin:', err);
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields (name, email, password).' });
    }

    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.users.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'staff'
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error fetching profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, email, password, phone } = req.body;

    const user = await db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if email already taken by someone else
    if (email && email !== user.email) {
      const existing = await db.users.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already taken by another account.' });
      }
    }

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone; // User profile might have phone

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.users.update(userId, updateFields);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error updating profile.' });
  }
});

export default router;
