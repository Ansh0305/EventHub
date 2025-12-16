const User = require('../models/User');
const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, upcomingEvents, pastEvents] = await Promise.all([
      User.countDocuments(), Event.countDocuments(),
      Event.countDocuments({ date: { $gte: new Date() } }), Event.countDocuments({ date: { $lt: new Date() } })
    ]);
    const events = await Event.find();
    const totalRsvps = events.reduce((sum, e) => sum + e.attendeeCount, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentSignups, recentEvents] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: weekAgo } }), Event.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);
    res.json({ success: true, stats: { totalUsers, totalEvents, upcomingEvents, pastEvents, totalRsvps, recentSignups, recentEvents } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch stats' }); }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch users' }); }
};

const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }] } : {};
    const [events, total] = await Promise.all([
      Event.find(query).populate('creator', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);
    res.json({ success: true, events, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch events' }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    const userEvents = await Event.find({ creator: user._id });
    for (const event of userEvents) if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
    await Event.deleteMany({ creator: user._id });
    await Event.updateMany({ attendees: user._id }, { $pull: { attendees: user._id }, $inc: { attendeeCount: -1 } });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete user' }); }
};

const deleteEventAdmin = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete event' }); }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ success: false, error: 'Invalid role' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user._id.toString() === req.user.id && role !== 'admin') return res.status(400).json({ success: false, error: 'Cannot remove own admin role' });
    user.role = role;
    await user.save();
    res.json({ success: true, message: `Role updated to ${role}`, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update role' }); }
};

module.exports = { getStats, getAllUsers, getAllEvents, deleteUser, deleteEventAdmin, updateUserRole };
