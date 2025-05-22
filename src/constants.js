export const BOARD_SIZE = 8;

export const PLAYER_COLORS = {
  GREEN: 'GREEN',
  RED: 'RED',
};

export const PLAYER_HEX_COLORS = {
  [PLAYER_COLORS.GREEN]: '#2ECC71',
  [PLAYER_COLORS.RED]: '#E74C3C',
  HIGHLIGHT: 'rgba(135, 206, 235, 0.6)',
  SPECIAL_ZONE_BORDER: 'rgba(255, 215, 0, 0.4)',
};

// Nuevas zonas especiales corregidas
const defineSpecialZoneSquares = () => {
  const zones = new Set();

  // Superior Izquierda (A8, B8, C8, A7, A6)
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 2, c: 0 }]
    .forEach(sq => zones.add(`${sq.r}-${sq.c}`));

  // Superior Derecha (H8, G8, F8, H7, H6)
  [{ r: 0, c: 7 }, { r: 0, c: 6 }, { r: 0, c: 5 }, { r: 1, c: 7 }, { r: 2, c: 7 }]
    .forEach(sq => zones.add(`${sq.r}-${sq.c}`));

  // Inferior Izquierda (A1, B1, C1, A2, A3)
  [{ r: 7, c: 0 }, { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 6, c: 0 }, { r: 5, c: 0 }]
    .forEach(sq => zones.add(`${sq.r}-${sq.c}`));

  // Inferior Derecha (H1, G1, F1, H2, H3)
  [{ r: 7, c: 7 }, { r: 7, c: 6 }, { r: 7, c: 5 }, { r: 6, c: 7 }, { r: 5, c: 7 }]
    .forEach(sq => zones.add(`${sq.r}-${sq.c}`));

  return zones;
};
export const SPECIAL_ZONE_SQUARES = defineSpecialZoneSquares();

// Definición para conteo de mayoría
export const ZONES_DEFINITION_FOR_MAJORITY = [
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 2, c: 0 }],
  [{ r: 0, c: 7 }, { r: 0, c: 6 }, { r: 0, c: 5 }, { r: 1, c: 7 }, { r: 2, c: 7 }],
  [{ r: 7, c: 0 }, { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 6, c: 0 }, { r: 5, c: 0 }],
  [{ r: 7, c: 7 }, { r: 7, c: 6 }, { r: 7, c: 5 }, { r: 6, c: 7 }, { r: 5, c: 7 }],
].map(zone => zone.map(sq => `${sq.r}-${sq.c}`));

// Obtener posición aleatoria fuera de las zonas especiales
const getRandomPositionOutsideZones = (excludedSquares) => {
  const allPositions = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r}-${c}`;
      if (!excludedSquares.has(key)) {
        allPositions.push({ r, c });
      }
    }
  }
  const randomIndex = Math.floor(Math.random() * allPositions.length);
  return allPositions[randomIndex];
};

// Posiciones iniciales aleatorias
export const getInitialKnightPositions = () => {
  return {
    [PLAYER_COLORS.GREEN]: getRandomPositionOutsideZones(SPECIAL_ZONE_SQUARES),
    [PLAYER_COLORS.RED]: getRandomPositionOutsideZones(SPECIAL_ZONE_SQUARES),
  };
};

