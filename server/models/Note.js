const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  contentState: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#2c2c2c' // Default to dark theme color
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Note', NoteSchema);
