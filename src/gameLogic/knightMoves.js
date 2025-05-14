import { BOARD_SIZE } from '../constants';

export const getPossibleKnightMoves = (knightRow, knightCol, occupiedSquares = []) => {
  const moves = [
    { r: -2, c: -1 }, { r: -2, c: 1 },
    { r: -1, c: -2 }, { r: -1, c: 2 },
    { r: 1, c: -2 }, { r: 1, c: 2 },
    { r: 2, c: -1 }, { r: 2, c: 1 },
  ];

  const possibleMoves = [];
  for (const move of moves) {
    const newRow = knightRow + move.r;
    const newCol = knightCol + move.c;

    if (
      newRow >= 0 && newRow < BOARD_SIZE &&
      newCol >= 0 && newCol < BOARD_SIZE &&
      !occupiedSquares.some(sq => sq.r === newRow && sq.c === newCol) // No puede moverse a una casilla ya ocupada por otro caballo
    ) {
      possibleMoves.push({ r: newRow, c: newCol });
    }
  }
  return possibleMoves;
};