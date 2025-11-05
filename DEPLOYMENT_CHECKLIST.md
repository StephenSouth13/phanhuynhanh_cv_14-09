# MongoDB Migration - Deployment Checklist

## ✅ Code Changes Completed

- [x] Created MongoDB connection helper (`api/_database.php`)
- [x] Updated bootstrap to use MongoDB (`api/_bootstrap.php`)
- [x] Migrated authentication to MongoDB (`api/login.php`)
- [x] Migrated messages CRUD to MongoDB (`api/messages.php`)
- [x] Migrated page content CRUD to MongoDB (`api/page.php`)
- [x] Updated contact form to save to MongoDB (`forms/contact.php`)
- [x] Created `composer.json` with MongoDB PHP driver
- [x] Added initialization script (`api/_init-db.php`)
- [x] Created deployment guide (`MONGODB_MIGRATION.md`)

## 🔧 Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account if not already done
- [ ] Create Serverless Cluster in MongoDB Atlas
- [ ] Get connection string (mongodb+srv://...)
- [ ] Create database user (if not already created)
- [ ] Note the database name and connection URI

### 2. Vercel Environment Variables
- [ ] Go to Vercel Project Settings → Environment Variables
- [ ] Add `MONGODB_URI` with your connection string
- [ ] Add `MONGODB_DATABASE` with your database name
- [ ] Ensure variables are available in Production, Preview, and Development
- [ ] **Do NOT commit .env files** - let Vercel inject them at runtime

### 3. MongoDB Atlas Security
- [ ] Add Vercel IP addresses to MongoDB Atlas IP Whitelist
  - North America: 76.75.178.0/24, 34.194.105.0/24, 54.211.212.0/24
  - Europe: 18.159.251.0/24, 13.48.60.0/24
  - More info: https://vercel.com/guides/how-to-allowlist-vercel-ips
- [ ] Or allow access from anywhere (0.0.0.0/0) - less secure but easier for testing
- [ ] Enable automatic backups (optional but recommended)

## 🚀 Deployment Steps

### Step 1: Verify Local Setup (Optional)
```bash
# Install dependencies locally
composer install

# Test that MongoDB connection works
php api/_init-db.php
```

### Step 2: Push Code to Repository
```bash
git add .
git commit -m "Migrate to MongoDB Atlas - complete CRUD implementation"
git push origin main
```

### Step 3: Vercel Deployment
- [ ] Go to Vercel Dashboard
- [ ] Wait for automatic deployment (Vercel detects composer.json)
- [ ] Check deployment logs for any errors
- [ ] Verify build succeeded

### Step 4: Initialize Database
- [ ] Access `https://your-domain.com/api/_init-db.php`
- [ ] Should return JSON with collection initialization status
- [ ] Verify all collections are created successfully

### Step 5: Test Admin Panel
- [ ] Access `https://www.phanhuynhanh.com/admin`
- [ ] Login with default credentials:
  - Email: `admin@example.com`
  - Password: `admin123`
- [ ] Test each section:
  - [ ] Home - Update heading, subtitle
  - [ ] About - Upload portrait image, update bio
  - [ ] Resume - Add education/experience
  - [ ] Portfolio - Add projects
  - [ ] Services - Add programs
  - [ ] Contact - Set email address
- [ ] Test upload functionality
- [ ] Verify data persists in MongoDB

### Step 6: Test Public Contact Form
- [ ] Go to website contact page
- [ ] Submit a test message
- [ ] Verify message appears in Admin → Contact → Messages list
- [ ] Verify message is saved in MongoDB `contacts` collection

### Step 7: Post-Deployment Security
- [ ] Change default admin password
  - Edit `users` collection in MongoDB Atlas
  - Generate new password hash with `password_hash('newpassword', PASSWORD_DEFAULT)`
- [ ] Verify HTTPS is enabled (should be by default on Vercel)
- [ ] Test logout functionality
- [ ] Ensure unauthenticated users can't access API endpoints

## 📊 Database Collections Checklist

Verify these collections exist in MongoDB Atlas:

- [ ] `users` - Admin user accounts (check: should have 1 default user)
- [ ] `messages` - Contact form messages
- [ ] `home` - Homepage data
- [ ] `about` - About page data
- [ ] `resume` - Resume/CV data
- [ ] `portfolio` - Portfolio projects
- [ ] `services` - Training programs
- [ ] `contact` - Contact configuration
- [ ] `contacts` - Submitted contact form entries

## 🔍 Verification Tests

### API Tests (use curl or Postman)

```bash
# 1. Login
curl -X POST https://www.phanhuynhanh.com/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Get current user (requires valid session cookie)
curl -X GET https://www.phanhuynhanh.com/api/me.php

# 3. Get home page data
curl -X GET "https://www.phanhuynhanh.com/api/page.php?section=home" \
  -b "PHPSESSID=<your-session-id>"

# 4. Get messages
curl -X GET https://www.phanhuynhanh.com/api/messages.php \
  -b "PHPSESSID=<your-session-id>"
```

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Unauthorized" errors | Check session cookie, verify login worked |
| MongoDB connection error | Verify MONGODB_URI and MONGODB_DATABASE env vars |
| "Collection not found" | Run `api/_init-db.php` to create collections |
| Upload fails | Check `uploads/` directory exists and is writable |
| No messages showing | Ensure contact form saves to `contacts` collection |

## 🗑️ Cleanup (After Verification)

Once everything is working:
- [ ] Delete old `data/` folder (no longer needed)
- [ ] Delete any local `.env` files (don't commit)
- [ ] Remove `MONGODB_MIGRATION.md` and this checklist from repo (optional)

```bash
rm -rf data/
rm .env .env.local
```

## 📞 Support & Documentation

- **MongoDB Docs:** https://docs.mongodb.com/
- **PHP MongoDB Driver:** https://www.php.net/manual/en/book.mongodb.php
- **Vercel Docs:** https://vercel.com/docs
- **Your MongoDB Atlas:** https://cloud.mongodb.com

---

## Final Status: ✅ READY FOR DEPLOYMENT

All code changes have been completed. Your application is ready to be deployed to Vercel with MongoDB Atlas as the backend database.

**Next Steps:**
1. Set environment variables in Vercel Project Settings
2. Push code to repository
3. Vercel will automatically deploy
4. Run initialization script
5. Test admin panel and contact form

Good luck! 🚀
