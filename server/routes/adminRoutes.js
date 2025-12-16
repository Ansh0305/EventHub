const express = require('express');
const { getStats, getAllUsers, getAllEvents, deleteUser, deleteEventAdmin, updateUserRole } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.get('/events', getAllEvents);
router.delete('/events/:id', deleteEventAdmin);

module.exports = router;
