const express = require('express');
require('dotenv').config({ path: '../private/.env.server' });
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const session = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const issueRoutes = require('./routes/issues');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const locationRoutes = require('./routes/locations');
const userRoutes = require('./routes/users');
const settingRoutes = require('./routes/settings');
const departmentRoutes = require('./routes/departments');

const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Security: Helmet middleware for security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow image loading
    contentSecurityPolicy: false // Disable CSP for now to avoid conflicts with Vite
}));

// Security: CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow for development, restrict in production
        }
    },
    credentials: true
}));

// Security: Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Security: General rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Apply general rate limiting to all routes
app.use(generalLimiter);
if (process.env.VERCEL) {
    app.use('/uploads', express.static('/tmp'));
} else {
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes); // Stricter rate limit for auth
app.use('/api/issues', issueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/api/stats', async (req, res) => {
    try {
        const userId = req.query.userId;
        
        // If userId is provided, get user-specific stats, otherwise get global stats
        const whereClause = userId ? { userId: userId } : {};
        
        const totalIssues = await prisma.issue.count({ where: whereClause });
        const resolvedIssues = await prisma.issue.count({ where: { ...whereClause, status: 'resolved' } });
        const pendingIssues = await prisma.issue.count({ where: { ...whereClause, status: 'pending' } });
        
        res.json({
            totalIssues,
            resolvedIssues,
            pendingIssues
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

app.get('/', (req, res) => {
  res.send('E-City API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  // Custom errors
  if (err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error
  res.status(500).json({ error: 'Internal server error' });
});

// Only start listener when run directly (not when imported by serverless entry)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
