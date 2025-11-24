const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateToken);

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching locations' });
  }
});

// Create location
router.post('/', async (req, res) => {
  const { name, type, latitude, longitude, address, contact, imageUrl } = req.body;
  try {
    const location = await prisma.location.create({
      data: {
        name,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        contact,
        imageUrl
      }
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Error creating location' });
  }
});

// Delete location
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.location.delete({ where: { id: id } });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting location' });
  }
});

module.exports = router;
