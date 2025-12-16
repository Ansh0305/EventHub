const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true, maxlength: 200 },
  capacity: { type: Number, required: true, min: 1 },
  category: { type: String, enum: ['conference', 'workshop', 'meetup', 'social', 'sports', 'music', 'other'], default: 'meetup' },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attendeeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

eventSchema.virtual('isFull').get(function () { return this.attendeeCount >= this.capacity; });
eventSchema.virtual('availableSpots').get(function () { return Math.max(0, this.capacity - this.attendeeCount); });
eventSchema.index({ date: 1 });
eventSchema.index({ creator: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
