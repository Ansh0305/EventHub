const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');

const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const eventData = { ...req.body, creator: req.user.id, attendeeCount: 0 };
    if (req.file) { eventData.image = req.file.path; eventData.imagePublicId = req.file.filename; }
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create event' }); }
};

const getEvents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query = { date: { $gte: new Date() } };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }];
    if (category && category !== 'all') query.category = category;
    const events = await Event.find(query).populate('creator', 'name avatar').sort({ date: 1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Event.countDocuments(query);
    res.json({ success: true, events, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch events' }); }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('creator', 'name email avatar').populate('attendees', 'name avatar');
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, event });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch event' }); }
};

const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.creator.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });
    const updateData = { ...req.body };
    if (req.file) {
      if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }
    event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('creator', 'name email avatar').populate('attendees', 'name avatar');
    res.json({ success: true, event });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update event' }); }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.creator.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });
    if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete event' }); }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user.id }).populate('creator', 'name avatar').sort({ date: -1 });
    res.json({ success: true, events });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch events' }); }
};

const getAttendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.id }).populate('creator', 'name avatar').sort({ date: 1 });
    res.json({ success: true, events });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch events' }); }
};

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getMyEvents, getAttendingEvents };
