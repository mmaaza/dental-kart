# Environment Configuration Guide

## Client URL Configuration

This guide explains how to properly configure the client URL for email links in different environments.

### Environment Variables

The application uses the following priority order to determine the client URL for email links:

1. **CLIENT_URL** - Explicit environment variable (highest priority)
2. **VERCEL_URL** - Vercel deployment URL (production only)
3. **NETLIFY_URL** - Netlify deployment URL (production only) 
4. **PRODUCTION_URL** - Custom production URL (production only)
5. **Default fallbacks** - Automatic defaults based on NODE_ENV

### Development Environment

For local development, the system will automatically use `http://localhost:3000` unless you specify otherwise.

**Recommended .env file for development:**
```env
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Production Environment

For production deployments, set the CLIENT_URL to your actual domain:

**For custom domains:**
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

**For Vercel deployments:**
```env
NODE_ENV=production
# VERCEL_URL is automatically set by Vercel
# Optionally override with CLIENT_URL if needed
CLIENT_URL=https://your-custom-domain.com
```

**For Netlify deployments:**
```env
NODE_ENV=production
# NETLIFY_URL is automatically set by Netlify
# Optionally override with CLIENT_URL if needed
CLIENT_URL=https://your-custom-domain.com
```

### Testing Environment

For staging or testing environments:
```env
NODE_ENV=development
CLIENT_URL=https://staging.yourdomain.com
```

### Important Notes

1. **No trailing slashes**: The system automatically removes trailing slashes from URLs
2. **Protocol required**: Always include `http://` or `https://` in your URLs
3. **Empty strings**: Empty CLIENT_URL values will be ignored and fallbacks will be used
4. **Email links affected**: This configuration affects:
   - Password reset links
   - Vendor password reset links
   - Order confirmation emails
   - Admin notification emails
   - Product images in emails
   - Logo images in emails

### Common Issues and Solutions

**Problem**: Reset password emails contain localhost URLs in production
**Solution**: Set CLIENT_URL environment variable to your production domain

**Problem**: Email images are broken
**Solution**: Ensure CLIENT_URL points to the correct domain where your frontend assets are served

**Problem**: Links in emails point to wrong domain
**Solution**: Check that CLIENT_URL is set correctly and doesn't have trailing slashes

### Example Environment Files

**.env.development**
```env
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=5000
```

**.env.production**
```env
NODE_ENV=production
CLIENT_URL=https://medicalbazarnepal.com
PORT=5000
```

**.env.staging**
```env
NODE_ENV=development
CLIENT_URL=https://staging-medicalbazarnepal.com
PORT=5000
```
