const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateToken);

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Update user role
router.patch('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// Delete user (Ban/Remove)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id || req.user.userId;

  // Prevent admins from deleting themselves
  if (id === requestingUserId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  try {
    // Check if user exists
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Admin ${requestingUserId} is deleting user ${id} (${userToDelete.email})`);

    // Use transaction to ensure all related data is handled
    await prisma.$transaction(async (prisma) => {
      // 1. Delete all votes by this user
      await prisma.pollVote.deleteMany({ where: { userId: id } });

      // 2. Delete all comments by this user
      await prisma.comment.deleteMany({ where: { userId: id } });

      // 3. Unlink issues (keep the issue, but remove user association)
      await prisma.issue.updateMany({
        where: { userId: id },
        data: { userId: null }
      });

      // 4. Remove user from any events they joined
      const events = await prisma.event.findMany({
        where: { participantIds: { has: id } }
      });

      for (const event of events) {
        const updatedParticipants = event.participantIds.filter(pid => pid !== id);
        await prisma.event.update({
          where: { id: event.id },
          data: { participantIds: updatedParticipants }
        });
      }

      // 5. Finally delete the user
      await prisma.user.delete({ where: { id: id } });
    });

    console.log(`User ${id} (${userToDelete.email}) successfully deleted from database`);
    res.json({ message: 'User permanently deleted from database' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user', details: error.message });
  }
});

module.exports = router;
