const express = require('express');
const authenticateToken = require('../middleware/auth');
const prisma = require('../config/prisma');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get analytics overview
router.get('/overview', async (req, res) => {
  try {
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      rejectedIssues,
      totalUsers,
      totalDepartments,
      recentIssues
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'pending' } }),
      prisma.issue.count({ where: { status: 'in-progress' } }),
      prisma.issue.count({ where: { status: 'resolved' } }),
      prisma.issue.count({ where: { status: 'rejected' } }),
      prisma.user.count(),
      prisma.department.count(),
      prisma.issue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      })
    ]);

    res.json({
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      rejectedIssues,
      totalUsers,
      totalDepartments,
      resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0,
      recentIssues
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Error fetching analytics overview' });
  }
});

// Get issues by category
router.get('/by-category', async (req, res) => {
  try {
    const issues = await prisma.issue.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const data = issues.map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item._count.category
    }));

    res.json(data);
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ error: 'Error fetching category data' });
  }
});

// Get issues by status over time (last 30 days)
router.get('/status-trend', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issues = await prisma.issue.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Group by date
    const dateMap = {};
    issues.forEach(issue => {
      const date = new Date(issue.createdAt).toLocaleDateString();
      if (!dateMap[date]) {
        dateMap[date] = { pending: 0, 'in-progress': 0, resolved: 0, rejected: 0 };
      }
      dateMap[date][issue.status]++;
    });

    const data = Object.keys(dateMap).map(date => ({
      date,
      ...dateMap[date]
    }));

    res.json(data);
  } catch (error) {
    console.error('Status trend error:', error);
    res.status(500).json({ error: 'Error fetching status trend' });
  }
});

// Get average resolution time by category
router.get('/resolution-time', async (req, res) => {
  try {
    const resolvedIssues = await prisma.issue.findMany({
      where: {
        status: 'resolved',
        resolutionTime: { not: null }
      },
      select: {
        category: true,
        createdAt: true,
        resolutionTime: true
      }
    });

    const categoryData = {};
    
    resolvedIssues.forEach(issue => {
      const resolutionTimeHours = (new Date(issue.resolutionTime) - new Date(issue.createdAt)) / (1000 * 60 * 60);
      
      if (!categoryData[issue.category]) {
        categoryData[issue.category] = { total: 0, count: 0 };
      }
      categoryData[issue.category].total += resolutionTimeHours;
      categoryData[issue.category].count++;
    });

    const data = Object.keys(categoryData).map(category => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      avgHours: (categoryData[category].total / categoryData[category].count).toFixed(1)
    }));

    res.json(data);
  } catch (error) {
    console.error('Resolution time error:', error);
    res.status(500).json({ error: 'Error fetching resolution time data' });
  }
});

// Get department performance
router.get('/department-performance', async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      where: {
        assignedDepartment: { not: null }
      },
      select: {
        assignedDepartment: true,
        status: true
      }
    });

    const deptData = {};
    
    issues.forEach(issue => {
      const dept = issue.assignedDepartment;
      if (!deptData[dept]) {
        deptData[dept] = { total: 0, resolved: 0, pending: 0, inProgress: 0 };
      }
      deptData[dept].total++;
      if (issue.status === 'resolved') deptData[dept].resolved++;
      if (issue.status === 'pending') deptData[dept].pending++;
      if (issue.status === 'in-progress') deptData[dept].inProgress++;
    });

    const data = Object.keys(deptData).map(dept => ({
      department: dept,
      total: deptData[dept].total,
      resolved: deptData[dept].resolved,
      pending: deptData[dept].pending,
      inProgress: deptData[dept].inProgress,
      resolutionRate: deptData[dept].total > 0 ? 
        ((deptData[dept].resolved / deptData[dept].total) * 100).toFixed(1) : 0
    }));

    res.json(data);
  } catch (error) {
    console.error('Department performance error:', error);
    res.status(500).json({ error: 'Error fetching department performance' });
  }
});

const { getExternalApi } = require('../config/externalApi');

// External stats via server env-configured API (optional)
router.get('/stats', async (req, res) => {
  try {
    const api = getExternalApi();
    const { data } = await api.get('/stats');
    res.json(data);
  } catch (err) {
    console.error('Analytics stats error:', err?.message || err);
    // Return empty stats if external API not configured
    if (err.message?.includes('Missing API_BASE_URL')) {
      return res.json({ message: 'External API not configured', data: {} });
    }
    const status = err?.response?.status || 500;
    res.status(status).json({ error: 'Failed to fetch external stats' });
  }
});

module.exports = router;
