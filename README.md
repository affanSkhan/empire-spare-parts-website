# Empire Spare Parts - Complete Project

Empire Spare Parts is a Next.js + Supabase business platform for car A/C spare parts.
It includes a public product website, an admin dashboard for order-to-invoice workflow, WhatsApp-integrated quotation flow, and push notifications for real-time order alerts. 

**Status: All Phases Complete (Phase 1 to Phase 4)**

## 🚀 Complete Project Features

### 🌐 Public Website (Phase 1 & 2)
- **Home Page**: Business branding, features showcase, and responsive design.
- **Product Catalogue**: Live data fetching, client-side category filtering, real-time search, and responsive grid layout.
- **Product Details**: Image gallery with thumbnails, primary image auto-selection, related products, and WhatsApp enquiry button with pre-filled messages.
- **Contact Page**: Google Maps integration, click-to-call, business hours, and WhatsApp integration.

### 🛍️ Customer Experience
- **Ordering Flow**: Simplified order placement without online checkout (offline payment workflow).
- **Invoice/Quotation**: Professional invoice pages that can be shared via WhatsApp as links. No login required for customers to view their invoices.
- **Notifications**: On-screen toast notifications and UI feedback during the shopping and ordering experience.

### 🔐 Admin Dashboard (Phase 3)
- **Authentication & Security**: Supabase-based email/password login, role-based access control (admin/staff), and Row Level Security (RLS).
- **Inventory Management**: Full CRUD operations for products and categories.
- **Order Management (Simplified 2-Click Workflow)**:
  - **Click 1:** "Send Quotation on WhatsApp" (Auto-generates invoice & opens WhatsApp).
  - **Click 2:** "Payment Received" (Simple confirmation to mark order as paid).
- **Admin Notifications Center**: Read/unread status, push notification setup, and real-time alerts.
- **Data Backup**: Admin utility endpoint to backup data.

### 🔔 Push & Realtime Notifications (Phase 4)
- **Web Push**: Server-side delivery via `web-push`, browser subscriptions saved in Supabase.
- **Realtime Alerts**: Order events trigger in-app toasts and push notifications directly to the admin's device.
- **Testing Tools**: Built-in endpoints for browser push testing, health checks, and debugging.

### 📱 Mobile App Support (Capacitor)
- **Android Ready**: Capacitor configuration and Android project included for converting the web app into a native APK/AAB.
- **Native Plugins**: Push plugin and other necessary native dependencies installed.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend/Database**: Supabase (Auth, Database, Storage, Realtime)
- **Utilities**: `jsPDF` + `jspdf-autotable` (Invoice Generation), `web-push` (Push Notifications), Firebase Admin (Notification Infrastructure)
- **Mobile Wrapper**: Capacitor 8

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Supabase Project
- Windows PowerShell (for provided setup scripts)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Environment Variables
Copy the environment template:
```powershell
Copy-Item .env.example .env.local
```

Required values (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Database Setup
Run SQL files from `supabase/migrations` in order in your Supabase SQL Editor.
1. `001_initial_schema.sql`
2. `002_storage_setup.sql`
3. Apply all subsequent migrations for orders, notifications, stock, and push subscriptions.

Create at least one admin user in Supabase Auth, then map their role in the `user_roles` table.

### 4. Run Development Server
```powershell
npm run dev
```
Default URL: `http://localhost:3000`

## 🔔 Push Notifications Setup
1. **Generate VAPID Keys**: `npx web-push generate-vapid-keys`
2. **Add Keys**: Add generated keys to `.env.local`.
3. **Database**: Ensure `011_create_push_subscriptions.sql` is applied.
4. **Subscribe**: Start app -> Sign in as Admin -> Open Notification Setup -> Enable browser notification permission.

## 📱 Mobile Build (Android / Capacitor)
Build web app for Capacitor:
```powershell
npm run build:capacitor
```
Sync Android project:
```powershell
npx cap sync android
```
Open the `android` folder in Android Studio to create the APK/AAB.

## 📁 Project Structure

```text
Empire_spare_parts/
  ├── components/           # Shared UI components
  ├── hooks/                # Auth and workflow hooks
  ├── lib/                  # Supabase and Firebase helpers
  ├── pages/
  │   ├── admin/            # Admin dashboard pages
  │   ├── api/              # API routes (push, backup, verify)
  │   ├── customer/         # Customer-facing app pages
  │   ├── products/         # Catalogue and details
  │   └── invoice/          # Public invoice routes
  ├── public/               # Static assets & service worker
  ├── scripts/              # Utility scripts
  ├── styles/               # Global Tailwind styling
  ├── supabase/migrations/  # SQL schema migrations
  └── docs/                 # Specialized guides
```

## 📖 Additional Documentation

- `GET_STARTED.md` - Initial setup guide
- `FINAL_SIMPLIFIED_WORKFLOW.md` - Details on the 2-click admin order process
- `PUSH_NOTIFICATIONS_QUICKSTART.md` - Notifications setup
- `MOBILE_PUSH_NOTIFICATIONS_SETUP.md` - Capacitor specific push instructions
- `DEPLOYMENT.md` - Production deployment guidelines

## ⚖️ License
Private project. All rights reserved.
