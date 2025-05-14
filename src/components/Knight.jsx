import React from 'react';
import '../styles/Knight.css';
import { PLAYER_HEX_COLORS, PLAYER_COLORS } from '../constants';

function Knight({ color, isSelected }) {
  let knightClass = "knight";
  if (isSelected) knightClass += " selected";

  const style = {
    color: color === PLAYER_COLORS.GREEN ? PLAYER_HEX_COLORS.GREEN : PLAYER_HEX_COLORS.RED,
  };

  return (
    <div className={knightClass} style={style}>
      ♘
    </div>
  );
}

export default Knight;