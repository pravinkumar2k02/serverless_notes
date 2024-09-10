import React, { useState, useEffect } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { IoMdAdd } from 'react-icons/io';
import { SiLetsencrypt } from 'react-icons/si';

const NotesPage = () => {
  const [notes, setNotes] = useState({});
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isNewNote, setIsNewNote] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, title: '' });
  const [userKey, setUserKey] = useState(localStorage.getItem('userKey') || '');
  const [fullScreenNote, setFullScreenNote] = useState(null);

  useEffect(() => {
    axios.get('/.netlify/functions/getNotes')
      .then(response => {
        setNotes(response.data);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
      });
  }, []);

  const handleAddNote = () => {
    setNewTitle('');
    setNewBody('');
    setIsNewNote(true);
    setFullScreenNote(''); // Open a blank full-screen note for adding
  };

  const handleSaveNewNote = () => {
    if (newTitle.trim() && newBody.trim()) {
      const updatedNotes = { ...notes, [newTitle]: newBody };
      setNotes(updatedNotes);
      setNewTitle('');
      setNewBody('');
      setIsNewNote(false);
      setFullScreenNote(null); // Close full-screen note
      handleSaveToBackend(updatedNotes);
    } else {
      alert("Title and Body are required.");
    }
  };

  const handleSaveToBackend = debounce((updatedNotes) => {
    axios.post('/.netlify/functions/save_notes', { notes: updatedNotes })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error saving notes:', error);
      });
  }, 1000);

  const handleCardClick = (title) => {
    setFullScreenNote(title); // Open the full screen note view
  };

  const handleEditChange = (e, field, title) => {
    const updatedNotes = { ...notes };
    if (field === 'title') {
      const oldBody = updatedNotes[title]; // Get the old body for the note
      delete updatedNotes[title]; // Remove the old title entry
      updatedNotes[e.target.value] = oldBody; // Add new title with the old body
      setFullScreenNote(e.target.value); // Update full-screen note title
    } else if (field === 'body') {
      updatedNotes[title] = e.target.value; // Update body content
    }
    setNotes(updatedNotes);
    handleSaveToBackend(updatedNotes);
  };

  const handleRightClick = (e, title) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, title });
  };

  const handleEncryptNotes = () => {
    axios.post('/.netlify/functions/encrypt', { userKey })
      .then(response => {
        localStorage.clear();
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Error encrypting notes:', error);
      });
  };

  const handleDeleteNote = (title) => {
    const updatedNotes = { ...notes };
    delete updatedNotes[title];
    setNotes(updatedNotes);
    handleSaveToBackend(updatedNotes);
    setContextMenu({ visible: false, x: 0, y: 0, title: '' });
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.context-menu') && !e.target.closest('.note-card')) {
      setContextMenu({ visible: false, x: 0, y: 0, title: '' });
    }
  };

  const handleCloseFullScreen = () => {
    if (isNewNote) {
      setIsNewNote(false); // Close the new note creation mode
      setNewTitle('');
      setNewBody('');
    } else {
      setFullScreenNote(null); // Close the full-screen view for an existing note
    }
  };

  const styles = {
    notesPage: {
      padding: '20px',
    },
    addButton: {
      marginBottom: '20px',
      textAlign: 'center',
    },
    notesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    },
    noteCard: {
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '10px',
      width: '150px',
      height: '200px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      backgroundColor: '#fff',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      boxSizing: 'border-box',
    },
    noteCardHover: {
      backgroundColor: '#f9f9f9',
    },
    noteCardTitle: {
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    noteCardBody: {
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    contextMenu: {
      position: 'absolute',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
      padding: '10px',
      zIndex: 1000,
    },
    contextMenuButton: {
      display: 'block',
      width: '100%',
      padding: '5px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
    },
    contextMenuButtonHover: {
      backgroundColor: '#f0f0f0',
    },
    encryptSection: {
      marginTop: '20px',
      textAlign: 'center',
    },
    encryptInput: {
      marginRight: '10px',
      padding: '5px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    fullScreenNote: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    fullScreenNoteCard: {
      width: '80vw',
      height: '80vh',
      backgroundColor: '#fff',
      color: '#000',
      padding: '20px',
      overflow: 'auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    fullScreenTextarea: {
      width: 'calc(100% - 20px)',
      height: 'calc(100% - 60px)',
      boxSizing: 'border-box',
      resize: 'none',
      padding: '10px',
      fontSize: '16px',
    },
    saveButton: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      color: '#fff',
      cursor: 'pointer',
      backgroundColor: '#007bff',
    },
    saveButtonHover: {
      backgroundColor: '#0056b3',
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      color: '#fff',
      cursor: 'pointer',
      backgroundColor: '#007bff',
    },
    backButtonHover: {
      backgroundColor: '#0056b3',
    },
  };

  return (
    <div
      style={styles.notesPage}
      onClick={handleOutsideClick}
    >
      <div style={styles.encryptSection}>
        <input
          type="text"
          placeholder="User Key"
          value={userKey}
          onChange={(e) => setUserKey(e.target.value)}
          style={styles.encryptInput}
        />
        <button onClick={handleEncryptNotes} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <SiLetsencrypt size={30} color="blue" />
        </button>
      </div>

      <div style={styles.addButton}>
        <IoMdAdd size={50} className="add-icon" onClick={handleAddNote} />
      </div>

      <div style={styles.notesContainer}>
        {Object.keys(notes).map((title) => (
          <div
            key={title}
            style={styles.noteCard}
            onClick={() => handleCardClick(title)}
            onContextMenu={(e) => handleRightClick(e, title)}
          >
            <h3 style={styles.noteCardTitle}>{title}</h3>
            <p style={styles.noteCardBody}>{notes[title]}</p>
          </div>
        ))}
      </div>

      {isNewNote && (
        <div style={styles.fullScreenNote}>
          <div style={styles.fullScreenNoteCard}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              style={{ width: '100%', padding: '10px', fontSize: '18px' }}
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Body"
              style={styles.fullScreenTextarea}
            />
            <button
              style={styles.saveButton}
              onClick={handleSaveNewNote}
            >
              Save
            </button>
            <button
              style={styles.backButton}
              onClick={handleCloseFullScreen}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {fullScreenNote && (
        <div style={styles.fullScreenNote}>
          <div style={styles.fullScreenNoteCard}>
            <input
              type="text"
              value={fullScreenNote}
              onChange={(e) => handleEditChange(e, 'title', fullScreenNote)}
              style={{ width: '100%', padding: '10px', fontSize: '18px' }}
            />
            <textarea
              value={notes[fullScreenNote]}
              onChange={(e) => handleEditChange(e, 'body', fullScreenNote)}
              style={styles.fullScreenTextarea}
            />
            <button
              style={styles.backButton}
              onClick={handleCloseFullScreen}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {contextMenu.visible && (
        <div
          style={{
            ...styles.contextMenu,
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button
            onClick={() => handleDeleteNote(contextMenu.title)}
            style={styles.contextMenuButton}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
