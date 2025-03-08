import React, { useState } from 'react';
import { Note } from '../types';
import './NoteItem.css';
import { convertFromRaw, EditorState, ContentState } from 'draft-js';

// Enhanced implementation of stateToHTML to properly handle rich text formatting
const stateToHTML = (contentState: ContentState): string => {
  // Process each block with proper HTML structure
  const blocks = contentState.getBlocksAsArray();
  let html = '';
  
  // Track list items to properly group them
  let inUnorderedList = false;
  let inOrderedList = false;
  
  // Process each block
  blocks.forEach((block, blockIndex) => {
    const text = block.getText();
    const blockType = block.getType();
    const charList = block.getCharacterList();
    
    // Process the text with inline styles
    let processedContent = '';
    let currentStyles: { bold: boolean; italic: boolean; underline: boolean; code: boolean } = { 
      bold: false, 
      italic: false, 
      underline: false,
      code: false
    };
    
    // Process each character with its styles
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const styles = charList.get(i).getStyle();
      
      // Check for style changes
      const newStyles = {
        bold: styles.has('BOLD'),
        italic: styles.has('ITALIC'),
        underline: styles.has('UNDERLINE'),
        code: styles.has('CODE')
      };
      
      // Close tags if style is ending (in reverse order of opening)
      if (currentStyles.code && !newStyles.code) {
        processedContent += '</code>';
      }
      if (currentStyles.underline && !newStyles.underline) {
        processedContent += '</u>';
      }
      if (currentStyles.italic && !newStyles.italic) {
        processedContent += '</em>';
      }
      if (currentStyles.bold && !newStyles.bold) {
        processedContent += '</strong>';
      }
      
      // Open tags if style is starting
      if (!currentStyles.bold && newStyles.bold) {
        processedContent += '<strong>';
      }
      if (!currentStyles.italic && newStyles.italic) {
        processedContent += '<em>';
      }
      if (!currentStyles.underline && newStyles.underline) {
        processedContent += '<u>';
      }
      if (!currentStyles.code && newStyles.code) {
        processedContent += '<code>';
      }
      
      // Add the character
      processedContent += char;
      
      // Update current styles
      currentStyles = newStyles;
    }
    
    // Close any remaining tags
    if (currentStyles.code) processedContent += '</code>';
    if (currentStyles.underline) processedContent += '</u>';
    if (currentStyles.italic) processedContent += '</em>';
    if (currentStyles.bold) processedContent += '</strong>';
    
    // Handle block types
    if (blockType === 'unstyled') {
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }
      html += `<p>${processedContent}</p>`;
    } else if (blockType === 'header-one') {
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }
      html += `<h1>${processedContent}</h1>`;
    } else if (blockType === 'header-two') {
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }
      html += `<h2>${processedContent}</h2>`;
    } else if (blockType === 'blockquote') {
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }
      html += `<blockquote>${processedContent}</blockquote>`;
    } else if (blockType === 'unordered-list-item') {
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        html += '<ul>';
        inUnorderedList = true;
      }
      html += `<li>${processedContent}</li>`;
    } else if (blockType === 'ordered-list-item') {
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        html += '<ol>';
        inOrderedList = true;
      }
      html += `<li>${processedContent}</li>`;
    } else {
      html += `<p>${processedContent}</p>`;
    }
  });
  
  // Close any open lists
  if (inUnorderedList) {
    html += '</ul>';
  }
  if (inOrderedList) {
    html += '</ol>';
  }
  
  return html;
};

interface NoteItemProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit, onDelete, onPin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Parse the content if it's in raw format
  const getContentPreview = () => {
    try {
      if (typeof note.content === 'string') {
        // Plain text content
        return note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '');
      } else if (note.content && typeof note.content === 'object') {
        // Draft.js raw content
        const contentState = convertFromRaw(note.content);
        const editorState = EditorState.createWithContent(contentState);
        const plainText = editorState.getCurrentContent().getPlainText();
        return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      }
      return '';
    } catch (error) {
      console.error('Error parsing note content:', error);
      return 'Error displaying content';
    }
  };

  // Format the date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleEdit = () => {
    onEdit(note);
  };

  const handleDelete = () => {
    onDelete(note.id);
  };

  const handlePin = () => {
    if (onPin) { 
      onPin(note.id);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // Get HTML content for rendering
  const getHtmlContent = () => {
    try {
      if (typeof note.content === 'string') {
        // Plain text content, wrap in paragraph tags
        return `<p>${note.content.replace(/\n/g, '<br>')}</p>`;
      } else if (note.content && typeof note.content === 'object') {
        // Draft.js raw content
        const contentState = convertFromRaw(note.content);
        return stateToHTML(contentState);
      }
      return '';
    } catch (error) {
      console.error('Error parsing note content for HTML:', error);
      return '<p>Error displaying content</p>';
    }
  };

  return (
    <div 
      className={`note-item ${note.color || 'default'} ${isExpanded ? 'expanded' : ''} ${note.pinned ? 'pinned' : ''}`}
      onClick={toggleExpand}
    >
      {note.pinned && (
        <div className="pin-indicator">
          <i className="material-icons">push_pin</i>
        </div>
      )}
      
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button 
            className="note-action-button options-button" 
            onClick={toggleOptions}
            aria-label="Note options"
          >
            <i className="material-icons">more_vert</i>
          </button>
          
          {showOptions && (
            <div className="note-options-menu">
              <button onClick={handleEdit}>
                <i className="material-icons">edit</i> Edit
              </button>
              {onPin && ( 
                <button onClick={handlePin}>
                  <i className="material-icons">{note.pinned ? 'push_pin' : 'push_pin'}</i> 
                  {note.pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              <button onClick={handleDelete}>
                <i className="material-icons">delete</i> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {note.category && (
        <div className="note-category">
          <i className="material-icons">
            {note.category === 'Work' ? 'work' : 
             note.category === 'Personal' ? 'person' : 
             note.category === 'Ideas' ? 'lightbulb' : 
             note.category === 'To-Do' ? 'check_circle' : 
             note.category === 'Important' ? 'priority_high' : 'label'}
          </i>
          <span>{note.category}</span>
        </div>
      )}
      
      <div className="note-content">
        {isExpanded ? (
          <div 
            className="note-full-content"
            dangerouslySetInnerHTML={{ __html: getHtmlContent() }}
          />
        ) : (
          <p className="note-preview">{getContentPreview()}</p>
        )}
      </div>
      
      <div className="note-footer">
        <div className="note-date">
          {formatDate(note.updatedAt)}
        </div>
        
        {note.tags && note.tags.length > 0 && (
          <div className="note-tags">
            {note.tags.map((tag, index) => (
              <span key={index} className="note-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteItem;
