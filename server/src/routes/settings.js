const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateToken);

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching settings' });
  }
});

// Update setting
router.post('/', async (req, res) => {
  const { key, value, description } = req.body;
  try {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Error updating setting' });
  }
});

module.exports = router;
