import React, { useState, useEffect } from 'react';
import Board from './Board';
import Scoreboard from './Scoreboard';
import Modal from './Modal';
import '../styles/App.css';
import {
  PLAYER_COLORS,
  INITIAL_KNIGHT_POSITIONS,
  SPECIAL_ZONE_SQUARES,
  ZONES_DEFINITION_FOR_MAJORITY
} from '../constants';
import { getPossibleKnightMoves } from '../gameLogic/knightMoves';
import { getBestMove } from '../gameLogic/minimax';

const createInitialBoard = () => Array(8).fill(null).map(() => Array(8).fill(null));

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('friend'); // 'friend' o 'ai'
  const [difficulty, setDifficulty] = useState(null); // 'beginner', 'amateur', 'expert'
  const [knights, setKnights] = useState(JSON.parse(JSON.stringify(INITIAL_KNIGHT_POSITIONS))); // Deep copy
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_COLORS.GREEN);
  const [selectedKnightPos, setSelectedKnightPos] = useState(null); // { r, c }
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [capturedSpecialSquares, setCapturedSpecialSquares] = useState({}); // { 'r-c': 'PLAYER_COLOR' }
  const [scores, setScores] = useState({ [PLAYER_COLORS.GREEN]: 0, [PLAYER_COLORS.RED]: 0 });
  const [conqueredZones, setConqueredZones] = useState({ // Para el efecto de conquista de zona
    [PLAYER_COLORS.GREEN]: new Set(),
    [PLAYER_COLORS.RED]: new Set()
  });
  const [winner, setWinner] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const resetGame = () => {
    setKnights(JSON.parse(JSON.stringify(INITIAL_KNIGHT_POSITIONS)));
    setCurrentPlayer(PLAYER_COLORS.GREEN);
    setSelectedKnightPos(null);
    setPossibleMoves([]);
    setCapturedSpecialSquares({});
    setScores({ [PLAYER_COLORS.GREEN]: 0, [PLAYER_COLORS.RED]: 0 });
    setConqueredZones({ [PLAYER_COLORS.GREEN]: new Set(), [PLAYER_COLORS.RED]: new Set() });
    setWinner(null);
    setGameStarted(true);
  };

  const handleStartGame = (mode, aiDifficulty) => {
    setGameMode(mode);
    setDifficulty(aiDifficulty);
    resetGame();
  };

  useEffect(() => {
    // Comprobar ganador si todas las casillas especiales están capturadas
    if (Object.keys(capturedSpecialSquares).length === SPECIAL_ZONE_SQUARES.size) {
        if (scores[PLAYER_COLORS.GREEN] > scores[PLAYER_COLORS.RED]) {
            setWinner(PLAYER_COLORS.GREEN);
        } else if (scores[PLAYER_COLORS.RED] > scores[PLAYER_COLORS.GREEN]) {
            setWinner(PLAYER_COLORS.RED);
        } else {
            setWinner('TIE'); // Empate
        }
    }
  }, [capturedSpecialSquares, scores]);

  // Efecto para manejar el turno de la IA
  useEffect(() => {
    if (gameStarted && gameMode === 'ai' && currentPlayer === PLAYER_COLORS.GREEN && !winner) {
      // La IA juega con el Yoshi verde
      setIsAIThinking(true);
      
      // Pequeño retraso para dar sensación de "pensamiento"
      const aiMoveTimeout = setTimeout(() => {
        const bestMove = getBestMove(knights, currentPlayer, capturedSpecialSquares, difficulty);
        
        if (bestMove) {
          // Mover el caballo de la IA
          const newKnights = { ...knights };
          newKnights[currentPlayer] = { r: bestMove.r, c: bestMove.c };
          setKnights(newKnights);
          
          // Capturar casilla especial si aplica
          const squareKey = `${bestMove.r}-${bestMove.c}`;
          let newCaptured = { ...capturedSpecialSquares };
          let newScores = { ...scores };
          
          if (SPECIAL_ZONE_SQUARES.has(squareKey) && !newCaptured[squareKey]) {
            newCaptured[squareKey] = currentPlayer;
            newScores[currentPlayer]++;
            setCapturedSpecialSquares(newCaptured);
            setScores(newScores);
            checkZoneConquest(newCaptured);
          }
          
          // Cambiar turno al jugador humano
          setCurrentPlayer(PLAYER_COLORS.RED);
          setIsAIThinking(false);
        }
      }, 700); // Retraso de 700ms para simular "pensamiento" de la IA
      
      return () => clearTimeout(aiMoveTimeout);
    }
  }, [gameStarted, gameMode, currentPlayer, knights, capturedSpecialSquares, difficulty, winner]);

  const handleSquareClick = (r, c) => {
    if (winner || isAIThinking) return;
    
    // En modo IA, el jugador humano solo controla el Yoshi rojo
    if (gameMode === 'ai' && currentPlayer === PLAYER_COLORS.GREEN) return;

    const clickedKnightColor = Object.keys(knights).find(
      color => knights[color].r === r && knights[color].c === c
    );

    if (selectedKnightPos) { // Intentar mover el caballo seleccionado
      const move = possibleMoves.find(m => m.r === r && m.c === c);
      if (move) {
        // Mover el caballo
        const newKnights = { ...knights };
        newKnights[currentPlayer] = { r, c };
        setKnights(newKnights);

        // Capturar casilla especial si aplica
        const squareKey = `${r}-${c}`;
        let newCaptured = { ...capturedSpecialSquares };
        let newScores = { ...scores };

        if (SPECIAL_ZONE_SQUARES.has(squareKey) && !newCaptured[squareKey]) {
          newCaptured[squareKey] = currentPlayer;
          newScores[currentPlayer]++;
          setCapturedSpecialSquares(newCaptured);
          setScores(newScores);
          checkZoneConquest(newCaptured);
        }

        // Cambiar turno y limpiar selección
        setSelectedKnightPos(null);
        setPossibleMoves([]);
        setCurrentPlayer(currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN);
      } else if (clickedKnightColor === currentPlayer) {
        // Si hace clic en su propio caballo de nuevo, lo selecciona
        const currentKnightPos = knights[currentPlayer];
        const otherKnightPos = knights[currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN];
        const moves = getPossibleKnightMoves(currentKnightPos.r, currentKnightPos.c, [otherKnightPos])
          .filter(m => !capturedSpecialSquares[`${m.r}-${m.c}`]); // No moverse a especiales ya capturadas
        setSelectedKnightPos(currentKnightPos);
        setPossibleMoves(moves);
      } else {
         // Clic en casilla inválida, deseleccionar
        setSelectedKnightPos(null);
        setPossibleMoves([]);
      }
    } else if (clickedKnightColor && clickedKnightColor === currentPlayer) {
      // Seleccionar caballo si es del jugador actual y no hay selección previa
      const currentKnightPos = knights[currentPlayer];
      const otherKnightPos = knights[currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN];
      const moves = getPossibleKnightMoves(currentKnightPos.r, currentKnightPos.c, [otherKnightPos])
        .filter(m => !capturedSpecialSquares[`${m.r}-${m.c}`]);
      setSelectedKnightPos(currentKnightPos);
      setPossibleMoves(moves);
    }
  };

  const checkZoneConquest = (currentCaptures) => {
    const newConquered = {
        [PLAYER_COLORS.GREEN]: new Set(conqueredZones[PLAYER_COLORS.GREEN]),
        [PLAYER_COLORS.RED]: new Set(conqueredZones[PLAYER_COLORS.RED])
    };
    let changed = false;

    ZONES_DEFINITION_FOR_MAJORITY.forEach((zone, zoneIndex) => {
        let greenCount = 0;
        let redCount = 0;
        zone.forEach(sqKey => {
            if (currentCaptures[sqKey] === PLAYER_COLORS.GREEN) greenCount++;
            if (currentCaptures[sqKey] === PLAYER_COLORS.RED) redCount++;
        });

        if (greenCount >= 3 && !newConquered[PLAYER_COLORS.GREEN].has(zoneIndex)) {
            newConquered[PLAYER_COLORS.GREEN].add(zoneIndex);
            changed = true;
        }
        if (redCount >= 3 && !newConquered[PLAYER_COLORS.RED].has(zoneIndex)) {
            newConquered[PLAYER_COLORS.RED].add(zoneIndex);
            changed = true;
        }
    });
    if(changed) {
        setConqueredZones(newConquered);
    }
  };


  if (!gameStarted) {
    return <Modal onStartGame={handleStartGame} />;
  }

  return (
    <div className="app-container">
      <Scoreboard
        scores={scores}
        currentPlayer={currentPlayer}
        conqueredZonesCount={{
            [PLAYER_COLORS.GREEN]: conqueredZones[PLAYER_COLORS.GREEN].size,
            [PLAYER_COLORS.RED]: conqueredZones[PLAYER_COLORS.RED].size
        }}
        gameMode={gameMode}
      />
      {winner && (
        <div className="winner-message">
          {winner === 'TIE' ? '¡Es un Empate!' : `¡Ganador: ${winner === PLAYER_COLORS.GREEN ? 'Verde' : 'Rojo'}!`}
          <button onClick={resetGame}>Jugar de Nuevo</button>
        </div>
      )}
      {isAIThinking && (
        <div className="ai-thinking">
          La IA está pensando...
        </div>
      )}
      <Board
        knights={knights}
        selectedKnightPos={selectedKnightPos}
        possibleMoves={possibleMoves}
        onSquareClick={handleSquareClick}
        capturedSpecialSquares={capturedSpecialSquares}
        conqueredZones={conqueredZones}
      />
       <div className="turn-indicator">
        Turno de: <span style={{ 
          color: currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.GREEN : PLAYER_COLORS.RED, 
          fontWeight: 'bold' 
        }}>
          {currentPlayer === PLAYER_COLORS.GREEN ? 'Verde' : 'Rojo'}
          {gameMode === 'ai' && ` (${currentPlayer === PLAYER_COLORS.GREEN ? 'IA' : 'Humano'})`}
        </span>
      </div>
    </div>
  );
}

export default App;