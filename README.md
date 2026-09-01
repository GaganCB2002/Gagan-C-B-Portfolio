# Gagan C B — Portfolio

Full-stack MERN portfolio with user tracking, analytics, admin dashboard, and 2FA authentication.

## Project Structure

```
├── frontend/          # React + Vite frontend
│   ├── src/           # Source code (components, pages, services, context)
│   ├── public/        # Static assets
│   ├── index.html     # Entry HTML
│   ├── package.json   # Frontend dependencies
│   └── vite.config.js # Vite configuration
│
├── backend/           # Node.js + Express backend
│   └── server/        # Server code
│       ├── models/    # Mongoose models (User, Session, ActivityEvent, DailyAnalytics)
│       ├── routes/    # API routes (auth, users, analytics, admin)
│       ├── middleware/ # Auth middleware (JWT, RBAC)
│       ├── services/  # Email service (Resend)
│       ├── index.js   # Server entry point
│       ├── package.json
│       └── .env       # Environment variables
│
├── database/          # Database config and seed scripts
│   ├── config.js      # MongoDB connection
│   └── seed.js        # Seed admin user
│
└── package.json       # Root scripts
```

## Features

- **User Authentication**: Register, login, logout with JWT
- **2-Factor Authentication**: OTP verification via email (Resend API)
- **User Tracking**: Activity events, page views, sessions
- **Admin Dashboard**: Daily analytics, user management, activity logs with Recharts
- **Dark/Light Mode**: Theme persistence with CSS variables
- **Responsive Design**: Mobile-first with CSS animations
- **Portfolio Sections**: Hero, About, Projects, Skills, Experience, Certifications, Testimonials, Contact

## Setup

### 1. Start MongoDB

```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

### 2. Seed Admin User

```bash
cd database
node seed.js
```

Admin credentials:
- Email: `gagancb2002@gmail.com`
- Password: `Gagan@2002@2026`

### 3. Start Backend

```bash
cd backend/server
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/verify-otp` — Verify email OTP
- `POST /api/auth/resend-otp` — Resend OTP
- `GET /api/auth/me` — Get current user

### Users
- `GET /api/users/me` — Get profile
- `PUT /api/users/me` — Update profile
- `GET /api/users/me/activity` — Get activity history
- `GET /api/users/me/sessions` — Get active sessions

### Analytics
- `POST /api/analytics/events` — Track event
- `GET /api/analytics/me` — Get my analytics

### Admin
- `GET /api/admin/analytics/summary` — Dashboard summary
- `GET /api/admin/analytics/daily` — Daily analytics
- `GET /api/admin/analytics/activity` — Activity log
- `GET /api/admin/users` — List users
- `GET /api/admin/users/:id` — User detail
- `GET /api/admin/users/:id/activity` — User activity
- `PUT /api/admin/users/:id/status` — Toggle user status
- `PUT /api/admin/users/:id/role` — Change user role

## Environment Variables

See `backend/server/.env.example` for all required variables.

Key variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `RESEND_API_KEY` — Resend email API key
- `EMAIL_FROM` — Sender email address
