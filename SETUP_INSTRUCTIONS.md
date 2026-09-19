# Setup Instructions for Subaselvi Motors Billing System

## Target Deployment Locations
- **GitHub Repository**: https://github.com/deepakaarumugham8-glitch/subaselvi-motors-billing
- **Vercel Account**: https://vercel.com/deepak-e04a
- **Vercel Blob Storage**: https://vercel.com/deepak-e04a/~/stores/blob/store_KDuUDuDfe9oTjFeJ/manage-blobs

## Step 1: Create GitHub Repository (DO THIS FIRST)

1. **Go to**: https://github.com/deepakaarumugham8-glitch
2. **Click**: "New repository" (green button, top right)
3. **Repository name**: `subaselvi-motors-billing`
4. **Description**: `Subaselvi Motors Billing System - Invoice Management`
5. **Make it**: Public (important for users to access)
6. **Initialize with**: README (optional)
7. **Click**: "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, run these commands in your project folder:

```bash
cd C:\Users\Dell\Downloads\subaselvi-motors-billing_zip\subaselvi-motors-billing

git remote set-url origin https://github.com/deepakaarumugham8-glitch/subaselvi-motors-billing.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/deepak-e04a
2. **Click**: "Add New Project"
3. **Click**: "Import Git Repository"
4. **Select**: `deepakaarumugham8-glitch/subaselvi-motors-billing`
5. **Configure**:
   - **Project Name**: `subaselvi-motors-billing`
   - **Framework Preset**: "Other"
   - **Root Directory**: `./`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
6. **Click**: "Deploy"
7. **Wait** for deployment to complete

### Option B: Using Vercel CLI

```bash
cd C:\Users\Dell\Downloads\subaselvi-motors-billing_zip\subaselvi-motors-billing

npx vercel login
npx vercel --prod
```

## Step 4: Configure Vercel Blob Storage (CRITICAL)

This is essential for saving invoice data permanently:

1. **Go to**: https://vercel.com/deepak-e04a/~/stores/blob/store_KDuUDuDfe9oTjFeJ/manage-blobs
2. **Verify**: Blob storage is active
3. **Get Environment Variable**: Copy the `BLOB_READ_WRITE_TOKEN`
4. **Add to Vercel Project**:
   - Go to your deployed project dashboard
   - Click "Settings" → "Environment Variables"
   - Add: `BLOB_READ_WRITE_TOKEN` = (paste your token)
   - Click "Save"

## Step 5: Verify Deployment

1. **Visit your Vercel deployment URL**
2. **Test all features**:
   - Admin Console login (password: `Subaselvi@123`)
   - Service/TVS invoice creation
   - Credit/TVS Credit receipt creation
   - Mahindra invoice creation
   - Admin console statistics
   - View all invoices

## Step 6: Share with Users

Once deployed and verified:
- **Share the Vercel URL** with all users
- **No installation required** for users
- **Works 24/7** automatically
- **All data saved** to Vercel Blob Storage

## Important Notes

### Data Persistence
- **Vercel Blob Storage**: All invoice data saved permanently
- **Automatic backups**: Vercel handles this automatically
- **24/7 availability**: Website always online
- **Multi-user support**: All users can access simultaneously

### Security
- **Admin password**: `Subaselvi@123` (change this in production)
- **Public repository**: Code is visible (ensure no sensitive data)
- **Blob storage**: Private and secure

### Troubleshooting

**If GitHub push fails:**
- Ensure repository exists first
- Check repository name is exactly `subaselvi-motors-billing`
- Verify you have push permissions

**If Vercel deployment fails:**
- Check deployment logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify vercel.json configuration

**If data not saving:**
- Ensure Vercel Blob Storage is configured
- Check `BLOB_READ_WRITE_TOKEN` environment variable
- Review server logs in Vercel dashboard

## Quick Setup Script

I've created `setup_and_deploy.bat` to automate the process. Run it after creating the GitHub repository:

```bash
setup_and_deploy.bat
```

## Support Links
- **GitHub**: https://github.com/deepakaarumugham8-glitch/subaselvi-motors-billing
- **Vercel Dashboard**: https://vercel.com/deepak-e04a
- **Blob Storage**: https://vercel.com/deepak-e04a/~/stores/blob/store_KDuUDuDfe9oTjFeJ/manage-blobs

## Next Steps After Setup
1. Test all user roles
2. Create sample invoices
3. Verify admin console statistics
4. Share website URL with users
5. Monitor Vercel dashboard for any issues
