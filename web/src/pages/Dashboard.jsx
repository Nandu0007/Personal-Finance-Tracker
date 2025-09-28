import { useEffect, useState } from 'react'
import api from '../api.js'
import ProgressBar from '../components/ProgressBar.jsx'
import { formatINR } from '../utils/format.js'

function currentMonth() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ byCategory: [], budgetUtilization: [] })
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/reports/summary', { params: { month: currentMonth() } })
      .then(res => setSummary(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load summary'))
  }, [])

  return (
    <div className="page page-center">
      <div className="page-inner fade-in">
        <h2>Dashboard</h2>
        {error && <div className="error">{error}</div>}
        <div className="grid">
          <div className="card">
            <h3>Spending by Category (This Month)</h3>
            <table className="table">
              <thead><tr><th>Category</th><th>Amount</th></tr></thead>
              <tbody>
              {summary.byCategory.map(row => (
                <tr key={row.category}><td>{row.category}</td><td>{formatINR(row.total)}</td></tr>
              ))}
              {summary.byCategory.length === 0 && <tr><td colSpan="2">No transactions</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>Budget Utilization</h3>
            {summary.budgetUtilization.map(b => (
              <div key={b.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{b.name}</strong>
                  <span className="badge">{b.category}</span>
                </div>
                <ProgressBar value={b.spent} max={Number(b.budget_amount)} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize: '0.9em', color:'var(--text-soft)' }}>
                  <span>Spent: {formatINR(b.spent)}</span>
                  <span>Budget: {formatINR(Number(b.budget_amount))}</span>
                </div>
              </div>
            ))}
            {summary.budgetUtilization.length === 0 && <div>No budgets</div>}
          </div>
        </div>
      </div>
    </div>
  )
}