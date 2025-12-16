const mongoose = require('mongoose');
const Event = require('../models/Event');

const joinEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    const eventCheck = await Event.findById(eventId).session(session);
    if (!eventCheck) { await session.abortTransaction(); return res.status(404).json({ success: false, error: 'Event not found' }); }
    if (new Date(eventCheck.date) < new Date()) { await session.abortTransaction(); return res.status(400).json({ success: false, error: 'Cannot join past events' }); }
    if (eventCheck.creator.toString() === userId) { await session.abortTransaction(); return res.status(400).json({ success: false, error: 'Creators cannot RSVP to their own events' }); }

    const event = await Event.findOneAndUpdate(
      { _id: eventId, attendeeCount: { $lt: eventCheck.capacity }, attendees: { $ne: userId } },
      { $push: { attendees: userId }, $inc: { attendeeCount: 1 } },
      { new: true, session }
    ).populate('creator', 'name email avatar').populate('attendees', 'name avatar');

    if (!event) { await session.abortTransaction(); return res.status(400).json({ success: false, error: 'Event is full or already joined' }); }
    await session.commitTransaction();
    res.json({ success: true, message: 'Joined successfully', event });
  } catch (error) { await session.abortTransaction(); res.status(500).json({ success: false, error: 'Failed to join event' }); }
  finally { session.endSession(); }
};

const leaveEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, attendees: req.user.id },
      { $pull: { attendees: req.user.id }, $inc: { attendeeCount: -1 } },
      { new: true, session }
    ).populate('creator', 'name email avatar').populate('attendees', 'name avatar');

    if (!event) { await session.abortTransaction(); return res.status(400).json({ success: false, error: 'Not attending this event' }); }
    await session.commitTransaction();
    res.json({ success: true, message: 'Left event successfully', event });
  } catch (error) { await session.abortTransaction(); res.status(500).json({ success: false, error: 'Failed to leave event' }); }
  finally { session.endSession(); }
};

const getRsvpStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, isAttending: event.attendees.includes(req.user.id), isCreator: event.creator.toString() === req.user.id });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to get RSVP status' }); }
};

module.exports = { joinEvent, leaveEvent, getRsvpStatus };
