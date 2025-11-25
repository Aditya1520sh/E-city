# Environment Variables Configuration

This file documents all required and optional environment variables for the E-City application.

## Server Environment Variables

Create a file at `private/.env.server` with the following variables:

### Required Variables

```bash
# Database Configuration
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecity?appName=Cluster0"

# Security - JWT Authentication (REQUIRED - No defaults for security)
# Generate a secure random string: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-secure-jwt-secret-minimum-32-characters"

# Security - Session Secret (REQUIRED - No defaults for security)
SESSION_SECRET="your-secure-session-secret-minimum-32-characters"

# Application URLs
CLIENT_URL="http://localhost:5173"
```

### Optional Variables

```bash
# Google OAuth (Optional - Only if using Google login)
GOOGLE_CLIENT_ID="your-google-client-id-from-console"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Server Configuration
PORT=3000
NODE_ENV="development"  # development or production

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Client Environment Variables

Create a file at `private/.env.client` (or `client/.env.production` for production) with:

```bash
# API Configuration
VITE_API_URL="http://localhost:3000/api"

# For production deployment
# VITE_API_URL="https://your-production-api.com/api"
```

## Security Notes

⚠️ **CRITICAL SECURITY REQUIREMENTS:**

1. **JWT_SECRET and SESSION_SECRET are REQUIRED** - The application will fail to start without them
2. **Never use default/example values** in production
3. **Generate strong secrets** using: 
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **Never commit secrets** to version control - they should only exist in the `private/` folder
5. **Different secrets per environment** - Use different secrets for dev/staging/production

## Generating Secure Secrets

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Node.js (Cross-platform):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment Validation

The application now validates critical environment variables on startup:
- **JWT_SECRET**: Required for token generation
- **SESSION_SECRET**: Required for session management
- **DATABASE_URL**: Required for database connection

If any required variable is missing, the application will exit with an error message.

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate new JWT_SECRET (different from dev)
- [ ] Generate new SESSION_SECRET (different from dev)
- [ ] Configure production DATABASE_URL
- [ ] Set CLIENT_URL to your production frontend URL
- [ ] Configure CORS allowed origins in code
- [ ] Enable Cloudinary or configure image storage
- [ ] Set up Google OAuth (if using)
- [ ] Verify all secrets are stored securely (not in code)
