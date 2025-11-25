# E-City Deployment Guide

## Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Vercel account (free tier works)
- Google Cloud Console project (for OAuth)

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables

#### Server Environment (`private/.env.server`)
Copy the template and fill in your values:
- `DATABASE_URL`: Your MongoDB connection string from MongoDB Atlas
- `JWT_SECRET`: Generate with `openssl rand -hex 32` (64 characters)
- `SESSION_SECRET`: Generate with `openssl rand -hex 32` (64 characters)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console OAuth credentials
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console OAuth credentials
- `GOOGLE_CALLBACK_URL`: For local use `http://localhost:3000/api/auth/google/callback`
- `CLIENT_URL`: For local use `http://localhost:5173`

#### Client Environment (`private/.env.client`)
- `VITE_API_URL`: For local use `http://localhost:3000/api`

### 3. Setup Database
```bash
# Generate Prisma client
npm run postinstall

# Push schema to database
npm run db:push

# Optional: seed demo data
cd server && node prisma/seed.js
```

### 4. Run Locally
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

Visit: http://localhost:5173

## Google OAuth Setup

### 1. Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"

### 2. Configure Authorized Origins & Redirects
**For Local Development:**
- Authorized JavaScript origins: `http://localhost:5173`
- Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

**For Production:**
- Authorized JavaScript origins: `https://your-domain.vercel.app`
- Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/google/callback`

### 3. Copy Credentials
Copy the Client ID and Client Secret to your `.env.server` file.

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Project
```bash
vercel
```

### 4. Add Environment Variables
Run these commands and paste values when prompted:
```bash
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add SESSION_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_CALLBACK_URL production
vercel env add CLIENT_URL production
vercel env add VITE_API_URL production
```

**Important:** 
- `GOOGLE_CALLBACK_URL` = `https://your-domain.vercel.app/api/auth/google/callback`
- `CLIENT_URL` = `https://your-domain.vercel.app`
- `VITE_API_URL` = `https://your-domain.vercel.app/api`

### 5. Deploy to Production
```bash
vercel --prod
```

### 6. Set Custom Domain (Optional)
```bash
vercel alias set <deployment-url> your-custom-domain.vercel.app
```

## Demo Accounts (After Seeding)
- **Admin**: admin@ecity.com / admin
- **Citizen**: john@example.com / user

## Project Structure
```
e-city/
├── api/                    # Vercel serverless function entry
├── client/                 # React frontend (Vite)
├── server/                 # Express backend
│   ├── prisma/            # Database schema & migrations
│   └── src/               # API routes & middleware
├── private/               # Environment files (git-ignored)
├── package.json           # Root dependencies
└── vercel.json            # Vercel configuration
```

## Troubleshooting

### OAuth Not Working
1. Verify Google Console redirect URIs match exactly (no trailing slash)
2. Check `GOOGLE_CALLBACK_URL` and `CLIENT_URL` in Vercel env vars
3. Ensure all environment variables are set in Vercel (production)
4. Check deployment logs: `vercel logs <deployment-url>`

### Database Connection Failed
1. Verify MongoDB Atlas cluster is active
2. Check IP whitelist includes `0.0.0.0/0` for Vercel
3. Confirm `DATABASE_URL` is correct in Vercel env vars

### Build Errors
1. Ensure all dependencies are in root `package.json`
2. Check Node.js version compatibility (18+)
3. Verify `terser` is in `client/package.json` devDependencies

## Security Notes
- Never commit `.env` files with real secrets
- Rotate secrets if accidentally exposed
- Use strong random values for JWT_SECRET and SESSION_SECRET
- Keep MongoDB credentials secure
- Review Google OAuth scopes regularly

## Support
For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
