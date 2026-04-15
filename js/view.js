import { BLOCK, COLS, ROWS } from './constant.js';

export class TetrisView {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.nextCanvas = document.getElementById('next-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');
    this.holdCanvas = document.getElementById('hold-canvas');
    this.holdCtx = this.holdCanvas.getContext('2d');

    this.scoreEl = document.getElementById('score-display');
    this.levelEl = document.getElementById('level-display');
    this.linesEl = document.getElementById('lines-display');
    this.hiScoreEl = document.getElementById('hi-score');
    this.flashEl = document.getElementById('flash-overlay');
    this.levelUpEl = document.getElementById('levelup-msg');
    
    this.startOverlay = document.getElementById('start-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.gameOverOverlay = document.getElementById('gameover-overlay');
    this.finalScoreEl = document.getElementById('final-score');
  }

  drawBlock(ctx, x, y, color, glow, size = BLOCK, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    // Main fill
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    // Glow edge
    ctx.shadowColor = glow;
    ctx.shadowBlur = 8;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.shadowBlur = 0;
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 2, y + 2, size - 4, 4);
    ctx.fillRect(x + 2, y + 2, 4, size - 4);
    // Dark border
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    // P5 slash accent
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + size - 6, y + 2);
    ctx.lineTo(x + size - 2, y + 6);
    ctx.stroke();
    ctx.restore();
  }

  drawBoard(board, currentPiece, ghostY) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid background
    this.ctx.fillStyle = '#0d0d0d';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle grid lines
    this.ctx.strokeStyle = 'rgba(232,0,45,0.07)';
    this.ctx.lineWidth = 0.5;
    for (let c = 0; c <= COLS; c++) {
      this.ctx.beginPath(); this.ctx.moveTo(c * BLOCK, 0); this.ctx.lineTo(c * BLOCK, ROWS * BLOCK); this.ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      this.ctx.beginPath(); this.ctx.moveTo(0, r * BLOCK); this.ctx.lineTo(COLS * BLOCK, r * BLOCK); this.ctx.stroke();
    }

    // Board pieces
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          this.drawBlock(this.ctx, c * BLOCK, r * BLOCK, board[r][c].color, board[r][c].glow);
        }
      }
    }

    if (!currentPiece) return;

    // Ghost piece
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (!currentPiece.shape[r][c]) continue;
        const x = (currentPiece.x + c) * BLOCK;
        const y = (ghostY + r) * BLOCK;
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        this.ctx.strokeStyle = currentPiece.glow;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 1, y + 1, BLOCK - 2, BLOCK - 2);
        this.ctx.fillStyle = currentPiece.color;
        this.ctx.fillRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4);
        this.ctx.restore();
      }
    }

    // Current piece
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (!currentPiece.shape[r][c]) continue;
        this.drawBlock(this.ctx,
          (currentPiece.x + c) * BLOCK,
          (currentPiece.y + r) * BLOCK,
          currentPiece.color, currentPiece.glow
        );
      }
    }
  }

  drawMiniPiece(mctx, piece, cw, ch) {
    mctx.clearRect(0, 0, cw, ch);
    mctx.fillStyle = '#0d0d0d';
    mctx.fillRect(0, 0, cw, ch);
    if (!piece) return;
    const s = 18;
    const pw = piece.shape[0].length * s;
    const ph = piece.shape.length * s;
    const ox = (cw - pw) / 2;
    const oy = (ch - ph) / 2;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        this.drawBlock(mctx, ox + c * s, oy + r * s, piece.color, piece.glow, s);
      }
    }
  }

  drawNext(nextPiece) { this.drawMiniPiece(this.nextCtx, nextPiece, 100, 80); }
  
  drawHold(holdPiece, canHold) {
    this.drawMiniPiece(this.holdCtx, holdPiece, 100, 80);
    if (!canHold && holdPiece) {
      this.holdCtx.fillStyle = 'rgba(0,0,0,0.5)';
      this.holdCtx.fillRect(0, 0, 100, 80);
    }
  }

  updateUI(score, level, lines, hiScore) {
    this.scoreEl.textContent = score.toLocaleString();
    this.levelEl.textContent = level;
    this.linesEl.textContent = lines;
    this.hiScoreEl.textContent = hiScore.toLocaleString();
  }

  flashEffect() {
    this.flashEl.classList.add('flash');
    setTimeout(() => this.flashEl.classList.remove('flash'), 100);
  }

  showScorePop(pts, lines) {
    const el = document.createElement('div');
    el.className = 'score-pop';
    const labels = ['', '★', '★★', '★★★', 'ALL CLEAR!'];
    el.textContent = `+${pts} ${labels[lines] || ''}`;
    el.style.left = (Math.random() * 60 + 20) + '%';
    el.style.top = (Math.random() * 30 + 30) + '%';
    document.querySelector('.canvas-container').appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  showLevelUp(level) {
    this.levelUpEl.textContent = `LEVEL ${level}`;
    this.levelUpEl.style.display = 'block';
    this.levelUpEl.style.animation = 'none';
    void this.levelUpEl.offsetWidth;
    this.levelUpEl.style.animation = '';
    setTimeout(() => { this.levelUpEl.style.display = 'none'; }, 1200);
  }

  showStart() { this.startOverlay.classList.remove('hidden'); }
  hideStart() { this.startOverlay.classList.add('hidden'); }
  
  showPause(isPaused) { this.pauseOverlay.classList.toggle('hidden', !isPaused); }
  
  showGameOver(score) {
    this.finalScoreEl.textContent = score.toLocaleString();
    this.gameOverOverlay.classList.remove('hidden');
  }
  hideGameOver() { this.gameOverOverlay.classList.add('hidden'); }
}
