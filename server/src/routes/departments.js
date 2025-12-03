const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateToken);

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching departments' });
  }
});

// Create department
router.post('/', async (req, res) => {
  const { name, head, contact, email, location, description, imageUrl } = req.body;
  try {
    const department = await prisma.department.create({
      data: { name, head, contact, email, location, description, imageUrl }
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Error creating department' });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, head, contact, email, location, description, imageUrl } = req.body;
  try {
    const department = await prisma.department.update({
      where: { id: id },
      data: { name, head, contact, email, location, description, imageUrl }
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Error updating department' });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.department.delete({
      where: { id: id }
    });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting department' });
  }
});

module.exports = router;
