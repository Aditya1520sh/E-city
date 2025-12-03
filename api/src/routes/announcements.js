const express = require('express');
const authenticateToken = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');

const router = express.Router();

router.use(authenticateToken);

// Validation middleware
const validateCreateAnnouncement = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('content').trim().isLength({ min: 10, max: 1000 }).withMessage('Content must be 10-1000 characters'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
];

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching announcements' });
  }
});

// Create announcement
router.post('/', validateCreateAnnouncement, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, content, priority } = req.body;
  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority
      }
    });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Error creating announcement' });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
        await prisma.announcement.delete({ where: { id: id } });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting announcement' });
  }
});

module.exports = router;
