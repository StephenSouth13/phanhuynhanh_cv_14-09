# MongoDB Atlas Migration Guide

This project has been fully migrated from JSON file storage to **MongoDB Atlas Serverless**. Follow these steps to deploy and use the application.

## Prerequisites

- MongoDB Atlas Account (https://www.mongodb.com/cloud/atlas)
- Vercel Project already configured
- Environment variables set up in Vercel Project Settings

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create or log into your account
3. Create a new **Serverless Cluster** (recommended for Vercel)
4. Get your connection string with credentials: `mongodb+srv://admin:adminMSC@cluster0.uh8oy4b.mongodb.net/?appName=Cluster0`

## Step 2: Configure Environment Variables in Vercel

In your **Vercel Project Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:adminMSC@cluster0.uh8oy4b.mongodb.net/?appName=Cluster0` |
| `MONGODB_DATABASE` | `phanhuynhanh_db` |

**Important:** These must be available in all environments (Production, Preview, Development).

## Step 3: Database Collections

The system will automatically create these collections on first deployment:

- **users** - Admin user accounts (default: admin@example.com / admin123)
- **messages** - Contact form messages
- **home** - Homepage data (heading, subtitle, banner image)
- **about** - About page data
- **resume** - Resume/CV data
- **portfolio** - Portfolio projects
- **services** - Training programs
- **contact** - Contact configuration (email, webhooks)
- **contacts** - Submitted contact form entries

## Step 4: Default Admin User

First login credentials:
- **Email:** `admin@example.com`
- **Password:** `admin123`

**Change these immediately after first login!** You can update user credentials in MongoDB Atlas directly.

## Step 5: Data Migration (Optional)

If you have existing data from JSON files, you can manually import it:

1. Export your JSON data from `data/` folder
2. Use MongoDB Atlas Data Import feature or a migration script
3. Format must match the collection schemas

### Example Collection Schemas:

**home collection:**
```json
{
  "heading": "Your Title",
  "subtitle": "Your Subtitle",
  "bannerImage": "path/to/image.jpg"
}
```

**messages collection:**
```json
{
  "name": "Sender Name",
  "email": "sender@example.com",
  "subject": "Message Subject",
  "message": "Message Body",
  "createdAt": "2024-01-01T00:00:00Z",
  "ip": "192.168.1.1"
}
```

## API Endpoints

All endpoints are now MongoDB-based:

### Authentication
- `POST /api/login.php` - Login with email/password
- `GET /api/logout.php` - Logout
- `GET /api/me.php` - Get current user (requires auth)

### Page Content (requires auth)
- `GET /api/page.php?section=home` - Get section data
- `PUT /api/page.php?section=home` - Update section data
- `DELETE /api/page.php?section=home` - Delete section data

Supported sections: `home`, `about`, `resume`, `portfolio`, `services`, `contact`

### Messages (requires auth)
- `GET /api/messages.php` - List all messages
- `DELETE /api/messages.php?id=<messageId>` - Delete a message

### Contact Form (public)
- `POST /forms/contact.php` - Submit contact form (saves to `contacts` collection)

### Upload (requires auth)
- `POST /api/upload.php` - Upload image files

## File Structure

```
├── api/
│   ├── _bootstrap.php      # Common setup & helpers
│   ├── _database.php       # MongoDB connection
│   ├── login.php           # Authentication
│   ├── logout.php          # Session termination
│   ├── me.php              # Current user info
│   ├── messages.php        # Message CRUD
│   ├── page.php            # Page content CRUD
│   └── upload.php          # File upload
├── forms/
│   └── contact.php         # Contact form processing
├── admin/
│   ├── index.html          # Admin panel
│   ├── admin.js            # Admin UI logic
│   └── admin.css           # Admin styles
├── data/                   # (Legacy - no longer used)
├── uploads/                # Uploaded files
├── composer.json           # PHP dependencies
└── vercel.json            # Vercel configuration
```

## Deployment

1. **Install Dependencies (Vercel handles this automatically)**
   ```bash
   composer install --no-dev
   ```

2. **Push to GitHub/Git**
   ```bash
   git add .
   git commit -m "Migrate to MongoDB Atlas"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Vercel automatically detects `composer.json`
   - Will install MongoDB PHP driver
   - Environment variables are injected at runtime

4. **Verify Deployment**
   - Access admin panel at `https://your-domain.com/admin`
   - Login with default credentials
   - Test CRUD operations

## Security Notes

⚠️ **Important:**

1. Change default admin password immediately after first login
2. Keep MongoDB credentials secure - never commit to git
3. Use strong passwords for MongoDB user
4. Enable IP whitelist in MongoDB Atlas (add Vercel IPs)
5. Use HTTPS only (Vercel provides this by default)
6. Regularly backup your MongoDB database

## Troubleshooting

### Can't connect to MongoDB
- Verify `MONGODB_URI` and `MONGODB_DATABASE` in Vercel Environment Variables
- Check MongoDB Atlas IP whitelist includes Vercel IPs
- Verify cluster is running in MongoDB Atlas

### Admin panel shows errors
- Check browser console for error messages
- Verify you're logged in
- Check Vercel function logs for PHP errors

### Upload not working
- Ensure `uploads/` directory exists on Vercel
- Check file size (max 5MB)
- Verify file type is image (jpg, png, gif, webp, svg)

### Email not sending
- Verify `contact.email` in contact collection is set
- Check email service configuration
- Look for SMTP errors in logs

## Old JSON Files

The `data/` folder can be safely deleted after migration:
```bash
rm -rf data/
```

All data is now persisted in MongoDB Atlas.

## Support

For MongoDB issues: https://docs.mongodb.com/
For Vercel issues: https://vercel.com/docs
For PHP MongoDB: https://www.php.net/manual/en/mongodb.installation.php

---

**Migration completed:** Your project is now fully using MongoDB Atlas! 🎉
