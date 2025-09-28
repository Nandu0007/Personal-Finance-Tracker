export const formatINR = (value) => {
  const num = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num)
}

export const CATEGORY_OPTIONS = [
  'Groceries', 'Rent', 'Utilities', 'Transportation', 'Dining', 'Entertainment', 'Healthcare',
  'Education', 'Savings', 'Investments', 'Insurance', 'Travel', 'Shopping', 'Subscriptions', 'Miscellaneous'
]

export const NAME_OPTIONS = [
  'Monthly Groceries',
  'House Rent',
  'Electricity Bill',
  'Water Bill',
  'Internet',
  'Mobile Recharge',
  'Fuel',
  'Commute',
  'Dining Out',
  'Entertainment',
  'Healthcare',
  'Medicines',
  'Education Fees',
  'Childcare',
  'Savings',
  'Emergency Fund',
  'Investments SIP',
  'Insurance Premium',
  'Travel',
  'Shopping',
  'Subscriptions',
  'Gym Membership',
  'Gifts',
  'Miscellaneous'
]