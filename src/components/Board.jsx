import React from 'react';
import Square from './Square';
import Knight from './Knight';
import '../styles/Board.css';
import { BOARD_SIZE, PLAYER_COLORS, ZONES_DEFINITION_FOR_MAJORITY } from '../constants';

function Board({ knights, selectedKnightPos, possibleMoves, onSquareClick, capturedSpecialSquares, conqueredZones }) {
  const renderSquares = () => {
    const squares = [];
    const isZoneConqueredBy = (r, c) => {
        const sqKey = `${r}-${c}`;
        for (let player in conqueredZones) {
            for (let zoneIndex of conqueredZones[player]) {
                if (ZONES_DEFINITION_FOR_MAJORITY[zoneIndex].includes(sqKey)) {
                    return player; // Devuelve PLAYER_COLORS.GREEN o PLAYER_COLORS.RED
                }
            }
        }
        return null;
    };


    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const squareKey = `${r}-${c}`;
        const isPossible = possibleMoves.some(move => move.r === r && move.c === c);
        const capturedByColor = capturedSpecialSquares[squareKey];
        const knightInSquare = Object.keys(knights).find(
          color => knights[color].r === r && knights[color].c === c
        );

        squares.push(
          <Square
            key={squareKey}
            r={r}
            c={c}
            onClick={() => onSquareClick(r, c)}
            isPossibleMove={isPossible}
            capturedBy={capturedByColor}
            zoneConqueredBy={isZoneConqueredBy(r,c)}
          >
            {knightInSquare && (
              <Knight
                color={PLAYER_COLORS[knightInSquare]}
                isSelected={selectedKnightPos?.r === r && selectedKnightPos?.c === c}
              />
            )}
          </Square>
        );
      }
    }
    return squares;
  };

  return <div className="board">{renderSquares()}</div>;
}

export default Board;