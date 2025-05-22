import React from 'react';
import '../styles/Knight.css';
import { PLAYER_COLORS } from '../constants';

function Knight({ color, isSelected }) {
  let knightClass = "knight";
  if (isSelected) knightClass += " selected";

  const yoshiImage = color === PLAYER_COLORS.GREEN 
    ? "/images/green-yoshi.png" 
    : "/images/red-yoshi.png";

  return (
    <div className={knightClass}>
      <img 
        src={yoshiImage} 
        alt={`${color === PLAYER_COLORS.GREEN ? 'Green' : 'Red'} Yoshi`} 
        className="yoshi-image"
      />
    </div>
  );
}

export default Knight;