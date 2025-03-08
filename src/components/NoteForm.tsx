import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import './NoteForm.css';
import RichTextEditor from './RichTextEditor';

interface NoteFormProps {
  note?: Note | null; 
  onSave: (note: Note) => Promise<void>; 
  onClose: () => void; 
}

const NoteForm: React.FC<NoteFormProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [contentState, setContentState] = useState(note?.contentState || '');
  const [color, setColor] = useState(note?.color || 'default');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState(note?.category || '');
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setContentState(note.contentState || '');
      setColor(note.color || 'default');
      setTags(note.tags || []);
      setCategory(note.category || '');
      setPinned(note.pinned || false);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const noteData: Note = {
        id: note?.id || '', 
        title: title.trim(),
        content: content.trim(),
        contentState,
        color,
        tags,
        category,
        pinned,
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await onSave(noteData);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const categories = ['Work', 'Personal', 'Ideas', 'To-Do', 'Important'];

  const colors = [
    { name: 'Default', value: 'default' },
    { name: 'Red', value: 'red' },
    { name: 'Orange', value: 'orange' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Green', value: 'green' },
    { name: 'Blue', value: 'blue' },
    { name: 'Purple', value: 'purple' },
    { name: 'Pink', value: 'pink' }
  ];

  return (
    <div className="note-form-overlay">
      <div className={`note-form ${color}`}>
        <div className="form-header">
          <h2>{note ? 'Edit Note' : 'Create Note'}</h2>
          <button 
            type="button" 
            className="close-button"
            onClick={onClose}
            aria-label="Close form"
          >
            <i className="material-icons">close</i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <RichTextEditor
              value={content}
              contentState={contentState}
              onChange={(text, rawContentState) => {
                setContent(text);
                if (rawContentState) {
                  setContentState(rawContentState);
                }
              }}
              placeholder="Note content"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-selector">
              {colors.map((colorOption) => (
                <div 
                  key={colorOption.value}
                  className={`color-option ${colorOption.value} ${color === colorOption.value ? 'selected' : ''}`}
                  onClick={() => setColor(colorOption.value)}
                  title={colorOption.name}
                >
                  {color === colorOption.value && <i className="material-icons">check</i>}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input-container">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags and press Enter"
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                className="add-tag-button"
                disabled={!tagInput.trim()}
              >
                <i className="material-icons">add</i>
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="tags-container">
                {tags.map((tag) => (
                  <div key={tag} className="tag">
                    <span>#{tag}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag-button"
                    >
                      <i className="material-icons">close</i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group checkbox-group">
            <label htmlFor="pinned" className="checkbox-label">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <span>Pin this note</span>
            </label>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
