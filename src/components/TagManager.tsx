import React, { useState } from 'react';
import './TagManager.css';

interface TagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  tags, 
  onAddTag, 
  onDeleteTag 
}) => {
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setError('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTag('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTag.trim()) {
      setError('Tag name cannot be empty');
      return;
    }
    
    const tagLower = newTag.trim().toLowerCase();
    
    if (tags.includes(tagLower)) {
      setError('This tag already exists');
      return;
    }
    
    onAddTag(tagLower);
    setNewTag('');
    setIsAdding(false);
    setError('');
  };

  return (
    <div className="tag-manager">
      <div className="tag-manager-header">
        <h3>Manage Tags</h3>
        {!isAdding && (
          <button 
            className="add-button ripple" 
            onClick={handleAddClick}
            aria-label="Add new tag"
          >
            <i className="material-icons">add</i>
          </button>
        )}
      </div>
      
      {isAdding && (
        <form onSubmit={handleSubmit} className="add-tag-form">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name"
            autoFocus
          />
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancelAdd}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add
            </button>
          </div>
        </form>
      )}
      
      <div className="tags-list">
        {tags.length > 0 ? (
          tags.map(tag => (
            <div key={tag} className="tag-item">
              <div className="tag-info">
                <i className="material-icons">local_offer</i>
                <span>{tag}</span>
              </div>
              <button 
                className="delete-button ripple" 
                onClick={() => onDeleteTag(tag)}
                aria-label={`Delete ${tag} tag`}
              >
                <i className="material-icons">delete</i>
              </button>
            </div>
          ))
        ) : (
          <div className="empty-message">No tags yet</div>
        )}
      </div>
    </div>
  );
};

export default TagManager;
