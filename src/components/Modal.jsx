import React from 'react';
import '../styles/Modal.css';

function Modal({ onStartGame, onClose, isInGame = false }) {
  const handleFriendSelection = () => {
    onStartGame('friend', null);
  };

  const handleAISelection = (difficulty) => {
    onStartGame('ai', difficulty);
  };

  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace clic en el overlay, no en el contenido del modal
    if (e.target === e.currentTarget && isInGame) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          {isInGame && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
          <img 
            src="/images/logo.png" 
            alt="Yoshi's Zones Logo" 
            className="modal-logo"
          />
          <h2>Yoshi's Zones</h2>
        </div>
        
        <p>Elige tu modo de juego:</p>
        
        <button onClick={handleFriendSelection}>
          👥 Jugar con un Amigo
        </button>
        
        <div className="ai-options">
          <p>🤖 Jugar contra IA:</p>
          <button onClick={() => handleAISelection('beginner')}>
            Principiante
          </button>
          <button onClick={() => handleAISelection('amateur')}>
            Amateur
          </button>
          <button onClick={() => handleAISelection('expert')}>
            Experto
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;