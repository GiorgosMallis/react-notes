import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import './NoteForm.css';
import RichTextEditor from './RichTextEditor';

interface NoteFormProps {
  note?: Note;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [contentState, setContentState] = useState(note?.contentState || '');
  const [color, setColor] = useState(note?.color || '#ffffff');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState(note?.category || '');
  const [pinned, setPinned] = useState(note?.pinned || false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setContentState(note.contentState || '');
      setColor(note.color || '#ffffff');
      setTags(note.tags || []);
      setCategory(note.category || '');
      setPinned(note.pinned || false);
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      contentState,
      color,
      tags,
      category,
      pinned
    });
    
    // Reset form
    setTitle('');
    setContent('');
    setContentState('');
    setColor('#ffffff');
    setTags([]);
    setTagInput('');
    setCategory('');
    setPinned(false);
  };

  const handleContentChange = (text: string, rawContentState?: string) => {
    setContent(text);
    if (rawContentState) {
      setContentState(rawContentState);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const colorOptions = [
    { value: '#ffffff', label: 'White' },
    { value: '#f8d7da', label: 'Light Red' },
    { value: '#d1e7dd', label: 'Light Green' },
    { value: '#cfe2ff', label: 'Light Blue' },
    { value: '#fff3cd', label: 'Light Yellow' },
  ];

  const categoryOptions = [
    { value: '', label: 'No Category', icon: 'label_off' },
    { value: 'work', label: 'Work', icon: 'work' },
    { value: 'personal', label: 'Personal', icon: 'person' },
    { value: 'ideas', label: 'Ideas', icon: 'lightbulb' },
    { value: 'todo', label: 'To-Do', icon: 'check_box' },
    { value: 'important', label: 'Important', icon: 'star' },
  ];

  return (
    <div className="note-form-overlay">
      <div className="note-form-container">
        <form className="note-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2 className="form-title">{note ? 'Edit Note' : 'Create Note'}</h2>
            <button type="button" className="close-btn" onClick={onCancel}>
              <i className="material-icons">close</i>
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <RichTextEditor
              value={content}
              contentState={contentState}
              onChange={handleContentChange}
              placeholder="Enter note content"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-selector">
              {categoryOptions.map((option) => (
                <div 
                  key={option.value} 
                  className={`category-option ${category === option.value ? 'selected' : ''}`}
                  onClick={() => setCategory(option.value)}
                >
                  <i className="material-icons">{option.icon}</i>
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input-container">
              <div className="tags-input-wrapper">
                <input
                  type="text"
                  id="tags"
                  className="form-control tags-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags (press Enter to add)"
                />
                <button 
                  type="button" 
                  className="add-tag-btn"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <i className="material-icons">add</i>
                </button>
              </div>
            </div>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <span className="tag-text">{tag}</span>
                  <button 
                    type="button" 
                    className="remove-tag-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <i className="material-icons">close</i>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="color">Note Color</label>
            <div className="color-selector">
              {colorOptions.map((option) => (
                <div 
                  key={option.value} 
                  className={`color-option ${color === option.value ? 'selected' : ''}`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setColor(option.value)}
                  title={option.label}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="pin-checkbox">Pin this note</label>
            <div className="pin-checkbox-container">
              <label>
                <input 
                  type="checkbox" 
                  id="pin-checkbox"
                  checked={pinned} 
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <i className="material-icons">push_pin</i>
                Pin to top
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {note ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
