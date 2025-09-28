import { useEffect, useState } from 'react'
import api from '../api.js'
import { CATEGORY_OPTIONS, NAME_OPTIONS, formatINR } from '../utils/format.js'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [form, setForm] = useState({ name: '', category: '', amount: '' })
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: '', amount: '' })

  function load() {
    api.get('/budgets').then(res => setBudgets(res.data)).catch(err => setError(err.response?.data?.error || 'Failed to load budgets'))
  }

  useEffect(() => { load() }, [])

  async function onCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/budgets', { ...form, amount: Number(form.amount) })
      setForm({ name: '', category: '', amount: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create')
    }
  }

  function startEdit(b) {
    setEditingId(b.id)
    setEditForm({ name: b.name, category: b.category, amount: String(b.amount) })
  }

  async function saveEdit(id) {
    try {
      await api.put(`/budgets/${id}`, { ...editForm, amount: Number(editForm.amount) })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update')
    }
  }

  async function onDelete(id) {
    try {
      await api.delete(`/budgets/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div className="page page-center">
      <div className="page-inner fade-in">
        <h2>Budgets</h2>
        {error && <div className="error">{error}</div>}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <form onSubmit={onCreate} className="form">
          <label>Name
            <input list="name-options" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
            <datalist id="name-options">
              {NAME_OPTIONS.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </label>
          <label>Category
            <input list="category-options" value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} required />
            <datalist id="category-options">
              {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </label>
          <label>Amount (INR)<input type="number" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required /></label>
          <button type="submit" className="accent">Add Budget</button>
          </form>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {budgets.map(b => (
                <tr key={b.id}>
                  <td>{editingId === b.id ? <input list="name-options" value={editForm.name} onChange={e=>setEditForm(f=>({...f, name:e.target.value}))} /> : b.name}</td>
                  <td>{editingId === b.id ? <input value={editForm.category} onChange={e=>setEditForm(f=>({...f, category:e.target.value}))} /> : b.category}</td>
                  <td>{editingId === b.id ? <input type="number" step="0.01" value={editForm.amount} onChange={e=>setEditForm(f=>({...f, amount:e.target.value}))} /> : formatINR(b.amount)}</td>
                  <td>
                    {editingId === b.id ? (
                      <>
                        <button onClick={() => saveEdit(b.id)} className="accent">Save</button>
                        <button onClick={() => setEditingId(null)} style={{ marginLeft: 8 }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(b)}>Edit</button>
                        <button style={{ marginLeft: 8 }} onClick={() => onDelete(b.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && <tr><td colSpan="4">No budgets yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}