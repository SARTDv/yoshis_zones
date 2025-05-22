import React from 'react';
import '../styles/Scoreboard.css';
import { PLAYER_COLORS } from '../constants';

function Scoreboard({ scores, currentPlayer, conqueredZonesCount, gameMode }) {
  return (
    <div className="scoreboard-container">
      <div className={`score-item ${currentPlayer === PLAYER_COLORS.GREEN ? 'active-turn' : ''}`}>
        <img 
          src="/images/green-yoshi.png" 
          alt="Yoshi Verde" 
          className="yoshi-icon"
        />
        Verde: {scores[PLAYER_COLORS.GREEN]} (Zonas: {conqueredZonesCount[PLAYER_COLORS.GREEN]})
        {gameMode === 'ai' && currentPlayer === PLAYER_COLORS.GREEN}
      </div>
      <div className={`score-item ${currentPlayer === PLAYER_COLORS.RED ? 'active-turn' : ''}`}>
        <img 
          src="/images/red-yoshi.png" 
          alt="Yoshi Rojo" 
          className="yoshi-icon"
        />
        Rojo: {scores[PLAYER_COLORS.RED]} (Zonas: {conqueredZonesCount[PLAYER_COLORS.RED]})
        {gameMode === 'ai' && currentPlayer === PLAYER_COLORS.RED}
      </div>
    </div>
  );
}

export default Scoreboard;