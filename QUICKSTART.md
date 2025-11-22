# Quick Start Guide - Empire Spare Parts

## ⚡ Fast Setup (5 minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Setup Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project named "empire-spare-parts"
3. Copy Project URL and anon key from Settings > API

### Step 3: Configure Environment

```powershell
Copy-Item .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials.

### Step 4: Run Database Migrations

1. Open Supabase Dashboard > SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_storage_setup.sql`

### Step 5: Create Admin User

In Supabase Dashboard:
1. Authentication > Add User
2. Copy the user ID
3. In SQL Editor, run:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('paste-user-id-here', 'admin');
```

### Step 6: Start Development

```powershell
npm run dev
```

Visit: http://localhost:3000

**Admin Login:** http://localhost:3000/admin/login

---

## 📋 Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] `.env.local` configured
- [ ] Database migrations run
- [ ] Storage buckets created (product-images, branding)
- [ ] Admin user created and role assigned
- [ ] Dev server running
- [ ] Can access home page
- [ ] Can login to admin dashboard

---

## 🎯 Next Steps

1. Update contact information in `pages/contact.jsx`
2. Add company logo to `public/` folder
3. Add a product placeholder image
4. Customize colors in `tailwind.config.js`
5. Test admin login
6. Explore the admin dashboard

---

## ⚠️ Common Issues

**Can't login?**
- Check user exists in `user_roles` table
- Verify email/password in Supabase Auth

**Images not showing?**
- Make storage buckets public
- Check storage policies are applied

**Build errors?**
- Run `npm install` again
- Delete `.next` folder

---

Need help? Check the full README.md for detailed documentation.
