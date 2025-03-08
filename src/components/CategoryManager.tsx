import React, { useState } from 'react';
import './CategoryManager.css';

interface CategoryManagerProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

const PREDEFINED_CATEGORIES = [
  { name: 'work', icon: 'work' },
  { name: 'personal', icon: 'person' },
  { name: 'ideas', icon: 'lightbulb' },
  { name: 'todo', icon: 'check_circle' },
  { name: 'important', icon: 'priority_high' }
];

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setError('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewCategory('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    
    const categoryLower = newCategory.trim().toLowerCase();
    
    if (categories.includes(categoryLower)) {
      setError('This category already exists');
      return;
    }
    
    onAddCategory(categoryLower);
    setNewCategory('');
    setIsAdding(false);
    setError('');
  };

  const getCategoryIcon = (category: string) => {
    const predefined = PREDEFINED_CATEGORIES.find(c => c.name === category);
    return predefined ? predefined.icon : 'label';
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <h3>Manage Categories</h3>
        {!isAdding && (
          <button 
            className="add-button ripple" 
            onClick={handleAddClick}
            aria-label="Add new category"
          >
            <i className="material-icons">add</i>
          </button>
        )}
      </div>
      
      {isAdding && (
        <form onSubmit={handleSubmit} className="add-category-form">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
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
      
      <div className="categories-list">
        {categories.length > 0 ? (
          categories.map(category => (
            <div key={category} className="category-item">
              <div className="category-info">
                <i className="material-icons">{getCategoryIcon(category)}</i>
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </div>
              <button 
                className="delete-button ripple" 
                onClick={() => onDeleteCategory(category)}
                aria-label={`Delete ${category} category`}
              >
                <i className="material-icons">delete</i>
              </button>
            </div>
          ))
        ) : (
          <div className="empty-message">No categories yet</div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
