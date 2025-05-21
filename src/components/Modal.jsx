import React from 'react';
import '../styles/Modal.css';

function Modal({ onStartGame }) {
  const handleFriendSelection = () => {
    onStartGame('friend', null);
  };

  const handleAISelection = (difficulty) => {
    onStartGame('ai', difficulty);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Yoshi's Zones</h2>
        <p>Elige tu modo de juego:</p>
        <button onClick={handleFriendSelection}>Jugar con un Amigo</button>
        <div className="ai-options">
          <p>Jugar contra IA:</p>
          <button onClick={() => handleAISelection('beginner')}>Principiante</button>
          <button onClick={() => handleAISelection('amateur')}>Amateur</button>
          <button onClick={() => handleAISelection('expert')}>Experto</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;