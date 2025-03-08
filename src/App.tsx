import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import { Note } from './types';
import NoteItem from './components/NoteItem';
import NoteForm from './components/NoteForm';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './contexts/AuthContext';
import AuthContainer from './components/Auth/AuthContainer';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase/config';

const App: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'color' | 'category' | 'tag' | 'date'>('all');
  const [sidebarOverlayActive, setSidebarOverlayActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Default to dark mode
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    if (user) {
      // Save user preference to Firestore if authenticated
      // This would be implemented in a real app
    }
  }, [darkMode, user]);

  // Load notes from Firestore
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Fetch notes from Firestore
  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setSaveStatus('saving');
      const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedNotes: Note[] = [];
      querySnapshot.forEach((doc) => {
        const noteData = doc.data();
        fetchedNotes.push({
          ...noteData,
          id: doc.id,
          createdAt: noteData.createdAt?.toDate() || new Date(),
          updatedAt: noteData.updatedAt?.toDate() || new Date()
        } as Note);
      });
      
      setNotes(fetchedNotes);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error fetching notes:', error);
      setSaveStatus('error');
    }
  };

  // Save note to Firestore
  const saveNote = async (note: Note) => {
    if (!user) return;
    
    try {
      setSaveStatus('saving');
      
      // Prepare note data for Firestore
      const noteData = {
        ...note,
        userId: user.uid,
        createdAt: note.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      if (note.id && notes.some(n => n.id === note.id)) {
        // Update existing note
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, noteData);
        
        // Update notes state
        setNotes(prevNotes => 
          prevNotes.map(n => n.id === note.id ? { ...noteData, id: note.id } as Note : n)
        );
      } else {
        // Create new note
        const docRef = await addDoc(collection(db, 'notes'), noteData);
        
        // Update notes state with the new ID
        const newNote = { ...noteData, id: docRef.id } as Note;
        setNotes(prevNotes => [...prevNotes, newNote]);
      }
      
      setSaveStatus('saved');
      setIsFormOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
    }
  };

  // Delete note from Firestore
  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      setSaveStatus('saving');
      await deleteDoc(doc(db, 'notes', id));
      
      // Update notes state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error deleting note:', error);
      setSaveStatus('error');
    }
  };

  // Toggle pin status
  const togglePinNote = async (id: string) => {
    if (!user) return;
    
    const noteToUpdate = notes.find(note => note.id === id);
    if (!noteToUpdate) return;
    
    try {
      const updatedNote = { ...noteToUpdate, pinned: !noteToUpdate.pinned, updatedAt: new Date() };
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, { pinned: !noteToUpdate.pinned, updatedAt: new Date() });
      
      // Update notes state
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const toggleTheme = () => {
    setDarkMode(prevDarkMode => !prevDarkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
    if (isMobile) {
      setSidebarOverlayActive(prev => !prev);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarOverlayActive(false);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Filter notes based on active filter
  const filteredNotes = notes.filter(note => {
    // Search term filter
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(typeof note.content === 'string' && note.content.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // Category, tag, or color filter
    if (filterType !== 'all' && activeFilter !== 'all') {
      if (filterType === 'category' && note.category !== activeFilter) {
        return false;
      }
      if (filterType === 'tag' && !note.tags?.includes(activeFilter)) {
        return false;
      }
      if (filterType === 'color' && note.color !== activeFilter) {
        return false;
      }
    }

    return true;
  });

  // Sort notes: pinned first, then by updatedAt date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Get all unique tags from notes
  const getAllTags = () => {
    const allTags = notes.reduce((tags: string[], note) => {
      if (note.tags && note.tags.length > 0) {
        return [...tags, ...note.tags];
      }
      return tags;
    }, []);
    return [...new Set(allTags)];
  };

  // Get all used categories from notes
  const getUsedCategories = () => {
    const categories = notes.map(note => note.category).filter(Boolean) as string[];
    return [...new Set(categories)];
  };

  // Get all used colors from notes
  const getUsedColors = () => {
    const colors = notes.map(note => note.color).filter(Boolean) as string[];
    return [...new Set(colors)];
  };

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <div className="app dark-mode">
        <AuthContainer />
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="icon-button menu-button" onClick={toggleSidebar}>
            <i className="icon-menu"></i>
          </button>
          <h1>React Notes</h1>
        </div>
        <div className="header-right">
          <div className="search-container">
            <i className="icon-search search-icon"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
          <div className="user-profile">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="user-avatar" 
              />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-name">{user?.displayName || 'User'}</p>
                <p className="user-email">{user?.email}</p>
              </div>
              <button className="logout-button" onClick={logout}>
                <i className="icon-logout"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-content">
        {/* Sidebar */}
        <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Filters</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-button ${filterType === 'all' && activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setFilterType('all'); setActiveFilter('all'); }}
              >
                <i className="icon-notes"></i> All Notes
              </button>
            </div>
          </div>

          {/* Colors Filter */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Colors</h3>
            <div className="color-filters">
              {getUsedColors().map(color => (
                <button 
                  key={color}
                  className={`color-filter ${color} ${filterType === 'color' && activeFilter === color ? 'active' : ''}`}
                  onClick={() => { setFilterType('color'); setActiveFilter(color); }}
                  title={`Filter by ${color}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <div className="category-list">
              {['Work', 'Personal', 'Ideas', 'To-Do', 'Important'].map(category => (
                <button 
                  key={category}
                  className={`category-filter ${filterType === 'category' && activeFilter === category ? 'active' : ''}`}
                  onClick={() => { setFilterType('category'); setActiveFilter(category); }}
                >
                  <i className={`icon-${category.toLowerCase().replace(' ', '-')}`}></i>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Tags</h3>
            <div className="tag-list">
              {getAllTags().map(tag => (
                <button 
                  key={tag}
                  className={`tag-filter ${filterType === 'tag' && activeFilter === tag ? 'active' : ''}`}
                  onClick={() => { setFilterType('tag'); setActiveFilter(tag); }}
                >
                  <i className="icon-tag"></i>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOverlayActive && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}

        {/* Notes Grid */}
        <main className="app-main">
          <div className="notes-grid">
            {sortedNotes.map(note => (
              <NoteItem 
                key={note.id} 
                note={note} 
                onEdit={handleEditNote} 
                onDelete={deleteNote}
                onPin={togglePinNote}
              />
            ))}
          </div>

          {/* Add Note Button */}
          <button className="add-note-button" onClick={handleCreateNote}>
            <i className="icon-plus"></i>
          </button>
        </main>
      </div>

      {/* Note Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <NoteForm 
              note={editingNote} 
              onSave={saveNote} 
              onClose={handleCloseForm} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
