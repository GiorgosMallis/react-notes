import React, { useState, useEffect } from 'react';
import { 
  Editor, 
  EditorState, 
  RichUtils, 
  ContentState, 
  convertToRaw, 
  convertFromRaw 
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (text: string, rawContentState?: string) => void;
  contentState?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  contentState,
  placeholder 
}) => {
  // Initialize editor state from contentState if available, otherwise from plain text
  const [editorState, setEditorState] = useState(() => {
    if (contentState) {
      try {
        const rawContent = JSON.parse(contentState);
        return EditorState.createWithContent(convertFromRaw(rawContent));
      } catch (e) {
        console.error('Error parsing content state', e);
      }
    }
    
    return EditorState.createWithContent(ContentState.createFromText(value || ''));
  });

  // Update the editor when the value prop changes from outside
  useEffect(() => {
    if (!contentState && value !== editorState.getCurrentContent().getPlainText()) {
      setEditorState(EditorState.createWithContent(ContentState.createFromText(value || '')));
    }
  }, [value, contentState, editorState]);

  // Handle changes to the editor state
  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    
    // Get plain text for backward compatibility
    const plainText = state.getCurrentContent().getPlainText();
    
    // Get raw content state for rich text storage
    const rawContentState = JSON.stringify(convertToRaw(state.getCurrentContent()));
    
    onChange(plainText, rawContentState);
  };

  // Handle keyboard commands
  const handleKeyCommand = (command: string, state: EditorState) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Apply inline styles
  const applyInlineStyle = (style: string) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Apply block styles
  const applyBlockStyle = (blockType: string) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Check if a style is currently active
  const isStyleActive = (style: string, type: 'inline' | 'block') => {
    if (type === 'inline') {
      return editorState.getCurrentInlineStyle().has(style);
    } else {
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      return blockType === style;
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="formatting-toolbar">
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('BOLD', 'inline') ? 'active' : ''}`}
          onClick={() => applyInlineStyle('BOLD')}
          title="Bold"
        >
          <i className="material-icons">format_bold</i>
        </button>
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('ITALIC', 'inline') ? 'active' : ''}`}
          onClick={() => applyInlineStyle('ITALIC')}
          title="Italic"
        >
          <i className="material-icons">format_italic</i>
        </button>
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('UNDERLINE', 'inline') ? 'active' : ''}`}
          onClick={() => applyInlineStyle('UNDERLINE')}
          title="Underline"
        >
          <i className="material-icons">format_underlined</i>
        </button>
        <span className="toolbar-divider"></span>
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('header-one', 'block') ? 'active' : ''}`}
          onClick={() => applyBlockStyle('header-one')}
          title="Heading 1"
        >
          <i className="material-icons">title</i>
        </button>
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('header-two', 'block') ? 'active' : ''}`}
          onClick={() => applyBlockStyle('header-two')}
          title="Heading 2"
        >
          <i className="material-icons">format_size</i>
        </button>
        <span className="toolbar-divider"></span>
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('unordered-list-item', 'block') ? 'active' : ''}`}
          onClick={() => applyBlockStyle('unordered-list-item')}
          title="Bullet List"
        >
          <i className="material-icons">format_list_bulleted</i>
        </button>
        <button 
          type="button"
          className={`toolbar-button ${isStyleActive('ordered-list-item', 'block') ? 'active' : ''}`}
          onClick={() => applyBlockStyle('ordered-list-item')}
          title="Numbered List"
        >
          <i className="material-icons">format_list_numbered</i>
        </button>
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder={placeholder || "Enter note content..."}
          spellCheck={true}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
