export const COLS = 10;
export const ROWS = 20;
export const BLOCK = 30;

// P5R Color palette for pieces
export const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#e8002d', glow: '#ff1744' },
  O: { shape: [[1, 1], [1, 1]], color: '#ffd600', glow: '#ffea00' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#9c27b0', glow: '#ce93d8' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00bcd4', glow: '#4dd0e1' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff5722', glow: '#ff8a65' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3f51b5', glow: '#7986cb' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f5f0e8', glow: '#ffffff' },
};

export const PIECE_KEYS = Object.keys(PIECES);

// Scoring
export const SCORE_TABLE = [0, 100, 300, 500, 800];
export const SCORE_MULT = [0, 1, 3, 5, 8];
