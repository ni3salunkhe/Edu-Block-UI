# Environment Configuration Guide

## Overview
This project uses different environment configurations for local development and production deployment.

## Environment Files

### `.env` (Production - Committed to Git)
- **Purpose**: Used for production deployments on Render
- **API URL**: `https://edu-block-1.onrender.com/api`
- **Status**: This file IS committed to git for Render deployment

### `.env.local` (Local Development - Gitignored)
- **Purpose**: Used for local development
- **API URL**: `http://localhost:8081/api`
- **Status**: This file is gitignored and NOT committed

## How It Works

Vite loads environment files in this priority order:
1. `.env.local` (highest priority - local development)
2. `.env` (fallback - production)

This means:
- **Local development**: Uses `.env.local` → connects to `localhost:8081`
- **Render deployment**: Uses `.env` → connects to `https://edu-block-1.onrender.com`

## Deployment URLs

- **Frontend**: https://edu-block-ui.onrender.com
- **Backend**: https://edu-block-1.onrender.com

## Important Notes

⚠️ **After making changes to `.env` or `.env.local`:**
1. Restart your development server (`npm run dev`)
2. For Render deployment, push changes to trigger a new build

⚠️ **Common Issues:**
- If login fails with "Access Denied" → Check that `VITE_API_URL` points to the correct backend
- If you see CORS errors → Verify backend CORS configuration allows your frontend domain
- If you get network errors → Check browser console for the actual API URL being used

## Testing Configuration

To verify which API URL is being used:
1. Open browser console
2. Try to login
3. Check the network tab or console logs for "API Base URL"
