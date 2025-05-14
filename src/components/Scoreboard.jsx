import React from 'react';
import '../styles/Scoreboard.css';
import { PLAYER_COLORS, PLAYER_HEX_COLORS } from '../constants';

function Scoreboard({ scores, currentPlayer, conqueredZonesCount }) {
  return (
    <div className="scoreboard-container">
      <div className={`score-item ${currentPlayer === PLAYER_COLORS.GREEN ? 'active-turn' : ''}`}>
        <span className="knight-icon" style={{ color: PLAYER_HEX_COLORS.GREEN }}>♘</span>
        Verde: {scores[PLAYER_COLORS.GREEN]} (Zonas: {conqueredZonesCount[PLAYER_COLORS.GREEN]})
      </div>
      <div className={`score-item ${currentPlayer === PLAYER_COLORS.RED ? 'active-turn' : ''}`}>
        <span className="knight-icon" style={{ color: PLAYER_HEX_COLORS.RED }}>♘</span>
        Rojo: {scores[PLAYER_COLORS.RED]} (Zonas: {conqueredZonesCount[PLAYER_COLORS.RED]})
      </div>
    </div>
  );
}

export default Scoreboard;