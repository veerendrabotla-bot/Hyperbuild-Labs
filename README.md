# 🚀 HyperBuild Labs - Enterprise Agency Platform

An enterprise-grade Digital Agency Platform built with **React**, **TypeScript**, **Supabase**, and **TailwindCSS**. This application serves as a comprehensive "Agency Operating System," combining a high-conversion public website with a powerful internal Admin Dashboard for CRM, CMS, and Business Operations.

![HyperBuild Banner](https://via.placeholder.com/1200x600?text=HyperBuild+Labs+Preview)

## ✨ Key Features

### 🌐 Public Platform
- **Modern UI/UX**: Built with TailwindCSS, Framer Motion, and ScrollReveal for a premium feel.
- **AI Sales Agent**: Integrated **Google Gemini API** for a real-time, context-aware chatbot demo.
- **Booking System**: Custom calendar widget with conflict detection (Supabase-backed).
- **Service & Portfolio CMS**: Dynamic content fetched from the database.
- **Lead Generation**: High-conversion forms integrated with **EmailJS** and CRM.
- **SEO Optimized**: Dynamic meta tags and Open Graph support for social sharing.

### 🛡️ Admin Dashboard (The Operating System)
- **Secure Auth**: Email/Password login with **2FA (Two-Factor Authentication)**.
- **CRM (Leads)**: Track leads, status (New/Contacted/Closed), and internal notes. Export to CSV.
- **CMS (Content)**:
  - **Blog Editor**: Rich text editing with live split-screen preview.
  - **Portfolio Manager**: Add case studies with live card preview.
  - **Site Settings**: Update Logo, Phone, Email, and Hero text without code.
  - **Services & Testimonials**: Full CRUD capabilities.
- **Operations**:
  - **Kanban Board**: Drag-and-drop project task management.
  - **Financials**: Invoice tracking (Draft/Sent/Paid) and revenue analytics.
  - **Team Management**: Invite members and manage roles (Admin/Editor/Viewer).
  - **Calendar**: Manage upcoming discovery calls.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Animations**: Framer Motion
- **Backend (BaaS)**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google GenAI SDK (Gemini 2.5)
- **Email**: EmailJS
- **Security**: Supabase RLS (Row Level Security), hCaptcha (Optional support)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:

```bash
npm install
```

### 2. Configuration
Open `constants.tsx` and update the following configuration keys with your real credentials:

```typescript
// Supabase
export const SUPABASE_URL = "your_supabase_project_url";
export const SUPABASE_ANON_KEY = "your_supabase_anon_key";

// EmailJS
export const EMAILJS_SERVICE_ID = "your_service_id";
export const EMAILJS_TEMPLATE_ID = "your_template_id";
export const EMAILJS_PUBLIC_KEY = "your_public_key";

// Google Gemini (In pages/Demo.tsx or .env)
// Ensure process.env.API_KEY is accessible
```

### 3. Database Setup (Supabase)
Go to your Supabase Dashboard -> **SQL Editor** and run the consolidated setup script found in `lib/supabaseClient.ts`. This will:
1.  Create all tables (`leads`, `posts`, `projects`, `invoices`, etc.).
2.  Enable Row Level Security (RLS).
3.  Set up Storage Buckets for image uploads.

### 4. Run Locally
Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

---

## 📂 Project Structure

```
/src
  /components
    /admin       # Dashboard modules (Leads, Kanban, etc.)
    /ui          # Reusable UI (Card, Button, Modal, Input)
    Navbar.tsx, Footer.tsx, etc.
  /contexts      # Auth, Toast, SiteSettings
  /lib           # Supabase Client
  /pages         # Public pages & Admin screens
  App.tsx        # Routing & Layout
  constants.tsx  # Config & Static Fallbacks
  types.ts       # TypeScript Interfaces
```

---

## 🔐 Admin Access

1.  **First Login**: You must manually create the first user in Supabase Authentication dashboard.
2.  **Access**: Go to `/admin/login`.
3.  **Forgot Password**: Use the link on the login page (requires SMTP setup in Supabase).

---

## 🚢 Deployment

This project is optimized for deployment on **Vercel** or **Netlify**.

1.  Push code to GitHub.
2.  Import project into Vercel/Netlify.
3.  Add `API_KEY` (Gemini) to the Environment Variables.
4.  Deploy!

---

**Built with ❤️ by HyperBuild Labs**