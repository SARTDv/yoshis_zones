import React, { useState, useEffect } from 'react';
import Board from './Board';
import Scoreboard from './Scoreboard';
import Modal from './Modal';
import '../styles/App.css';
import {
  PLAYER_COLORS,
  SPECIAL_ZONE_SQUARES,
  ZONES_DEFINITION_FOR_MAJORITY,
  getInitialKnightPositions,
} from '../constants';
import { getPossibleKnightMoves } from '../gameLogic/knightMoves';
import api from '../api/axiosInstance';

const encodeBoardState = (knights, capturedSpecialSquares) => {
  const board = Array(8).fill(null).map(() => Array(8).fill(0));

  // Marcar zonas especiales
  SPECIAL_ZONE_SQUARES.forEach(squareKey => {
    const [r, c] = squareKey.split('-').map(Number);
    if (capturedSpecialSquares[squareKey] === PLAYER_COLORS.GREEN) {
      board[r][c] = 4;
    } else if (capturedSpecialSquares[squareKey] === PLAYER_COLORS.RED) {
      board[r][c] = 5;
    } else {
      board[r][c] = 3;
    }
  });

  // Marcar caballos
  const green = knights[PLAYER_COLORS.GREEN];
  const red = knights[PLAYER_COLORS.RED];
  board[green.r][green.c] = 1;
  board[red.r][red.c] = 2;

  return board;
};


function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gameMode, setGameMode] = useState('friend'); // 'friend' o 'ai'
  const [difficulty, setDifficulty] = useState(null); // 'beginner', 'amateur', 'expert'
  const [knights, setKnights] = useState(getInitialKnightPositions()); // Posiciones aleatorias desde el inicio
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
    // Generar nuevas posiciones aleatorias para cada partida
    setKnights(getInitialKnightPositions());
    setCurrentPlayer(PLAYER_COLORS.GREEN);
    setSelectedKnightPos(null);
    setPossibleMoves([]);
    setCapturedSpecialSquares({});
    setScores({ [PLAYER_COLORS.GREEN]: 0, [PLAYER_COLORS.RED]: 0 });
    setConqueredZones({ [PLAYER_COLORS.GREEN]: new Set(), [PLAYER_COLORS.RED]: new Set() });
    setWinner(null);
    setGameStarted(true);
    setShowModal(false);
  };

  const handleStartGame = (mode, aiDifficulty) => {
    setGameMode(mode);
    setDifficulty(aiDifficulty);
    resetGame();
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

  //Funcion para llamar al back que maneja ia
  const fetchAIMove = async () => {
    const boardMatrix = encodeBoardState(knights, capturedSpecialSquares);
    const difficultyMap = {
        'beginner': 2,
        'amateur': 4,
        'expert': 6
    };
    
    // Obtener el valor numérico de la dificultad (default 2 si difficulty es null)
    const difficultyLevel = difficulty ? difficultyMap[difficulty.toLowerCase()] || 2 : 2;
    
    try {
      const response = await api.post('/api/matriz', {
        matriz: boardMatrix,
        dificultad: difficultyLevel
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AI move:', error);
      throw error;
    }
  };


  // Efecto para manejar el turno de la IA
  useEffect(() => {
    if (gameStarted && gameMode === 'ai' && currentPlayer === PLAYER_COLORS.GREEN && !winner) {
      setIsAIThinking(true);
      
      const executeAIMove = async () => {
        try {
          // Pequeño retraso para dar sensación de "pensamiento"
          await new Promise(resolve => setTimeout(resolve, 700));
          
          const bestMove = await fetchAIMove();
          
          if (bestMove) {
            // Si la API ya declara un ganador, reflejarlo en el frontend
            if (bestMove.ganador) {
              if (bestMove.ganador === 'verde') setWinner(PLAYER_COLORS.GREEN);
              else if (bestMove.ganador === 'rojo') setWinner(PLAYER_COLORS.RED);
              else if (bestMove.ganador === 'empate') setWinner('TIE');
            }
            // Si no hay ganador, continuar el flujo normal
            if (!bestMove.ganador) {
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
            }
          }
        } catch (error) {
          console.error('Error executing AI move:', error);
        } finally {
          setIsAIThinking(false);
        }
      };
      
      executeAIMove();
    }
  }, [gameStarted, gameMode, currentPlayer, knights, capturedSpecialSquares, difficulty, winner]);

  const handleSquareClick = async (r, c) => {
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
        // Capturar casilla especial si aplica
        const squareKey = `${r}-${c}`;
        let newCaptured = { ...capturedSpecialSquares };
        let newScores = { ...scores };
        if (SPECIAL_ZONE_SQUARES.has(squareKey) && !newCaptured[squareKey]) {
          newCaptured[squareKey] = currentPlayer;
          newScores[currentPlayer]++;
        }
        // Simular el nuevo tablero para consultar ganador
        const boardMatrix = encodeBoardState(newKnights, newCaptured);
        // Lógica de victoria local (jugador vs jugador)
        let winnerFromApi = null;
        try {
          const response = await api.post('/api/matriz', {
            matriz: boardMatrix,
            dificultad: 2 // dificultad dummy, no importa para PvP
          });
          if (response.data.ganador) {
            if (response.data.ganador === 'verde') winnerFromApi = PLAYER_COLORS.GREEN;
            else if (response.data.ganador === 'rojo') winnerFromApi = PLAYER_COLORS.RED;
            else if (response.data.ganador === 'empate') winnerFromApi = 'TIE';
          }
        } catch (e) {
          // Si la API falla, no bloquea el flujo
        }
        setKnights(newKnights);
        setCapturedSpecialSquares(newCaptured);
        setScores(newScores);
        checkZoneConquest(newCaptured);
        setSelectedKnightPos(null);
        setPossibleMoves([]);
        if (winnerFromApi) {
          setWinner(winnerFromApi);
        } else {
          setCurrentPlayer(currentPlayer === PLAYER_COLORS.GREEN ? PLAYER_COLORS.RED : PLAYER_COLORS.GREEN);
        }
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
      <div className="header-controls">
        <button className="settings-button" onClick={handleShowModal}>
          ⚙️ Configuración
        </button>
      </div>
      
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

      {showModal && (
        <Modal 
          onStartGame={handleStartGame} 
          onClose={handleCloseModal}
          isInGame={true}
        />
      )}

      {/*NO ME GUSTA QUE EMPUJE AL TABLERO */}
      {isAIThinking && (
        <div className="ai-thinking">
          La IA está pensando...
        </div>
      )}
    </div>
  );
}

export default App;