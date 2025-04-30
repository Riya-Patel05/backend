console.log('[eventRoutes] – loading eventRoutes.js');
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Create Event
router.post('/create', eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.get('/', eventController.getAllEvents);

module.exports = router;

