const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// Get all notes for a user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ id: req.params.id, userId: req.user.id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const newNote = new Note({
      ...req.body,
      userId: req.user.id
    });
    
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = Date.now();
    
    const note = await Note.findOneAndUpdate(
      { id, userId: req.user.id },
      { $set: updates },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notes by tag
router.get('/tags/:tag', auth, async (req, res) => {
  try {
    const { tag } = req.params;
    const notes = await Note.find({ 
      userId: req.user.id,
      tags: tag 
    }).sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes by tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notes by category
router.get('/categories/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const notes = await Note.find({ 
      userId: req.user.id,
      category 
    }).sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
