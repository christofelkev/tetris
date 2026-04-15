import { COLS, ROWS, PIECES, PIECE_KEYS, SCORE_TABLE } from './constant.js';

export class TetrisModel {
  constructor() {
    this.reset();
    this.hiScore = parseInt(localStorage.getItem('p5tetris_hi') || '0');
  }

  reset() {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.holdPiece = null;
    this.canHold = true;
    this.bag = [];
    this.gameOver = false;
    this.currentPiece = null;
    this.nextPiece = null;
  }

  getFromBag() {
    if (this.bag.length === 0) {
      this.bag = [...PIECE_KEYS];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }

  createPiece(key) {
    const p = PIECES[key];
    const shape = p.shape.map(r => [...r]);
    return {
      key,
      shape,
      color: p.color,
      glow: p.glow,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece || this.createPiece(this.getFromBag());
    this.nextPiece = this.createPiece(this.getFromBag());
    this.canHold = true;
    if (!this.isValid(this.currentPiece, 0, 0)) {
      this.gameOver = true;
    }
  }

  rotate(piece) {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        rotated[c][rows - 1 - r] = piece.shape[r][c];
    return rotated;
  }

  isValid(piece, dx, dy, shape) {
    shape = shape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = piece.x + c + dx;
        const ny = piece.y + r + dy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
        if (ny >= 0 && this.board[ny][nx]) return false;
      }
    }
    return true;
  }

  lockPiece() {
    for (let r = 0; r < this.currentPiece.shape.length; r++) {
      for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
        if (!this.currentPiece.shape[r][c]) continue;
        const ny = this.currentPiece.y + r;
        if (ny < 0) {
          this.gameOver = true;
          return;
        }
        this.board[ny][this.currentPiece.x + c] = {
          color: this.currentPiece.color,
          glow: this.currentPiece.glow
        };
      }
    }
    const cleared = this.clearLines();
    this.spawnPiece();
    return cleared;
  }

  clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(c => c !== null)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    if (cleared > 0) {
      const pts = SCORE_TABLE[cleared] * this.level;
      this.score += pts;
      this.lines += cleared;
      const newLevel = Math.floor(this.lines / 10) + 1;
      let levelUp = false;
      if (newLevel > this.level) {
        this.level = newLevel;
        levelUp = true;
      }
      if (this.score > this.hiScore) {
        this.hiScore = this.score;
        localStorage.setItem('p5tetris_hi', this.hiScore);
      }
      return { lines: cleared, pts, levelUp };
    }
    return null;
  }

  getGhostY() {
    let dy = 0;
    while (this.isValid(this.currentPiece, 0, dy + 1)) dy++;
    return this.currentPiece.y + dy;
  }

  holdAction() {
    if (!this.canHold) return false;
    this.canHold = false;
    if (!this.holdPiece) {
      this.holdPiece = this.createPiece(this.currentPiece.key);
      this.spawnPiece();
    } else {
      const tmp = this.createPiece(this.holdPiece.key);
      this.holdPiece = this.createPiece(this.currentPiece.key);
      this.currentPiece = tmp;
      this.currentPiece.x = Math.floor(COLS / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
      this.currentPiece.y = 0;
    }
    return true;
  }
}
