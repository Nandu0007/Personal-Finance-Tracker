import { useEffect, useMemo, useState } from 'react'
import api from '../api.js'
import { CATEGORY_OPTIONS, formatINR } from '../utils/format.js'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [form, setForm] = useState({ budget_id: '', category: '', description: '', amount: '', date: '' })
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ category: '', from: '', to: '', sort: 'date_desc' })

  function load() {
    api.get('/transactions').then(res => setTransactions(res.data)).catch(err => setError(err.response?.data?.error || 'Failed to load transactions'))
    api.get('/budgets').then(res => setBudgets(res.data)).catch(()=>{})
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (filters.category) list = list.filter(t => t.category.toLowerCase().includes(filters.category.toLowerCase()))
    if (filters.from) list = list.filter(t => t.date >= filters.from)
    if (filters.to) list = list.filter(t => t.date <= filters.to)
    switch (filters.sort) {
      case 'date_asc': list.sort((a,b)=> a.date.localeCompare(b.date)); break
      case 'amount_desc': list.sort((a,b)=> Number(b.amount) - Number(a.amount)); break
      case 'amount_asc': list.sort((a,b)=> Number(a.amount) - Number(b.amount)); break
      default: list.sort((a,b)=> b.date.localeCompare(a.date));
    }
    return list
  }, [transactions, filters])

  async function onCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, amount: Number(form.amount) }
      if (payload.budget_id === '') delete payload.budget_id
      await api.post('/transactions', payload)
      setForm({ budget_id: '', category: '', description: '', amount: '', date: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add')
    }
  }

  async function onDelete(id) {
    try {
      await api.delete(`/transactions/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div className="page page-center">
      <div className="page-inner fade-in">
        <h2>Transactions</h2>
        {error && <div className="error">{error}</div>}

      <div className="grid" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3>Add Transaction</h3>
          <form onSubmit={onCreate} className="form">
            <label>Budget
              <select value={form.budget_id} onChange={e=>setForm(f=>({...f, budget_id: e.target.value}))}>
                <option value="">None</option>
                {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            <label>Category
              <input list="category-options" value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} required />
              <datalist id="category-options">
                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt} />)}
              </datalist>
            </label>
            <label>Description<input value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} /></label>
            <label>Amount (INR)<input type="number" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required /></label>
            <label>Date<input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required /></label>
            <button type="submit" className="accent">Add Transaction</button>
          </form>
        </div>
        <div className="card">
          <h3>Filters</h3>
          <div className="form">
            <label>Category contains<input value={filters.category} onChange={e=>setFilters(f=>({...f, category:e.target.value}))} placeholder="e.g. groceries" /></label>
            <label>From<input type="date" value={filters.from} onChange={e=>setFilters(f=>({...f, from: e.target.value}))} /></label>
            <label>To<input type="date" value={filters.to} onChange={e=>setFilters(f=>({...f, to: e.target.value}))} /></label>
            <label>Sort
              <select value={filters.sort} onChange={e=>setFilters(f=>({...f, sort:e.target.value}))}>
                <option value="date_desc">Date desc</option>
                <option value="date_asc">Date asc</option>
                <option value="amount_desc">Amount desc</option>
                <option value="amount_asc">Amount asc</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="fade-in">
                <td>{t.date}</td>
                <td>{t.category}</td>
                <td>{t.description || '-'}</td>
                <td>{formatINR(t.amount)}</td>
                <td><button onClick={() => onDelete(t.id)}>Delete</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5">No transactions</td></tr>}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}