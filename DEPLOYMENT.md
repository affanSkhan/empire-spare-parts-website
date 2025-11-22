# 🚀 Deployment Guide - Empire Spare Parts

## Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Prepare Your Project

1. Make sure all changes are committed to Git
2. Push to GitHub/GitLab/Bitbucket

```powershell
git init
git add .
git commit -m "Phase 1 complete"
git remote add origin your-repo-url
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

Your site will be live at: `https://your-project.vercel.app`

---

## Deploying to Netlify

### Step 1: Build Settings

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Step 2: Environment Variables

In Site settings > Environment variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Step 3: Deploy

Click "Deploy site"

---

## Self-Hosted Deployment

### Requirements
- Node.js 18+ on server
- Process manager (PM2 recommended)
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt)

### Step 1: Build the Application

```bash
npm install
npm run build
```

### Step 2: Install PM2

```bash
npm install -g pm2
```

### Step 3: Start the Application

```bash
pm2 start npm --name "empire-spare-parts" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Production Checklist

Before deploying to production:

### Environment
- [ ] Production Supabase project created
- [ ] Environment variables configured
- [ ] Database migrations run on production DB
- [ ] Storage buckets created and configured
- [ ] Admin users created

### Security
- [ ] RLS policies reviewed and tested
- [ ] API keys are production keys (not test)
- [ ] No sensitive data in code
- [ ] `.env.local` not committed to Git
- [ ] HTTPS enabled (SSL certificate)

### Performance
- [ ] Images optimized
- [ ] Build completed without errors
- [ ] No console errors in production
- [ ] Lighthouse score reviewed

### Content
- [ ] Contact information updated
- [ ] Company branding added
- [ ] Placeholder images replaced
- [ ] Test products added
- [ ] Categories populated

### Testing
- [ ] Home page loads correctly
- [ ] Product catalogue works
- [ ] Contact page displays correctly
- [ ] Admin login functional
- [ ] Dashboard displays data
- [ ] All navigation links work

---

## Domain Setup

### Custom Domain on Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for DNS propagation (can take 24-48 hours)

### DNS Configuration

Add these records at your domain registrar:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Post-Deployment

### 1. Verify Deployment

Visit your production URL and check:
- [ ] Home page loads
- [ ] Products page works
- [ ] Contact page displays
- [ ] Admin login accessible
- [ ] Images load correctly

### 2. Setup Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Uptime monitoring (UptimeRobot)

### 3. Backup Strategy

- Database: Use Supabase automatic backups
- Code: Ensure Git repository is backed up
- Images: Enable Supabase Storage versioning

---

## Updating the Application

### For Vercel/Netlify (Git-based)

1. Make changes locally
2. Commit and push to Git
3. Automatic deployment triggers

```powershell
git add .
git commit -m "Update description"
git push
```

### For Self-Hosted

1. Pull latest changes
2. Rebuild application
3. Restart PM2 process

```bash
git pull
npm install
npm run build
pm2 restart empire-spare-parts
```

---

## Rollback Procedure

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"

### Self-Hosted
1. Checkout previous commit
2. Rebuild and restart

```bash
git checkout previous-commit-hash
npm run build
pm2 restart empire-spare-parts
```

---

## Troubleshooting Production Issues

### Build Fails
- Check build logs in deployment platform
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

### Environment Variables Not Working
- Ensure they start with `NEXT_PUBLIC_`
- Redeploy after adding new variables
- Check for typos in variable names

### Images Not Loading
- Verify Supabase URL in Next.js config
- Check storage bucket is public
- Ensure image URLs are correct in database

### 500 Server Error
- Check server logs
- Verify Supabase credentials
- Check database connection

---

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Monthly: Update dependencies (`npm update`)
- [ ] Quarterly: Security audit
- [ ] As needed: Database backups verification

### Updating Dependencies

```powershell
# Check for updates
npm outdated

# Update all (careful with major versions)
npm update

# Update specific package
npm update package-name
```

---

## Performance Optimization

### Image Optimization
- Use Next.js Image component (already implemented)
- Compress images before upload
- Use WebP format when possible

### Caching
- Supabase Storage has built-in CDN
- Consider Cloudflare for additional caching

### Database
- Review query performance
- Add indexes for commonly filtered fields
- Monitor Supabase dashboard for slow queries

---

**Your application is ready for production! 🎉**

Choose your deployment platform and follow the steps above.
