# Empire Spare Parts - Phase 1

A full-stack business web application built with Next.js 14 and Supabase for managing automotive spare parts inventory and generating invoices.

## 🚀 Project Overview

**Phase 1 Deliverables:**

### Public Site
- ✅ Home page with hero section and features
- ✅ Product Catalogue with filtering (no prices displayed)
- ✅ Contact page with phone & WhatsApp integration

### Admin Dashboard (PWA-style)
- ✅ Admin login with Supabase Authentication
- ✅ Dashboard with statistics overview
- ✅ Products management (placeholder for Phase 2)
- ✅ Categories management (placeholder for Phase 2)
- ✅ Invoice generator (placeholder for Phase 2)
- ✅ Invoice history (placeholder for future)

### Key Features
- No shopping cart or online payment
- All invoices are offline/manual
- Image uploads via Supabase Storage
- Fully responsive design with Tailwind CSS
- Clean, organized folder structure

---

## 📁 Project Structure

```
Empire_spare_parts/
├── components/
│   ├── AdminLayout.jsx       # Admin dashboard layout with sidebar
│   ├── Footer.jsx             # Public site footer
│   └── Navbar.jsx             # Public site navigation
├── lib/
│   └── supabaseClient.js      # Supabase client configuration
├── pages/
│   ├── admin/
│   │   ├── categories/
│   │   │   └── index.jsx      # Manage categories (placeholder)
│   │   ├── invoices/
│   │   │   ├── index.jsx      # Invoice history (placeholder)
│   │   │   └── new.jsx        # Invoice generator (placeholder)
│   │   ├── products/
│   │   │   └── index.jsx      # Manage products (placeholder)
│   │   ├── index.jsx          # Admin dashboard
│   │   └── login.jsx          # Admin login page
│   ├── products/
│   │   └── index.jsx          # Public product catalogue
│   ├── _app.jsx               # Next.js app wrapper
│   ├── _document.jsx          # Custom document
│   ├── contact.jsx            # Contact page
│   └── index.jsx              # Home page
├── styles/
│   └── globals.css            # Global styles with Tailwind
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Database schema
│       └── 002_storage_setup.sql     # Storage buckets setup
├── .env.local.example         # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Git (optional)

### 2. Install Dependencies

```powershell
npm install
```

### 3. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `empire-spare-parts`
   - Database Password: (choose a strong password)
   - Region: (closest to you)
4. Wait for project to be created

### 4. Configure Environment Variables

1. Copy the example file:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy `Project URL` and `anon/public key`

3. Edit `.env.local` and paste your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 5. Run Database Migrations

1. Go to your Supabase Dashboard > SQL Editor
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Repeat for `002_storage_setup.sql`

**Alternative: Manual Storage Setup**

If the SQL storage setup doesn't work:
1. Go to Storage section in Supabase Dashboard
2. Create two new buckets:
   - `product-images` (make it **public**)
   - `branding` (make it **public**)
3. Set appropriate policies via the UI

### 6. Create Your First Admin User

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add User" > "Create new user"
3. Enter email and password
4. Note the `user_id` from the users table

5. Add admin role in SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'admin');
   ```

### 7. Run Development Server

```powershell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🎨 Supabase Storage Configuration

### Required Buckets

| Bucket Name | Public Access | Purpose |
|------------|---------------|---------|
| `product-images` | ✅ Yes | Product photos uploaded via admin |
| `branding` | ✅ Yes | Company logos, banners, etc. |

### Folder Structure (Recommended)

```
product-images/
├── products/
│   ├── product-uuid-1/
│   │   ├── main.jpg
│   │   ├── alt-1.jpg
│   │   └── alt-2.jpg
│   └── product-uuid-2/
│       └── main.jpg

branding/
├── logo.png
├── banner.jpg
└── favicon.ico
```

### Storage Policies

The migration script automatically creates these policies:
- Public can **view** all images
- Admins/staff can **upload, update, delete** images

---

## 🗄️ Database Schema

### Tables Created

1. **categories** - Product categories
2. **products** - Spare parts inventory
3. **product_images** - Product image URLs
4. **invoices** - Invoice headers
5. **invoice_items** - Invoice line items
6. **user_roles** - Admin/staff role management

### Key Features

- UUID primary keys
- Row Level Security (RLS) enabled
- Auto-generated invoice numbers
- Cascade deletes where appropriate
- Sample seed data included

---

## 🔐 Authentication & Authorization

### User Roles

- **admin** - Full access to all features
- **staff** - Limited admin access (can be customized)

### Protected Routes

All `/admin/*` routes require authentication and admin role.

### Login Credentials

Use the email/password you created in Supabase Auth.

---

## 📱 Contact Information

Update these values in the code:

**File: `pages/contact.jsx`**
```javascript
const phoneNumber = '+1234567890'        // Your phone number
const whatsappNumber = '1234567890'      // WhatsApp number (no + or spaces)
const email = 'info@empirespareparts.com' // Your email
const address = '123 Auto Parts Street...' // Your address
```

**Files: `components/Footer.jsx`, `components/Navbar.jsx`**
- Update contact info in footer
- Update company name/branding as needed

---

## 🎯 Phase 2 - Coming Next

The following features are planned for Phase 2:

### Products Management
- [ ] Complete CRUD operations for products
- [ ] Image upload functionality
- [ ] Bulk import/export
- [ ] Product search and filtering

### Categories Management
- [ ] Add/edit/delete categories
- [ ] Category ordering
- [ ] Category icons

### Invoice Generator
- [ ] Customer information form
- [ ] Product selection with search
- [ ] Manual price entry
- [ ] Tax calculation
- [ ] PDF generation (jsPDF)
- [ ] Download/Print functionality

### Enhancements
- [ ] Better image gallery
- [ ] Advanced filters on public catalogue
- [ ] Invoice history with search
- [ ] Dashboard analytics
- [ ] PWA manifest for mobile install

---

## 🛠️ Available Scripts

```powershell
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🎨 Styling

This project uses **Tailwind CSS** for styling.

### Custom Utility Classes

Defined in `styles/globals.css`:
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.input-field` - Form input style
- `.card` - Card container style

### Color Palette

Primary colors defined in `tailwind.config.js`:
- Primary: Blue shades (customizable)
- Gray scale for UI elements

---

## 🚀 Deployment

### Recommended Platforms

1. **Vercel** (Easiest for Next.js)
   - Connect your GitHub repo
   - Add environment variables
   - Auto-deploys on push

2. **Netlify**
   - Similar to Vercel
   - Good for static sites

3. **Self-hosted**
   - Build: `npm run build`
   - Start: `npm start`
   - Use PM2 or similar for process management

### Environment Variables for Production

Make sure to set these in your deployment platform:
```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

---

## 📝 Notes

### Image Placeholder

The product catalogue expects images from Supabase Storage. If a product has no images, it falls back to `/placeholder-product.png`.

**Action Required:** Add a placeholder image to your `/public` folder or update the fallback logic.

### Invoice Numbers

Invoice numbers are auto-generated in format: `INV-YYYYMMDD-0001`

### Security

- RLS is enabled on all tables
- Public can only view active products
- All admin operations require authentication

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env.local` exists
- Verify variable names start with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`

### "You do not have admin access"

- Check that your user exists in `user_roles` table
- Verify the `user_id` matches exactly
- Check RLS policies are applied

### Images not loading

- Verify storage buckets are **public**
- Check storage policies in Supabase Dashboard
- Ensure image URLs are correctly stored in database

### Build errors

- Run `npm install` again
- Delete `.next` folder and rebuild
- Check for TypeScript/ESLint errors

---

## 📄 License

Private project - All rights reserved

---

## 👥 Support

For questions or issues during development:
1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
3. Review the code comments in each file

---

**Phase 1 Complete! ✅**

Ready to move to Phase 2 for full CRUD implementation and invoice generation.
