const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateToken);

// Validation middleware
const validateCreateEvent = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').trim().isLength({ min: 3, max: 200 }).withMessage('Location must be 3-200 characters'),
  body('organizer').trim().isLength({ min: 2, max: 100 }).withMessage('Organizer must be 2-100 characters'),
  body('type').optional().isIn(['general', 'workshop', 'meeting', 'cleanup', 'festival']).withMessage('Invalid event type')
];

// Get all events
router.get('/', async (req, res) => {
  const userId = req.user.id || req.user.userId;
  console.log(`Fetching events for User ${userId}`);
  
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        participants: {
          where: { id: userId },
          select: { id: true }
        },
        _count: {
          select: { participants: true }
        }
      }
    });

    const formattedEvents = events.map(event => {
      const isJoined = event.participants.length > 0;
      console.log(`Event ${event.id}: isJoined=${isJoined} (participants found: ${event.participants.length})`);
      return {
        ...event,
        isJoined,
        participantCount: event._count.participants
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Join an event
router.post('/:id/join', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.userId;

  console.log(`User ${userId} (from token: ${JSON.stringify(req.user)}) attempting to join event ${id}`);

  if (!userId) {
    return res.status(400).json({ error: 'User ID not found in token' });
  }

  try {
    await prisma.event.update({
      where: { id: id },
      data: {
        participants: {
          connect: { id: userId }
        }
      }
    });
    console.log(`User ${userId} joined event ${id} successfully`);
    res.json({ message: 'Joined event successfully' });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Error joining event' });
  }
});

// Leave an event
router.post('/:id/leave', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.userId;

  try {
    await prisma.event.update({
      where: { id: id },
      data: {
        participants: {
          disconnect: { id: userId }
        }
      }
    });
    res.json({ message: 'Left event successfully' });
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ error: 'Error leaving event' });
  }
});

// Create event
router.post('/', validateCreateEvent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, description, date, location, organizer, type, imageUrl } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        organizer,
        type: type || 'general',
        imageUrl
      }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({ where: { id: id } });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

module.exports = router;
