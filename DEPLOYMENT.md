# Deploying EduBlock Frontend to Render

This guide will walk you through deploying your React application to Render.

## Prerequisites

- GitHub repository with your code (✅ Already done: https://github.com/ni3salunkhe/Edu-Block-UI.git)
- Render account (free tier available at https://render.com)

## Deployment Steps

### 1. Create a Render Account

1. Go to https://render.com
2. Sign up using your GitHub account (recommended for easy integration)

### 2. Create a New Static Site

1. From your Render Dashboard, click **"New +"** button
2. Select **"Static Site"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Search for `Edu-Block-UI`
   - Click **"Connect"**

### 3. Configure Build Settings

Fill in the following settings:

**Name**: `edublock-frontend` (or any name you prefer)

**Branch**: `main`

**Build Command**:
```bash
npm install && npm run build
```

**Publish Directory**:
```
dist
```

### 4. Add Environment Variables

Click **"Advanced"** and add environment variables:

**Key**: `VITE_API_URL`  
**Value**: `https://your-backend-api-url.com/api`

> ⚠️ **Important**: Replace with your actual backend API URL

### 5. Deploy

1. Click **"Create Static Site"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Run the build command
   - Deploy your application

### 6. Custom Domain (Optional)

After deployment:
1. Go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `edublock.yourdomain.com`)
3. Follow Render's DNS configuration instructions

## Post-Deployment

### Your Application URL

After deployment completes, your app will be available at:
```
https://edublock-frontend.onrender.com
```
(or your custom domain if configured)

### Automatic Deployments

Render automatically redeploys when you push to the `main` branch on GitHub.

### Monitoring

- View build logs in the Render dashboard
- Check deployment status
- Monitor application performance

## Troubleshooting

### Build Fails

**Issue**: Build command fails  
**Solution**: Check that `package.json` has the correct scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Environment Variables Not Working

**Issue**: API calls fail  
**Solution**: 
1. Verify `VITE_API_URL` is set in Render dashboard
2. Ensure the variable starts with `VITE_` prefix
3. Redeploy after adding/changing environment variables

### 404 on Page Refresh

**Issue**: Routes return 404 when refreshing  
**Solution**: Render automatically handles this for Vite apps, but if issues persist, ensure you're using React Router's `BrowserRouter`.

## Alternative: Deploy with Render Blueprint (Advanced)

Create a `render.yaml` in your repository root:

```yaml
services:
  - type: web
    name: edublock-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://your-backend-api-url.com/api
```

Then deploy using **"New → Blueprint"** in Render dashboard.

## Cost

- **Free Tier**: Perfect for development and testing
  - Automatic sleep after 15 minutes of inactivity
  - 750 hours/month of runtime
  
- **Paid Plans**: Starting at $7/month
  - No sleep
  - Custom domains
  - Better performance

## Next Steps

1. Deploy your backend API to Render (if not already done)
2. Update `VITE_API_URL` with the backend URL
3. Test all features in production
4. Set up custom domain
5. Configure SSL (automatic with Render)

## Support

- Render Documentation: https://render.com/docs/static-sites
- Vite Deployment Guide: https://vitejs.dev/guide/static-deploy.html

---

**Quick Deploy Checklist:**
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Configure build settings (build command: `npm install && npm run build`, publish: `dist`)
- [ ] Add `VITE_API_URL` environment variable
- [ ] Click "Create Static Site"
- [ ] Wait for deployment to complete
- [ ] Test your application at the provided URL
