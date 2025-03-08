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
      
      // Open tags if style is starting (in order)
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
      
      // Add the character (with HTML entity for special characters)
      if (char === '<') processedContent += '&lt;';
      else if (char === '>') processedContent += '&gt;';
      else if (char === '&') processedContent += '&amp;';
      else processedContent += char;
      
      // Update current styles
      currentStyles = newStyles;
    }
    
    // Close any remaining tags (in reverse order)
    if (currentStyles.code) {
      processedContent += '</code>';
    }
    if (currentStyles.underline) {
      processedContent += '</u>';
    }
    if (currentStyles.italic) {
      processedContent += '</em>';
    }
    if (currentStyles.bold) {
      processedContent += '</strong>';
    }
    
    // Handle different block types with proper HTML structure
    if (blockType === 'header-one') {
      html += `<h1>${processedContent}</h1>`;
    } else if (blockType === 'header-two') {
      html += `<h2>${processedContent}</h2>`;
    } else if (blockType === 'header-three') {
      html += `<h3>${processedContent}</h3>`;
    } else if (blockType === 'unordered-list-item') {
      if (!inUnorderedList) {
        html += '<ul>';
        inUnorderedList = true;
      }
      html += `<li>${processedContent}</li>`;
      
      // Check if we need to close the list
      if (blockIndex === blocks.length - 1 || (blockIndex + 1 < blocks.length && blocks[blockIndex + 1].getType() !== 'unordered-list-item')) {
        html += '</ul>';
        inUnorderedList = false;
      }
    } else if (blockType === 'ordered-list-item') {
      if (!inOrderedList) {
        html += '<ol>';
        inOrderedList = true;
      }
      html += `<li>${processedContent}</li>`;
      
      // Check if we need to close the list
      if (blockIndex === blocks.length - 1 || (blockIndex + 1 < blocks.length && blocks[blockIndex + 1].getType() !== 'ordered-list-item')) {
        html += '</ol>';
        inOrderedList = false;
      }
    } else if (blockType === 'code-block') {
      html += `<pre><code>${processedContent}</code></pre>`;
    } else if (blockType === 'blockquote') {
      html += `<blockquote>${processedContent}</blockquote>`;
    } else {
      // Default paragraph
      if (text.length === 0) {
        // Empty paragraph for spacing
        html += '<p>&nbsp;</p>';
      } else {
        html += `<p>${processedContent}</p>`;
      }
    }
  });
  
  return html;
};

interface NoteItemProps {
  note: Note;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit, onDelete, onPin }) => {
  const [isViewMode, setIsViewMode] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return 'work';
      case 'personal':
        return 'person';
      case 'ideas':
        return 'lightbulb';
      case 'todo':
        return 'check_circle';
      case 'important':
        return 'priority_high';
      default:
        return 'label';
    }
  };

  const toggleViewMode = () => {
    setIsViewMode(!isViewMode);
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    // Only toggle view mode if not clicking on action buttons
    if (!(e.target as HTMLElement).closest('.note-actions')) {
      toggleViewMode();
    }
  };

  const renderContent = () => {
    if (note.contentState) {
      try {
        const contentState = convertFromRaw(JSON.parse(note.contentState));
        const html = stateToHTML(contentState);
        return <div className={`note-content ${isViewMode ? 'expanded' : ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
      } catch (e) {
        console.error('Error parsing content state', e);
        return <div className={`note-content ${isViewMode ? 'expanded' : ''}`}>{note.content}</div>;
      }
    }
    return <div className={`note-content ${isViewMode ? 'expanded' : ''}`}>{note.content}</div>;
  };

  // Render the normal note card
  const renderNoteCard = () => (
    <div 
      className={`note-item ${note.pinned ? 'pinned' : ''}`} 
      style={{ backgroundColor: note.color || '#ffffff' }}
      onClick={handleNoteClick}
    >
      <div className="note-actions">
        <button 
          className="note-btn pin ripple" 
          onClick={(e) => {
            e.stopPropagation();
            onPin(note.id, !note.pinned);
          }} 
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
          title={note.pinned ? "Unpin note" : "Pin note"}
        >
          <i className="material-icons">{note.pinned ? 'push_pin' : 'push_pin'}</i>
        </button>
        <button 
          className="note-btn edit ripple" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(note.id);
          }} 
          aria-label="Edit note"
          title="Edit note"
        >
          <i className="material-icons">edit</i>
        </button>
        <button 
          className="note-btn delete ripple" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }} 
          aria-label="Delete note"
          title="Delete note"
        >
          <i className="material-icons">delete</i>
        </button>
      </div>
      {note.pinned && <div className="pin-indicator"><i className="material-icons">push_pin</i></div>}
      
      <div className="note-content-wrapper">
        <h3 className="note-title">{note.title}</h3>
        {renderContent()}
      </div>
      
      <div className="note-footer">
        {note.tags && note.tags.length > 0 && (
          <div className="note-tags">
            {note.tags.map((tag, index) => (
              <span key={index} className="note-tag">
                <i className="material-icons">local_offer</i>
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="note-metadata">
          {note.category && (
            <div className="note-category">
              <i className="material-icons">{getCategoryIcon(note.category)}</i>
              {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
            </div>
          )}
          <div className="note-date">
            <i className="material-icons">schedule</i>
            {formatDate(note.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the modal view
  const renderModalView = () => (
    <>
      <div className="note-overlay" onClick={toggleViewMode}></div>
      <div 
        className="note-item view-mode" 
        style={{ backgroundColor: note.color || '#ffffff' }}
      >
        <h3 className="note-title">{note.title}</h3>
        
        <div className="note-actions">
          <button 
            className="note-btn pin ripple" 
            onClick={(e) => {
              e.stopPropagation();
              onPin(note.id, !note.pinned);
            }} 
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            title={note.pinned ? "Unpin note" : "Pin note"}
          >
            <i className="material-icons">{note.pinned ? 'push_pin' : 'push_pin'}</i>
          </button>
          <button 
            className="note-btn edit ripple" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note.id);
            }} 
            aria-label="Edit note"
            title="Edit note"
          >
            <i className="material-icons">edit</i>
          </button>
          <button 
            className="note-btn delete ripple" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }} 
            aria-label="Delete note"
            title="Delete note"
          >
            <i className="material-icons">delete</i>
          </button>
          <button 
            className="note-btn close ripple" 
            onClick={(e) => {
              e.stopPropagation();
              setIsViewMode(false);
            }} 
            aria-label="Close view"
            title="Close view"
          >
            <i className="material-icons">close</i>
          </button>
        </div>
        
        <div className="note-content-wrapper">
          {renderContent()}
        </div>
        
        <div className="note-footer">
          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.map((tag, index) => (
                <span key={index} className="note-tag">
                  <i className="material-icons">local_offer</i>
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="note-metadata">
            {note.category && (
              <div className="note-category">
                <i className="material-icons">{getCategoryIcon(note.category)}</i>
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </div>
            )}
            <div className="note-date">
              <i className="material-icons">schedule</i>
              {formatDate(note.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return isViewMode ? renderModalView() : renderNoteCard();
};

export default NoteItem;
