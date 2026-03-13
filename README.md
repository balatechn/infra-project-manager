# InfraManager — IT Infrastructure Project Management

A production-ready, full-stack TypeScript project management platform for IT infrastructure teams. Built with **Next.js 14**, **Prisma ORM**, **Neon PostgreSQL**, and deployed on **Vercel**.

Manage projects like networking, CCTV, Wi-Fi, server deployment, access control, data centers, IT asset rollouts, and vendor coordination — all from a single dashboard.

---

## Architecture

```
User Browser
     │
Vercel Edge Network
     │
Next.js App (Frontend + API Routes)
     │
Prisma ORM
     │
Neon Serverless PostgreSQL
```

## Tech Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Frontend       | Next.js 14 (App Router, TSX)   |
| Backend API    | Next.js API Routes             |
| Database       | Neon PostgreSQL (Serverless)    |
| ORM            | Prisma                         |
| Authentication | JWT (httpOnly cookies)         |
| Styling        | Tailwind CSS                   |
| Deployment     | Vercel                         |
| CI/CD          | GitHub Actions                 |

## Features

- **Dashboard** — overview cards, budget, category breakdown, activity feed
- **Projects** — CRUD with filters by status/category, search, progress tracking
- **Kanban Board** — drag-and-drop task management across 5 columns
- **Gantt Chart** — visual timeline view of project tasks
- **Reports** — auto-generated weekly/monthly/project/budget reports
- **Vendors** — manage vendor contacts, SLA scores, project assignments
- **RBAC** — Admin / Manager / Member / Viewer roles with middleware enforcement
- **PWA** — installable on mobile with offline-ready manifest

## Project Structure

```
infra-project-manager/
├── app/
│   ├── (authenticated)/     # Layout with sidebar
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── kanban/
│   │   ├── gantt/
│   │   ├── reports/
│   │   └── vendors/
│   ├── api/                 # REST API routes
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── vendors/
│   │   └── reports/
│   ├── login/
│   └── register/
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── sidebar.tsx
│   └── auth-provider.tsx
├── lib/
│   ├── prisma.ts            # Prisma singleton
│   ├── auth.ts              # JWT auth utilities
│   └── utils.ts             # Helpers
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── types/
│   └── project-types.ts     # TypeScript interfaces
├── middleware.ts             # Auth & RBAC middleware
├── vercel.json
└── .github/workflows/ci.yml
```

## Getting Started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/infra-project-manager.git
cd infra-project-manager
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your Neon connection string:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:pass@ep-xxxx.aws.neon.tech/infra_pm?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxxx.aws.neon.tech/infra_pm?sslmode=require"
JWT_SECRET="your-secure-random-string-at-least-32-characters"
NEXTAUTH_SECRET="another-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push          # Push schema to Neon
npm run db:seed              # Seed sample data
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Accounts (after seeding)

| Role     | Email                         | Password   |
| -------- | ----------------------------- | ---------- |
| Admin    | admin@inframanager.com        | admin123   |
| Manager  | manager@inframanager.com      | manager123 |
| Engineer | engineer@inframanager.com     | member123  |

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Set framework to **Next.js**
4. Add environment variables:
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
5. Click **Deploy**

Vercel auto-deploys on every push to `main`.

### Branch Strategy

| Branch       | Environment |
| ------------ | ----------- |
| `main`       | Production  |
| `develop`    | Staging     |
| `feature/*`  | Preview     |

## API Endpoints

| Method | Endpoint              | Description          | Auth Required |
| ------ | --------------------- | -------------------- | ------------- |
| POST   | /api/auth/register    | Create account       | No            |
| POST   | /api/auth/login       | Sign in              | No            |
| POST   | /api/auth/logout      | Sign out             | Yes           |
| GET    | /api/auth/me          | Current user         | Yes           |
| GET    | /api/dashboard        | Dashboard stats      | Yes           |
| GET    | /api/projects         | List projects        | Yes           |
| POST   | /api/projects         | Create project       | Manager+      |
| GET    | /api/projects/:id     | Project details      | Yes           |
| PUT    | /api/projects/:id     | Update project       | Manager+      |
| DELETE | /api/projects/:id     | Delete project       | Admin         |
| GET    | /api/tasks            | List tasks           | Yes           |
| POST   | /api/tasks            | Create task          | Member+       |
| PUT    | /api/tasks/:id        | Update task          | Member+       |
| DELETE | /api/tasks/:id        | Delete task          | Manager+      |
| GET    | /api/vendors          | List vendors         | Yes           |
| POST   | /api/vendors          | Create vendor        | Manager+      |
| GET    | /api/reports          | List reports         | Yes           |
| POST   | /api/reports          | Generate report      | Manager+      |

## Database Schema

Models: **User**, **Project**, **Task**, **Milestone**, **Vendor**, **ProjectVendor**, **Document**, **Report**, **Comment**, **ActivityLog**

Run `npx prisma studio` to browse the database visually.

## Security

- JWT tokens in httpOnly, secure, sameSite cookies
- Role-based access control (RBAC) in middleware and API routes
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Password hashing with bcrypt (12 rounds)
- Environment variable protection (`.env` excluded from Git)

## License

MIT
