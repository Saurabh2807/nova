# Nova Forge — LNCT Campus Carnival & BGMI Tournament System

A full-stack, enterprise-grade esports event platform and entry management system built with **Next.js 15 (App Router)**, **React 19**, **Supabase (PostgreSQL + Auth + RPCs)**, **Tailwind CSS v4**, and **Framer Motion**.

---

## 🌟 Key Features

### 1. 🎮 Public Experience & Registration
- **High-Performance Marketing Site**: Modern, dynamic design with rich aesthetics, glassmorphism, responsive navigation, and smooth micro-animations.
- **Atomic BGMI Team Registration (`/register/participant`)**:
  - Strictly 2 players per squad (Player 1 Leader + Player 2 Member).
  - PostgreSQL transaction (`register_team_atomic`) guaranteeing atomic insert of Team + Both Players.
  - Server-side uniqueness enforcement for Emails, 10-digit Phone numbers, College IDs, and Team Name.
  - Dual transactional emails dispatched via SMTP with individual personalized entry passes containing the same secure team QR.
- **Audience Pass Registration (`/register/audience`)**:
  - Instant digital movie-ticket style pass (`NF-AUD-SA-XXXX`).
  - PostgreSQL transactional validation (`register_audience_atomic`).
  - Automated confirmation email with embedded secure QR pass.
- **Dynamic Event Status & Capacity Limits**:
  - Real-time display of Event Date, Venue, Reporting Time, and remaining slot counters.
  - Separate limits for BGMI Squads (`participant_limit`) and Audience passes (`audience_limit`).

---

### 2. 🛡️ Hidden Gate & Admin Operations Portal (`/admin`)
Accessible only via direct URL (hidden from all public navigation, headers, and footers) with robust server-side RBAC:

- **Supabase Authentication + Database RBAC**:
  - Secured via Supabase Auth (Email + Password) and `admin_profiles` table.
  - **Zero trust** for frontend-supplied roles; all permissions validated via server-side Bearer JWT inspection.
  - **Volunteer Role**: Dashboard view, live QR scanning, manual search lookup, check-in.
  - **Admin Role**: Full system access including undo check-in, real-time event settings configuration, and sanitized CSV exports.
- **Live QR Scanner & Gate Verification**:
  - Integrated camera barcode scanner (`html5-qrcode`) and manual token input.
  - Cryptographically secure `qr_token` verification (never exposes internal IDs as raw tokens).
  - Statuses: `APPROVED`, `ALREADY CHECKED IN` (prevents double-entry), `REGISTRATION CANCELLED`, and `INVALID QR`.
- **Manual Search & Check-in**:
  - Instant search across Team ID, Pass ID, Player Names, Emails, Phone Numbers, and College Roll Numbers.
- **Audit Trail (`check_in_logs`)**:
  - Immutable log recording action (`check_in` / `undo_check_in`), method (`qr_scan` / `manual_search`), scanner name/role, and timestamp.
- **Data Export**:
  - Admin-only CSV generation for physical pen-and-paper gate check-in sheets.
  - Secure: `qr_token` is strictly excluded from all exports.
- **Real-Time Event Controller**:
  - Toggle Registration `OPEN` / `CLOSED`.
  - Adjust BGMI Team limits and Audience capacity limits dynamically.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Stored Procedures / RPCs, Auth)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/) with Google Custom SMTP
- **QR Generation & Scanning**: `qrcode`, `html5-qrcode`
- **Icons & Typography**: `lucide-react`, `@fontsource/space-grotesk`, `@fontsource/inter`, `@fontsource/jetbrains-mono`

---

## 📁 Project Architecture

```
novaforge/
├── app/
│   ├── admin/                 # Hidden Admin & Volunteer Portal (/admin)
│   ├── api/
│   │   ├── admin/             # Secured Admin APIs (checkin, stats, export, verify, search, teams, audience, logs)
│   │   ├── event/settings/    # Dynamic public event settings endpoint
│   │   └── register/          # Atomic registration handlers (participant & audience)
│   ├── register/
│   │   ├── audience/          # Audience pass registration form
│   │   └── participant/       # BGMI Team 2-player registration form
│   ├── layout.tsx             # Root layout with fonts & metadata
│   ├── page.tsx               # Public single-page landing site
│   └── globals.css            # Tailwind & theme variables
├── components/
│   ├── admin/                 # Admin dashboard panels (Scanner, Tables, Logs, Settings)
│   ├── registration/          # Registration shells, ticket cards, forms
│   ├── Hero.tsx               # Hero banner with countdown & CTA
│   ├── About.tsx              # About Nova Forge & LNCT Carnival
│   ├── Events.tsx             # Tournament cards & schedule
│   ├── Sponsors.tsx           # Partner showcase
│   ├── Creators.tsx           # Featured creators & streamers
│   ├── Team.tsx               # Leadership & crew
│   └── Footer.tsx             # Public footer
├── lib/
│   ├── email/                 # Email templates (HTML passes) & Nodemailer transport
│   ├── supabase/              # Supabase clients (client, server, service), SQL schema & RBAC middleware
│   ├── data.ts                # Default event content & sponsor metadata
│   └── types/                 # TypeScript interfaces & types
└── public/                    # Static brand assets & partner logos
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm** or **pnpm** / **yarn**
- A **Supabase** project
- An **SMTP Provider** (e.g., Gmail App Password or Resend/SendGrid)

### 2. Clone & Install

```bash
git clone https://github.com/Saurabh2807/nova.git
cd nova
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Nova Forge <your-email@gmail.com>"
```

### 4. Database Setup

Execute the SQL script located in [`lib/supabase/schema.sql`](lib/supabase/schema.sql) in your Supabase SQL Editor. This will automatically create:
- `event_settings` table & default records
- `admin_profiles` table with RBAC checks
- `teams` & `participants` tables with foreign keys and unique constraints
- `audience_registrations` table
- `check_in_logs` audit trail
- `register_team_atomic` & `register_audience_atomic` PostgreSQL functions
- Row Level Security (RLS) policies

To create an Admin or Volunteer user:
1. Create a user in Supabase Auth (**Authentication → Users**).
2. Insert a corresponding record into `admin_profiles`:
   ```sql
   INSERT INTO admin_profiles (id, email, full_name, role)
   VALUES ('<supabase-user-uuid>', 'admin@novaforge.gg', 'Lead Admin', 'admin');
   ```
   *(Use `role = 'volunteer'` for scanner-only gate volunteers)*.

### 5. Run Locally

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public website, or navigate directly to [http://localhost:3000/admin](http://localhost:3000/admin) to log in to the management dashboard.

---

## 🧪 Testing & Verification

Run the TypeScript validator:
```bash
npx tsc --noEmit
```

Build for production:
```bash
npm run build
```

Run the automated Admin security & verification test suite:
```bash
node scratch/test-admin-system.mjs
```

---

## 🔒 Security Architecture

1. **Server-Side Authorization**: Roles are never trusted from HTTP payloads; they are resolved server-side from `admin_profiles` via authenticated Supabase JWT sessions.
2. **QR Token Secrecy**: The human-facing IDs (`NF-BGMI-2026-XXXXX` and `NF-AUD-SA-XXXX`) are distinct from internal, cryptographically random `qr_token` hashes.
3. **Audit Compliance**: All check-in and undo operations log user identity, method, and timestamps.
4. **Data Protection**: `qr_token` values are permanently omitted from CSV export endpoints and client-side tables.

---

## 📄 License

Developed for **Nova Forge Esports & LNCT Campus Carnival 2026**. All rights reserved.
