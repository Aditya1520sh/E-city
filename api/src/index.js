const express = require('express');
const path = require('path');
const fs = require('fs');

// Load environment variables
// In Vercel, environment variables are injected automatically
if (!process.env.VERCEL_ENV) {
    const serverEnv = path.join(__dirname, '../.env');
    if (fs.existsSync(serverEnv)) {
        require('dotenv').config({ path: serverEnv });
    } else {
        require('dotenv').config();
    }
}

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const session = require('express-session');
const passport = require('passport');

// Use shared Prisma instance
const prisma = require('./config/prisma');
const issueRoutes = require('./routes/issues');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const locationRoutes = require('./routes/locations');
const userRoutes = require('./routes/users');
const settingRoutes = require('./routes/settings');
const departmentRoutes = require('./routes/departments');
const uploadRoutes = require('./routes/uploadRoutes');
const { startEventScheduler } = require('./services/eventScheduler');

// path is already required above

const app = express();
const PORT = process.env.PORT || 3000;

// Start the event scheduler (checks every 24 hours)
// Disable in serverless environments like Vercel
if (!process.env.VERCEL_ENV) {
    startEventScheduler(24);
}

// Security: Helmet middleware for security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow image loading
    contentSecurityPolicy: false // Disable CSP for now to avoid conflicts with Vite
}));

// Security: CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow all Vercel preview/production deployments
        if (origin?.endsWith('.vercel.app')) {
            callback(null, true);
        } else if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // In production, reject unauthorized origins for security
            if (process.env.NODE_ENV === 'production') {
                console.warn(`CORS: Rejected request from unauthorized origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            } else {
                // Allow in development for easier testing
                console.log(`CORS: Allowing origin: ${origin}`);
                callback(null, true);
            }
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
    max: 500, // Limit each IP to 500 requests per windowMs (increased for development)
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for Passport
if (!process.env.VERCEL_ENV) {
    const SESSION_SECRET = process.env.SESSION_SECRET;
    if (!SESSION_SECRET) {
        console.warn('WARNING: SESSION_SECRET environment variable missing - sessions disabled');
    } else {
        app.use(session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: process.env.NODE_ENV === 'production' }
        }));
        // Initialize Passport with session support
        app.use(passport.initialize());
        app.use(passport.session());
    }
} else {
    // Serverless (Vercel) - use passport without sessions
    app.use(passport.initialize());
}

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: {
            hasDatabase: !!process.env.DATABASE_URL,
            hasJWT: !!process.env.JWT_SECRET,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

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
app.use('/upload', uploadRoutes);

// Health endpoint with MongoDB ping
app.get('/api/health', async (req, res) => {
    try {
        // For MongoDB, Prisma supports $runCommandRaw
        const ping = await prisma.$runCommandRaw({ ping: 1 });
        res.json({ ok: true, uptime: process.uptime(), db: ping?.ok === 1 ? 'up' : 'unknown' });
    } catch (err) {
        res.status(503).json({ ok: false, uptime: process.uptime(), error: err.message });
    }
});

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
