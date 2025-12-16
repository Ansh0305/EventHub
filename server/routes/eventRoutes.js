const express = require('express');
const { body } = require('express-validator');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getMyEvents, getAttendingEvents } = require('../controllers/eventController');
const { joinEvent, leaveEvent, getRsvpStatus } = require('../controllers/rsvpController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('date').notEmpty().withMessage('Date required'),
  body('time').notEmpty().withMessage('Time required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity min 1'),
];

router.get('/', optionalAuth, getEvents);
router.get('/user/my-events', protect, getMyEvents);
router.get('/user/attending', protect, getAttendingEvents);
router.get('/:id', optionalAuth, getEvent);
router.post('/', protect, upload.single('image'), eventValidation, createEvent);
router.put('/:id', protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);
router.get('/:id/rsvp-status', protect, getRsvpStatus);

module.exports = router;
