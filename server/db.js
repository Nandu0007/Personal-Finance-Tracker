import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const defaultData = {
  users: [],
  budgets: [],
  transactions: [],
  seq: { users: 1, budgets: 1, transactions: 1 }
};

class JsonDB {
  constructor() {
    this.data = { ...defaultData };
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
      this.data = { ...defaultData };
    } else {
      this.data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      // ensure schema
      this.data.users ||= [];
      this.data.budgets ||= [];
      this.data.transactions ||= [];
      this.data.seq ||= { users: 1, budgets: 1, transactions: 1 };
    }
  }

  save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  nextId(collection) {
    const id = this.data.seq[collection] || 1;
    this.data.seq[collection] = id + 1;
    return id;
  }

  // Users
  findUserByEmail(email) {
    return this.data.users.find(u => u.email === email) || null;
  }
  findUserById(id) {
    return this.data.users.find(u => u.id === id) || null;
  }
  createUser({ email, name, password_hash }) {
    const user = {
      id: this.nextId('users'),
      email,
      name: name || null,
      password_hash,
      created_at: new Date().toISOString()
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Budgets
  getBudgets(userId) {
    return this.data.budgets.filter(b => b.user_id === userId).sort((a,b)=> (b.created_at || '').localeCompare(a.created_at || ''));
  }
  createBudget(userId, { name, category, amount, period, start_date, end_date }) {
    const budget = {
      id: this.nextId('budgets'),
      user_id: userId,
      name,
      category,
      amount: Number(amount),
      period: period || 'monthly',
      start_date: start_date || null,
      end_date: end_date || null,
      created_at: new Date().toISOString()
    };
    this.data.budgets.push(budget);
    this.save();
    return budget;
  }
  getBudget(userId, id) {
    return this.data.budgets.find(b => b.id === id && b.user_id === userId) || null;
  }
  updateBudget(userId, id, patch) {
    const idx = this.data.budgets.findIndex(b => b.id === id && b.user_id === userId);
    if (idx === -1) return null;
    const current = this.data.budgets[idx];
    const updated = { ...current, ...patch };
    this.data.budgets[idx] = updated;
    this.save();
    return updated;
  }
  deleteBudget(userId, id) {
    const before = this.data.budgets.length;
    this.data.budgets = this.data.budgets.filter(b => !(b.id === id && b.user_id === userId));
    const changed = before !== this.data.budgets.length;
    if (changed) this.save();
    return changed;
  }

  // Transactions
  getTransactions(userId) {
    return this.data.transactions.filter(t => t.user_id === userId).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  }
  createTransaction(userId, { budget_id, category, description, amount, date }) {
    const trx = {
      id: this.nextId('transactions'),
      user_id: userId,
      budget_id: budget_id || null,
      category,
      description: description || null,
      amount: Number(amount),
      date,
      created_at: new Date().toISOString()
    };
    this.data.transactions.push(trx);
    this.save();
    return trx;
  }
  getTransaction(userId, id) {
    return this.data.transactions.find(t => t.id === id && t.user_id === userId) || null;
  }
  updateTransaction(userId, id, patch) {
    const idx = this.data.transactions.findIndex(t => t.id === id && t.user_id === userId);
    if (idx === -1) return null;
    const current = this.data.transactions[idx];
    const updated = { ...current, ...patch };
    this.data.transactions[idx] = updated;
    this.save();
    return updated;
  }
  deleteTransaction(userId, id) {
    const before = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter(t => !(t.id === id && t.user_id === userId));
    const changed = before !== this.data.transactions.length;
    if (changed) this.save();
    return changed;
  }
}

const jsondb = new JsonDB();
jsondb.init();

export default jsondb;