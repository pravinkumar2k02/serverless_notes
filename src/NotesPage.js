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

  return (
    <div className="notes-page" onClick={handleOutsideClick}>
      <style>{`
        /* General NotesPage styling */
        .notes-page { padding: 20px; }
        .add-button { margin-bottom: 20px; }
        .notes-container { display: flex; flex-wrap: wrap; }
        .note-card {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 10px;
          margin: 10px;
          width: 6.5cm;
          height: 9cm;
          cursor: pointer;
          transition: all 0.3s ease;
          word-wrap: break-word;
          box-sizing: border-box;
          overflow: hidden;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        @media only screen and (max-width: 600px) {
          .note-card {
            width: 100%;
            height: 4.5cm;
            padding: 8px;
            margin: 8px;
          }
        }
        .note-card h3, .note-card p { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: pre; }
        .add-icon { cursor: pointer; }
        .note-card input, .note-card textarea {
          border: none;
          outline: none;
          background-color: transparent;
          resize: none;
          font-family: inherit;
          font-size: inherit;
          width: 100%;
          color: #333;
          word-wrap: break-word;
        }
        .note-card textarea { min-height: 50px; overflow: auto; }
        .context-menu {
          position: absolute;
          background-color: white;
          border: 1px solid #ddd;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
          padding: 10px;
          z-index: 1000;
        }
        .context-menu button {
          display: block;
          width: 100%;
          padding: 5px 10px;
          background-color: transparent;
          border: none;
          cursor: pointer;
        }
        .context-menu button:hover { background-color: #f0f0f0; }
        .encrypt-section { margin-top: 0px; float: right; }
        .encrypt-section input {
          margin-right: 10px;
          border: none;
          outline: none;
          width: 133px;
          padding: 5px;
          border-bottom: 1px solid #ddd;
          font-size: 20px;
        }
        .full-screen-note {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.8);
          background-color: white;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .full-screen-note .note-card {
          position: absolute;
          top: 60px;
          left: 20px;
          width: calc(100% - 40px);
          height: calc(100vh - 80px);
          margin: 0;
          box-sizing: border-box;
          overflow: auto;
          background-color: white;
        }
        .full-screen-note textarea {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          overflow: auto;
          border: none;
          resize: none;
          padding: 10px;
          font-size: 16px;
          outline: none;
        }
        .save-button {
          margin-top: 10px;
          position: absolute;
          border-radius: 5px;
          bottom: 20px;
          right: 20px;
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          z-index: 1000;
        }
        .save-button:hover { background-color: #0056b3; }
        .back-button {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 5px;
        }
        .full-screen-note .note-card input, .note-card h3 {
          font-size: 24px;
          font-weight: bold;
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: none;
          border-bottom: 2px solid #ccc;
          box-sizing: border-box;
        }
        .full-screen-note .note-card textarea { padding: 20px; box-sizing: border-box; }
      `}</style>

      <div className="encrypt-section">
        <input
          type="text"
          placeholder="User Key"
          value={userKey}
          onChange={(e) => setUserKey(e.target.value)}
        />
        <button onClick={handleEncryptNotes}>
          <SiLetsencrypt size={30} color="blue" />
        </button>
      </div>

      <div className="add-button">
        <IoMdAdd size={50} className="add-icon" onClick={handleAddNote} />
      </div>

      <div className="notes-container">
        {Object.keys(notes).map((title) => (
          <div
            key={title}
            className="note-card"
            onClick={() => handleCardClick(title)}
            onContextMenu={(e) => handleRightClick(e, title)}
          >
            <h3>{title}</h3>
            <p>{notes[title]}</p>
          </div>
        ))}
      </div>

      {isNewNote && (
        <div className="full-screen-note">
          <div className="note-card">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Body"
            />
          </div>
          <button className="save-button" onClick={handleSaveNewNote}>
            Save
          </button>
          <button className="back-button" onClick={handleCloseFullScreen}>
            Back
          </button>
        </div>
      )}

      {fullScreenNote && (
        <div className="full-screen-note">
          <div className="note-card">
            <input
              type="text"
              value={fullScreenNote}
              onChange={(e) => handleEditChange(e, 'title', fullScreenNote)}
            />
            <textarea
              value={notes[fullScreenNote]}
              onChange={(e) => handleEditChange(e, 'body', fullScreenNote)}
            />
          </div>
          <button className="back-button" onClick={handleCloseFullScreen}>
            Back
          </button>
        </div>
      )}

      {contextMenu.visible && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={() => handleDeleteNote(contextMenu.title)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
