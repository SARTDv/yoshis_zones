import React from 'react';
import '../styles/Modal.css';

function Modal({ onStartGame }) {
  // Todas las opciones inician el modo "amigo" por ahora
  const handleSelection = () => {
    onStartGame('friend', null); // 'friend' es el modo, null para dificultad
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Duelo de Corceles</h2>
        <p>Elige tu modo de juego:</p>
        <button onClick={handleSelection}>Jugar con un Amigo</button>
        <div className="ai-options">
          <p>Jugar contra IA (Demo: inicia juego de amigos):</p>
          <button onClick={handleSelection}>Principiante</button>
          <button onClick={handleSelection}>Amateur</button>
          <button onClick={handleSelection}>Experto</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;