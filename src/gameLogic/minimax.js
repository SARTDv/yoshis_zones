import { PLAYER_COLORS, ZONES_DEFINITION_FOR_MAJORITY } from '../constants';
import { getPossibleKnightMoves } from './knightMoves';

// Función heurística según definida en el proyecto:
// h(n) = 100⋅(ZV−ZR) + 10⋅(AV−AR) + (PV−PR)
const evaluateBoard = (capturedSquares, knights) => {
  const greenPlayer = PLAYER_COLORS.GREEN;
  const redPlayer = PLAYER_COLORS.RED;

  // Mapeo para contar casillas por zona para cada jugador
  const zonesControl = ZONES_DEFINITION_FOR_MAJORITY.map(zone => {
    const greenCount = zone.filter(sq => capturedSquares[sq] === greenPlayer).length;
    const redCount = zone.filter(sq => capturedSquares[sq] === redPlayer).length;
    return { greenCount, redCount };
  });

  // Calcular ZV y ZR: zonas completamente ganadas
  let ZV = 0, ZR = 0;
  zonesControl.forEach(zone => {
    if (zone.greenCount >= 3) ZV++; // Mayoría (3 de 5)
    if (zone.redCount >= 3) ZR++;
  });

  // Calcular AV y AR: zonas en disputa donde un jugador lleva ventaja
  let AV = 0, AR = 0;
  zonesControl.forEach(zone => {
    // Si la zona no está ganada por ninguno pero hay ventaja
    if (zone.greenCount < 3 && zone.redCount < 3) {
      if (zone.greenCount > zone.redCount) AV++;
      if (zone.redCount > zone.greenCount) AR++;
    }
  });

  // Calcular PV y PR: total de casillas pintadas
  const PV = Object.values(capturedSquares).filter(color => color === greenPlayer).length;
  const PR = Object.values(capturedSquares).filter(color => color === redPlayer).length;

  // Función de evaluación
  const utility = 100 * (ZV - ZR) + 10 * (AV - AR) + (PV - PR);

  return utility;
};

// Genera todos los posibles movimientos para un jugador
const generateMoves = (knights, currentPlayer, capturedSquares) => {
  const currentKnightPos = knights[currentPlayer];
  const otherPlayer = currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN;
  const otherKnightPos = knights[otherPlayer];
  
  // Obtener movimientos válidos para el caballo actual
  const possibleMoves = getPossibleKnightMoves(currentKnightPos.r, currentKnightPos.c, [otherKnightPos])
    .filter(move => !capturedSquares[`${move.r}-${move.c}`]); // Excluir casillas ya capturadas
  
  return possibleMoves;
};

// Minimax con poda alpha-beta
export const minimaxAlphaBeta = (knights, currentPlayer, capturedSquares, depth, alpha, beta, isMaximizing) => {
  // Caso base: si llegamos a la profundidad máxima o no hay más movimientos
  if (depth === 0) {
    return {
      utility: evaluateBoard(capturedSquares, knights),
      move: null
    };
  }

  const possibleMoves = generateMoves(knights, currentPlayer, capturedSquares);
  
  // Si no hay movimientos posibles, evaluamos el tablero actual
  if (possibleMoves.length === 0) {
    return {
      utility: evaluateBoard(capturedSquares, knights),
      move: null
    };
  }

  let bestMove = null;
  
  if (isMaximizing) { // Nodo MAX (Yoshi verde)
    let maxEval = -Infinity;
    
    for (const move of possibleMoves) {
      // Simular el movimiento
      const newKnights = { ...knights };
      newKnights[currentPlayer] = { r: move.r, c: move.c };
      
      // Actualizar casillas capturadas si aplica
      const moveKey = `${move.r}-${move.c}`;
      let newCapturedSquares = { ...capturedSquares };
      
      // Capturar la casilla si es una zona especial
      for (const zone of ZONES_DEFINITION_FOR_MAJORITY) {
        if (zone.includes(moveKey) && !newCapturedSquares[moveKey]) {
          newCapturedSquares = { ...newCapturedSquares, [moveKey]: currentPlayer };
        }
      }
      
      // Cambiar el turno para el siguiente nivel
      const nextPlayer = currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN;
      
      // Llamada recursiva
      const evalResult = minimaxAlphaBeta(
        newKnights,
        nextPlayer,
        newCapturedSquares,
        depth - 1,
        alpha,
        beta,
        false // Próximo nivel es MIN
      );
      
      // Actualizar mejor evaluación
      if (evalResult.utility > maxEval) {
        maxEval = evalResult.utility;
        bestMove = move;
      }
      
      // Actualizar alpha
      alpha = Math.max(alpha, evalResult.utility);
      
      // Poda alpha-beta
      if (beta <= alpha) {
        break;
      }
    }
    
    return {
      utility: maxEval,
      move: bestMove
    };
    
  } else { // Nodo MIN (Yoshi rojo)
    let minEval = Infinity;
    
    for (const move of possibleMoves) {
      // Simular el movimiento
      const newKnights = { ...knights };
      newKnights[currentPlayer] = { r: move.r, c: move.c };
      
      // Actualizar casillas capturadas si aplica
      const moveKey = `${move.r}-${move.c}`;
      let newCapturedSquares = { ...capturedSquares };
      
      // Capturar la casilla si es una zona especial
      for (const zone of ZONES_DEFINITION_FOR_MAJORITY) {
        if (zone.includes(moveKey) && !newCapturedSquares[moveKey]) {
          newCapturedSquares = { ...newCapturedSquares, [moveKey]: currentPlayer };
        }
      }
      
      // Cambiar el turno para el siguiente nivel
      const nextPlayer = currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN;
      
      // Llamada recursiva
      const evalResult = minimaxAlphaBeta(
        newKnights,
        nextPlayer,
        newCapturedSquares,
        depth - 1,
        alpha,
        beta,
        true // Próximo nivel es MAX
      );
      
      // Actualizar mejor evaluación
      if (evalResult.utility < minEval) {
        minEval = evalResult.utility;
        bestMove = move;
      }
      
      // Actualizar beta
      beta = Math.min(beta, evalResult.utility);
      
      // Poda alpha-beta
      if (beta <= alpha) {
        break;
      }
    }
    
    return {
      utility: minEval,
      move: bestMove
    };
  }
};

// Función para obtener el mejor movimiento según la dificultad elegida
export const getBestMove = (knights, currentPlayer, capturedSquares, difficulty) => {
  // Definir profundidad según dificultad
  let depth;
  switch (difficulty) {
    case 'beginner':
      depth = 2;
      break;
    case 'amateur':
      depth = 4;
      break;
    case 'expert':
      depth = 6;
      break;
    default:
      depth = 2;
  }
  
  // Ejecutar minimax con la profundidad adecuada
  const result = minimaxAlphaBeta(
    knights,
    currentPlayer,
    capturedSquares,
    depth,
    -Infinity,
    Infinity,
    currentPlayer === PLAYER_COLORS.GREEN // MAX si es verde, MIN si es rojo
  );
  
  return result.move;
};