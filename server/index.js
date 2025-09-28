import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
// removed dotenv to avoid module resolution issues
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';


const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Allow all localhost origins during local development (5173/5174, etc.)
app.use(cors({
  origin: (origin, callback) => {
    // In dev, accept any origin to avoid port mismatch issues
    if (!origin || origin.startsWith('http://localhost')) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// JSON DB initialized in db.js

function signToken(userId) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const existing = db.findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const password_hash = bcrypt.hashSync(password, 10);
  const user = db.createUser({ email, name, password_hash });
  const token = signToken(user.id);
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user.id);
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Budgets CRUD
app.get('/budgets', authMiddleware, (req, res) => {
  const rows = db.getBudgets(req.userId);
  res.json(rows);
});

app.post('/budgets', authMiddleware, (req, res) => {
  const { name, category, amount, period, start_date, end_date } = req.body;
  if (!name || !category || amount == null) return res.status(400).json({ error: 'Missing required fields' });
  const budget = db.createBudget(req.userId, { name, category, amount, period, start_date, end_date });
  res.status(201).json(budget);
});

app.put('/budgets/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.getBudget(req.userId, id);
  if (!existing) return res.status(404).json({ error: 'Budget not found' });
  const { name, category, amount, period, start_date, end_date } = req.body;
  const updated = db.updateBudget(req.userId, id, { name, category, amount, period, start_date, end_date });
  res.json(updated);
});

app.delete('/budgets/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const ok = db.deleteBudget(req.userId, id);
  if (!ok) return res.status(404).json({ error: 'Budget not found' });
  res.json({ success: true });
});

// Transactions CRUD
app.get('/transactions', authMiddleware, (req, res) => {
  const rows = db.getTransactions(req.userId);
  res.json(rows);
});

app.post('/transactions', authMiddleware, (req, res) => {
  const { budget_id, category, description, amount, date } = req.body;
  if (!category || amount == null || !date) return res.status(400).json({ error: 'Missing required fields' });
  const trx = db.createTransaction(req.userId, { budget_id, category, description, amount, date });
  res.status(201).json(trx);
});

app.put('/transactions/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.getTransaction(req.userId, id);
  if (!existing) return res.status(404).json({ error: 'Transaction not found' });
  const { budget_id, category, description, amount, date } = req.body;
  const updated = db.updateTransaction(req.userId, id, { budget_id, category, description, amount, date });
  res.json(updated);
});

app.delete('/transactions/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const ok = db.deleteTransaction(req.userId, id);
  if (!ok) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

// Reports
app.get('/reports/summary', authMiddleware, (req, res) => {
  // month expected format: YYYY-MM
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'Provide month as YYYY-MM' });
  const start = `${month}-01`;
  const end = `${month}-31`;

  const tx = db.getTransactions(req.userId).filter(t => t.date >= start && t.date <= end);
  const byCategoryMap = new Map();
  tx.forEach(t => {
    byCategoryMap.set(t.category, (byCategoryMap.get(t.category) || 0) + Number(t.amount));
  });
  const byCategory = Array.from(byCategoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a,b)=> b.total - a.total);

  const budgets = db.getBudgets(req.userId);
  const budgetUtilization = budgets.map(b => {
    const spent = tx.filter(t => t.category === b.category).reduce((sum, t) => sum + Number(t.amount), 0);
    return { id: b.id, name: b.name, category: b.category, budget_amount: b.amount, spent };
  });

  res.json({ byCategory, budgetUtilization });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', name: 'Personal Finance Tracker API' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});