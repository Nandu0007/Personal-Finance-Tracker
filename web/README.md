# Personal Finance Tracker (React + Vite)

Modern personal finance tracker with budgets, transactions, reports, and a polished, centered UI. Auth pages (Login/Register) include animations and microinteractions. All currency displays use INR consistently.

## Features
- Budgets: create, edit, delete with name/category suggestions
- Transactions: add, filter, sort; link to budgets
- Reports: monthly summary, spending by category, budget utilization
- Auth: animated, centered Login/Register, remember email, password toggle
- Theming: light/dark toggle persisted in `localStorage`
- Consistent INR formatting via `formatINR`

## Tech Stack
- Frontend: React, Vite, React Router
- Styling: CSS with utility classes and animations
- Backend: Express (see `/server`)

## Getting Started

1) Server
```
cd server
npm install
npm start
```

2) Web
```
cd web
npm install
npm run dev
```

Open the app at `http://localhost:5175/` (or the port shown in the terminal).

## Screenshots & GIF

This repo includes a script to capture screenshots (and optionally generate a GIF) of key pages.

### Capture screenshots
```
cd web
npm run capture
```
Output goes to `web/screenshots/`:
- `01-login.png`
- `02-register.png`
- `03-dashboard.png`
- `04-budgets.png`
- `05-transactions.png`
- `06-reports.png`

By default the script uses `http://localhost:5175`. You can override with:
```
BASE_URL=http://localhost:5174 npm run capture
```

### Generate a GIF (optional)
If `ffmpeg` is available on your system:
```
cd web
npm run capture:gif
```
This will create `web/screenshots/preview.gif` from the screenshots.

<!-- screenshots:start -->

<!-- screenshots:end -->

## Development Notes
- Protected routes: `Dashboard`, `Budgets`, `Transactions`, `Reports` require authentication
- Category and name suggestions: shared via `src/utils/format.js`
- INR formatting: use `formatINR(value)` for consistent currency display

## License
This project is for personal use and demonstration. Adjust licensing as needed for your repo.
