import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import { Note } from './types';
import NoteItem from './components/NoteItem';
import NoteForm from './components/NoteForm';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'color' | 'category' | 'tag' | 'date'>('all');
  const [sidebarOverlayActive, setSidebarOverlayActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(false);

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // Convert string dates back to Date objects and ensure all notes have required properties
        const notesWithDates = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          tags: note.tags || [],
          pinned: note.pinned !== undefined ? note.pinned : false
        }));
        setNotes(notesWithDates);
        setSaveStatus('saved');
        setSaveMessage('Notes loaded successfully');
      } catch (error) {
        console.error('Error parsing saved notes:', error);
        setSaveStatus('error');
        setSaveMessage('Error loading notes from storage');
      }
    }

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Handle window resize to detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // If transitioning to desktop, open sidebar
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        // If transitioning to mobile, close sidebar
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      try {
        setSaveStatus('saving');
        localStorage.setItem('notes', JSON.stringify(notes));
        setSaveStatus('saved');
        setSaveMessage('All changes saved');
        
        // Reset the message after 3 seconds
        const timer = setTimeout(() => {
          setSaveStatus('idle');
          setSaveMessage('');
        }, 3000);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error saving notes to localStorage:', error);
        setSaveStatus('error');
        setSaveMessage('Error saving notes to storage');
      }
    }
  }, [notes]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update the data-theme attribute on the root element
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    // Only toggle on mobile
    if (isMobile) {
      const newSidebarOpen = !sidebarOpen;
      setSidebarOpen(newSidebarOpen);
      setSidebarOverlayActive(newSidebarOpen); // Only active when sidebar is open
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (id: string) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setIsFormOpen(true);
    }
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      // Update existing note
      const updatedNote: Note = {
        ...editingNote,
        ...noteData,
        updatedAt: new Date()
      };
      
      setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
      setEditingNote(null);
    } else {
      // Create new note
      const newNote: Note = {
        id: uuidv4(),
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setNotes([newNote, ...notes]);
    }
    
    setIsFormOpen(false);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handlePinNote = (id: string, pinned: boolean) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, pinned, updatedAt: new Date() } 
        : note
    );
    
    setNotes(updatedNotes);
    
    // Save to localStorage
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    setSaveStatus('saved');
    setSaveMessage(pinned ? 'Note pinned successfully' : 'Note unpinned successfully');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSaveStatus('idle');
      setSaveMessage('');
    }, 3000);
  };

  const handleFilterChange = (filter: string, type: 'all' | 'color' | 'category' | 'tag' | 'date' = 'color') => {
    setActiveFilter(filter);
    setFilterType(type);
    setSearchTerm('');
    
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarOverlayActive(false);
    }
  };

  // Get all unique tags from notes
  const getAllTags = (): string[] => {
    const allTags = notes.reduce((tags: string[], note) => {
      if (note.tags && note.tags.length > 0) {
        return [...tags, ...note.tags];
      }
      return tags;
    }, []);
    
    // Remove duplicates using filter instead of Set
    return allTags.filter((tag, index, self) => 
      self.indexOf(tag) === index
    );
  };

  // Get all unique categories from notes
  const getAllCategories = (): string[] => {
    const allCategories = notes
      .map(note => note.category)
      .filter((category): category is string => !!category);
    
    // Remove duplicates using filter instead of Set
    return allCategories.filter((category, index, self) => 
      self.indexOf(category) === index
    );
  };

  // Filter and sort notes based on search term, filter, and pin status
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Show all notes when no filter is applied
      if (filterType === 'all' && activeFilter === 'all') {
        return matchesSearch;
      }
      
      // Filter by color
      if (filterType === 'color') {
        if (activeFilter === 'white' && note.color === '#ffffff') return matchesSearch;
        if (activeFilter === 'red' && note.color === '#f8d7da') return matchesSearch;
        if (activeFilter === 'green' && note.color === '#d1e7dd') return matchesSearch;
        if (activeFilter === 'blue' && note.color === '#cfe2ff') return matchesSearch;
        if (activeFilter === 'yellow' && note.color === '#fff3cd') return matchesSearch;
      }
      
      // Filter by category
      if (filterType === 'category') {
        return note.category === activeFilter && matchesSearch;
      }
      
      // Filter by tag
      if (filterType === 'tag') {
        return note.tags && note.tags.includes(activeFilter) && matchesSearch;
      }
      
      // Filter by date
      if (filterType === 'date') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const noteDate = new Date(note.createdAt);
        
        if (activeFilter === 'today') {
          return noteDate >= today && matchesSearch;
        }
        
        if (activeFilter === 'week') {
          return noteDate >= lastWeek && matchesSearch;
        }
      }
      
      return false;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  const renderNotes = () => {
    if (filteredNotes.length === 0) {
      return (
        <div className="empty-notes">
          <p>{searchTerm ? 'No notes match your search.' : 'No notes yet. Create your first note!'}</p>
        </div>
      );
    }

    return (
      <div className="notes-grid">
        {filteredNotes.map(note => (
          <div key={note.id} className="note-grid-item">
            <NoteItem
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onPin={handlePinNote}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="app-container">
        {/* Sidebar overlay for mobile */}
        <div 
          className={`sidebar-overlay ${sidebarOverlayActive ? 'active' : ''}`} 
          onClick={toggleSidebar}
        ></div>
        
        {/* Sidebar */}
        <div className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1 className="sidebar-title">Notes</h1>
            <div className="sidebar-actions">
              <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              {isMobile && (
                <button className="sidebar-close" onClick={toggleSidebar}>
                  <i className="material-icons">close</i>
                </button>
              )}
            </div>
          </div>
          <div className="sidebar-content">
            <div className="sidebar-section">
              <h2 className="sidebar-section-title">
                <i className="material-icons">filter_list</i> Filters
              </h2>
              <div className="filter-buttons">
                <button 
                  className={`filter-button ${activeFilter === 'all' && filterType === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all', 'all')}
                >
                  <i className="material-icons">notes</i>
                  <span>All Notes</span>
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'today' && filterType === 'date' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('today', 'date')}
                >
                  <i className="material-icons">today</i>
                  <span>Today</span>
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'week' && filterType === 'date' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('week', 'date')}
                >
                  <i className="material-icons">date_range</i>
                  <span>This Week</span>
                </button>
              </div>
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-section-title">
                <i className="material-icons">palette</i> Colors
              </h2>
              <div className="color-filters">
                <div 
                  className={`color-filter ${activeFilter === 'white' && filterType === 'color' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('white', 'color')}
                  title="White"
                >
                  <span className="color-circle white"></span>
                </div>
                <div 
                  className={`color-filter ${activeFilter === 'red' && filterType === 'color' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('red', 'color')}
                  title="Light Red"
                >
                  <span className="color-circle red"></span>
                </div>
                <div 
                  className={`color-filter ${activeFilter === 'green' && filterType === 'color' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('green', 'color')}
                  title="Light Green"
                >
                  <span className="color-circle green"></span>
                </div>
                <div 
                  className={`color-filter ${activeFilter === 'blue' && filterType === 'color' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('blue', 'color')}
                  title="Light Blue"
                >
                  <span className="color-circle blue"></span>
                </div>
                <div 
                  className={`color-filter ${activeFilter === 'yellow' && filterType === 'color' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('yellow', 'color')}
                  title="Light Yellow"
                >
                  <span className="color-circle yellow"></span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-section-title">
                <i className="material-icons">category</i> Categories
              </h2>
              <div className="filter-buttons">
                {getAllCategories().length > 0 ? (
                  getAllCategories().map(category => (
                    <button 
                      key={category}
                      className={`filter-button ${activeFilter === category && filterType === 'category' ? 'active' : ''}`}
                      onClick={() => handleFilterChange(category, 'category')}
                    >
                      <i className="material-icons">
                        {category === 'work' ? 'work' : 
                         category === 'personal' ? 'person' : 
                         category === 'ideas' ? 'lightbulb' : 
                         category === 'todo' ? 'check_circle' : 
                         category === 'important' ? 'priority_high' : 'label'}
                      </i>
                      <span>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="sidebar-empty-message">
                    <span>No categories yet</span>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-section-title">
                <i className="material-icons">local_offer</i> Tags
              </h2>
              <div className="filter-buttons">
                {getAllTags().length > 0 ? (
                  getAllTags().map(tag => (
                    <button 
                      key={tag}
                      className={`filter-button ${activeFilter === tag && filterType === 'tag' ? 'active' : ''}`}
                      onClick={() => handleFilterChange(tag, 'tag')}
                    >
                      <i className="material-icons">local_offer</i>
                      <span>{tag}</span>
                    </button>
                  ))
                ) : (
                  <div className="sidebar-empty-message">
                    <span>No tags yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="sidebar-search">
            <div className="search-container">
              <i className="material-icons search-icon">search</i>
              <input
                type="text"
                className="search-input"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <i className="material-icons">close</i>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="app-main">
          {isMobile && (
            <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
              <i className="material-icons">menu</i>
            </button>
          )}
          
          {renderNotes()}
          
          {saveStatus !== 'idle' && (
            <div className={`save-status ${saveStatus}`}>
              {saveMessage}
            </div>
          )}
          
          {/* Material Design Floating Action Button (FAB) */}
          <div className="fab" onClick={handleAddNote}>
            <i className="material-icons">add</i>
          </div>
          
          {isFormOpen && (
            <NoteForm
              note={editingNote || undefined}
              onSave={handleSaveNote}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
