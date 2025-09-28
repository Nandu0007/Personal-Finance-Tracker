import { useEffect, useState } from 'react'
import api from '../api.js'
import { formatINR } from '../utils/format.js'

export default function Reports() {
  const [month, setMonth] = useState(() => {
    const d = new Date()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}-${m}`
  })
  const [summary, setSummary] = useState({ byCategory: [], budgetUtilization: [] })
  const [error, setError] = useState('')

  function load() {
    api.get('/reports/summary', { params: { month } })
      .then(res => setSummary(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load report'))
  }

  useEffect(() => { load() }, [month])

  return (
    <div className="page page-center">
      <div className="page-inner">
        <h2>Reports</h2>
        <label>Month
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <section>
          <h3>Spending by Category</h3>
          <ul>
            {summary.byCategory.map(row => (
              <li key={row.category}>{row.category}: {formatINR(row.total)}</li>
            ))}
            {summary.byCategory.length === 0 && <li>No data</li>}
          </ul>
        </section>
        <section>
          <h3>Budget Utilization</h3>
          <ul>
            {summary.budgetUtilization.map(b => (
              <li key={b.id}>{b.name} ({b.category}): {formatINR(b.spent)} / {formatINR(Number(b.budget_amount))}</li>
            ))}
            {summary.budgetUtilization.length === 0 && <li>No budgets</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}