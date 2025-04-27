const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware'); // Your existing auth middleware

// Event routes
router.post('/events', protect, eventController.createEvent);
router.get('/events', protect, eventController.getUserEvents);

// Task routes
router.post('/events/:eventId/tasks', protect, eventController.addTaskToEvent);
router.get('/events/:eventId/tasks', protect, eventController.getTasksOfEvent);

module.exports = router;
