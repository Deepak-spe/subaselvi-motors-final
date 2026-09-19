# Subaselvi Motors Billing System - Deployment Guide

## Current Status
✅ GitHub: Code is at https://github.com/Deepak-spe/subaselvi-motors-billing
✅ Vercel Config: Updated vercel.json for proper deployment
⏳ Vercel Deployment: Ready for manual deployment

## Manual Deployment to Vercel (Step-by-Step)

### Step 1: Go to Vercel Dashboard
1. Open your browser and visit: **https://vercel.com/deepak-e04a**
2. Click the **"Add New Project"** button (usually top right)

### Step 2: Import GitHub Repository
1. Click **"Import Git Repository"**
2. Look for **"Deepak-spe/subaselvi-motors-billing"** in the list
3. Click **"Import"** button next to it

### Step 3: Configure Project Settings
- **Project Name**: `subaselvi-motors-billing` (or any name you prefer)
- **Framework Preset**: Select **"Other"** or **"Node.js"**
- **Root Directory**: Leave as `./`
- **Build Command**: Leave empty
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### Step 4: Environment Variables (Optional but Recommended)
Click **"Environment Variables"** and add:
- `NODE_ENV`: `production`

### Step 5: Deploy
1. Click the **"Deploy"** button
2. Wait for the deployment to complete (usually 1-2 minutes)
3. You'll see a success message with your website URL

### Step 6: Set Up Vercel Blob Storage (CRITICAL for Data Saving)
This is essential for saving invoice data:

1. After deployment, go to your project dashboard
2. Click the **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Blob"**
5. Click **"Continue"**
6. Choose your region (default is fine)
7. Click **"Create"**
8. This will automatically create the `BLOB_READ_WRITE_TOKEN` environment variable

### Step 7: Verify Deployment
1. Visit your deployed website URL
2. Test all three login roles:
   - Admin Console (password: `Subaselvi@123`)
   - Service/TVS
   - Credit/TVS Credit
   - Mahindra
3. Create a test invoice to verify data saving works

### Step 8: Set Up Custom Domain (Optional)
If you want a custom domain:
1. Go to project **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions

## Important Notes

### Data Persistence
- **With Vercel Blob Storage**: All invoice data will be saved permanently
- **Without Vercel Blob Storage**: Data will be lost on redeployment
- **Local Fallback**: System will use local files if blob storage is not configured

### 24/7 Availability
- Vercel provides automatic 24/7 hosting
- Your website will be always online
- Automatic scaling for multiple users

### User Access
- Share the Vercel URL with all users
- No installation required for users
- Works on any device with internet access

## Troubleshooting

### If deployment fails:
- Check the deployment logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify vercel.json configuration

### If data not saving:
- Ensure Vercel Blob Storage is set up
- Check environment variables in project settings
- Review server logs in Vercel dashboard

### If website not accessible:
- Check deployment status in Vercel dashboard
- Verify domain configuration (if using custom domain)
- Clear browser cache

## Support
For issues:
- Vercel Dashboard: https://vercel.com/deepak-e04a
- GitHub Repository: https://github.com/Deepak-spe/subaselvi-motors-billing
- Vercel Support: https://vercel.com/help

## Next Steps After Deployment
1. Test all user roles
2. Create sample invoices
3. Verify admin console statistics
4. Set up regular backups (Vercel Blob handles this automatically)
5. Share the website URL with your users

## Deployment Checklist
- [ ] GitHub repository updated
- [ ] Vercel project created
- [ ] Deployment successful
- [ ] Vercel Blob Storage configured
- [ ] All user roles tested
- [ ] Invoice creation tested
- [ ] Admin console verified
- [ ] Website shared with users
- [ ] Custom domain configured (optional)
