import React from 'react';
import '../styles/Square.css';
import { PLAYER_HEX_COLORS, SPECIAL_ZONE_SQUARES, PLAYER_COLORS } from '../constants';

function Square({ children, r, c, onClick, isPossibleMove, capturedBy, zoneConqueredBy }) {
  const squareKey = `${r}-${c}`;
  const isSpecial = SPECIAL_ZONE_SQUARES.has(squareKey);

  let className = "square";
  if (isPossibleMove) className += " possible-move";
  if (isSpecial && !capturedBy) className += " special-zone-default";
  if (capturedBy) className += " captured";
  if (zoneConqueredBy === PLAYER_COLORS.GREEN) className += " zone-conquered-green";
  if (zoneConqueredBy === PLAYER_COLORS.RED) className += " zone-conquered-red";


  const style = {
    backgroundColor: capturedBy
      ? PLAYER_HEX_COLORS[capturedBy]
      : ( (r + c) % 2 === 0 ? '#ECEFF1' : '#CFD8DC'), // Colores base
  };
  if (isPossibleMove) {
    style.boxShadow = `inset 0 0 0 3px ${PLAYER_HEX_COLORS.HIGHLIGHT}`; // Efecto de resaltado simple
  }


  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      data-r={r}
      data-c={c}
    >
      {children}
      {/* Animación de expansión puede ser con ::after y CSS si se desea */}
    </div>
  );
}

export default Square;