@echo off
echo ========================================
echo Subaselvi Motors Billing System Setup
echo ========================================
echo.

echo Step 1: Creating GitHub Repository...
echo Please go to https://github.com/deepakaarumugham8-glitch and create a new repository named "subaselvi-motors-billing"
echo.
pause

echo Step 2: Pushing code to GitHub...
git remote set-url origin https://github.com/deepakaarumugham8-glitch/subaselvi-motors-billing.git
git push -u origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub. Make sure the repository exists first.
    pause
    exit /b 1
)

echo Step 3: Deploying to Vercel...
echo Please log in to Vercel if prompted...
npx vercel login
npx vercel --prod

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your website should now be deployed to Vercel
echo GitHub: https://github.com/deepakaarumugham8-glitch/subaselvi-motors-billing
echo Vercel: Check your Vercel dashboard for the deployment URL
echo.
echo IMPORTANT: Make sure to set up Vercel Blob Storage for data persistence
echo Blob Storage URL: https://vercel.com/deepak-e04a/~/stores/blob/store_KDuUDuDfe9oTjFeJ/manage-blobs
echo.
pause
