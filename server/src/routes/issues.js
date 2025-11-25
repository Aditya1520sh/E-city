const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const authenticateToken = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Configure Multer for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Validation middleware
const validateCreateIssue = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location').trim().isLength({ min: 3, max: 200 }).withMessage('Location must be 3-200 characters')
];

const validateComment = [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
  body('userId').notEmpty().withMessage('User ID is required')
];

const validateStatusUpdate = [
  body('status').isIn(['pending', 'in-progress', 'resolved', 'rejected']).withMessage('Invalid status')
];

// Get all issues with filtering
router.get('/', async (req, res) => {
  const { category, status, search, userId } = req.query;

  let where = {};
  if (category && category !== 'all') where.category = category;
  if (status && status !== 'all') where.status = status;
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { contains: search } }
    ];
  }

  try {
    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        _count: {
          select: { comments: true }
        }
      }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching issues' });
  }
});

// Get single issue
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: id },
      include: {
        user: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching issue' });
  }
});

// Create a new issue with image
router.post('/', upload.single('image'), validateCreateIssue, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, description, category, location, userId } = req.body;
  let imageUrl = null;

  if (req.file) {
    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('CRITICAL: Cloudinary environment variables are not configured');
      return res.status(500).json({
        error: 'Image upload service is not configured. Please contact the administrator.'
      });
    }

    try {
      console.log('Uploading to Cloudinary...');
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result);
        });
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      imageUrl = uploadResult.secure_url;
      console.log('Cloudinary upload success:', imageUrl);
    } catch (err) {
      console.error('Cloudinary upload failed:', err.message, err);
      return res.status(500).json({
        error: 'Failed to upload image. Please try again or report the issue without an image.'
      });
    }
  }

  try {
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        location,
        imageUrl,
        userId: userId ? userId : null
      }
    });
    res.json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating issue' });
  }
});

// Update issue status
router.patch('/:id/status', validateStatusUpdate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { status, resolutionTime, resolutionRemarks, resolutionOfficer } = req.body;

  const data = { status };
  if (resolutionTime) data.resolutionTime = resolutionTime;
  if (resolutionRemarks) data.resolutionRemarks = resolutionRemarks;
  if (resolutionOfficer) data.resolutionOfficer = resolutionOfficer;

  try {
    const issue = await prisma.issue.update({
      where: { id: id },
      data
    });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Error updating issue' });
  }
});

// Upvote issue
router.post('/:id/upvote', async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await prisma.issue.update({
      where: { id: id },
      data: { upvotes: { increment: 1 } }
    });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Error upvoting issue' });
  }
});

// Add comment
router.post('/:id/comments', validateComment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { content, userId } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        issueId: id,
        userId: userId
      },
      include: { user: true }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Delete issue
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete comments first (cascade would be better in schema but this works)
    await prisma.comment.deleteMany({ where: { issueId: id } });
    await prisma.issue.delete({ where: { id: id } });
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting issue' });
  }
});

module.exports = router;
