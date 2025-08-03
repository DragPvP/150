# PEPEWUFF Presale - Vercel Deployment Guide

## Overview
The PEPEWUFF token presale website is now properly configured for Vercel deployment with hardcoded configurations for reliable operation across environments.

## Key Configurations

### 🔑 Hardcoded Settings
- **REOWN_PROJECT_ID**: `3385b7de1810bee8b8c43305bfbccf87`
- **PostgreSQL Database**: `postgresql://neondb_owner:npg_s0BuDPOJY1rN@ep-frosty-feather-ae5igo6r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### 📁 File Structure (Fixed)
- No duplicate components or img directories
- All assets properly located in `client/public/img/`
- API endpoints in `/api/` directory for Vercel compatibility
- Build output in `dist/public/` directory

### 🚀 Deployment Configuration
- **Framework**: React + TypeScript with Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **API Runtime**: `@vercel/node`

## Vercel Deployment Steps

1. **Connect Repository**
   - Import project from GitHub to Vercel
   - Select this repository

2. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Framework Preset: Other

3. **Environment Variables**
   - No environment variables needed (all hardcoded)
   - Database and wallet configurations are built-in

4. **Deploy**
   - Click "Deploy" button
   - Vercel will automatically build and deploy

## Verification Checklist

✅ **Build Process**
- All assets compile without errors
- Frontend bundles successfully
- Server builds properly

✅ **Database Connection**
- PostgreSQL connection hardcoded and tested
- API endpoints respond correctly
- Presale data loads from database

✅ **Wallet Integration**
- REOWN project ID hardcoded
- Wallet connection modal works
- Multi-chain support active

✅ **API Endpoints**
- `/api/presale` - Returns presale data
- `/api/presale/calculate` - Token calculations
- `/api/wallet/purchase` - Purchase tracking

## Post-Deployment Configuration

### WalletConnect Setup
1. Visit [cloud.reown.com](https://cloud.reown.com)
2. Add your Vercel domain to the allowlist
3. Update project settings if needed

### Domain Configuration
- Vercel will provide a `.vercel.app` domain
- Can be configured with custom domain later

## Support
- Build logs available in Vercel dashboard
- Database hosted on Neon (PostgreSQL)
- All configurations hardcoded for reliability

---
**Status**: ✅ Ready for Deployment
**Last Updated**: August 3, 2025