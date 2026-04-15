export class TetrisController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.gameRunning = false;
    this.gamePaused = false;
    this.lastTime = 0;
    this.dropCounter = 0;

    this.initEventListeners();
    this.view.updateUI(this.model.score, this.model.level, this.model.lines, this.model.hiScore);
    this.draw();
  }

  initEventListeners() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());

    document.addEventListener('keydown', e => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    if (!this.gameRunning && !this.model.gameOver) {
      if (e.code === 'Enter' || e.code === 'Space') { this.startGame(); return; }
      return;
    }
    if (this.model.gameOver) { if (e.code === 'Enter') this.restartGame(); return; }

    if (e.code === 'KeyP' || e.code === 'Escape') { this.pauseGame(); return; }
    if (this.gamePaused) return;

    switch (e.code) {
      case 'ArrowLeft':
        if (this.model.isValid(this.model.currentPiece, -1, 0)) this.model.currentPiece.x--;
        break;
      case 'ArrowRight':
        if (this.model.isValid(this.model.currentPiece, 1, 0)) this.model.currentPiece.x++;
        break;
      case 'ArrowDown':
        if (this.model.isValid(this.model.currentPiece, 0, 1)) {
          this.model.currentPiece.y++;
          this.model.score++;
          this.view.updateUI(this.model.score, this.model.level, this.model.lines, this.model.hiScore);
        } else {
          this.lockAndCheck();
        }
        break;
      case 'ArrowUp':
        this.rotatePiece();
        break;
      case 'Space':
        e.preventDefault();
        this.hardDrop();
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        if (this.model.holdAction()) {
          this.view.drawHold(this.model.holdPiece, this.model.canHold);
        }
        break;
    }
    this.draw();
  }

  rotatePiece() {
    const rot = this.model.rotate(this.model.currentPiece);
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (this.model.isValid({ ...this.model.currentPiece, x: this.model.currentPiece.x + k }, 0, 0, rot)) {
        this.model.currentPiece.shape = rot;
        this.model.currentPiece.x += k;
        break;
      }
    }
  }

  hardDrop() {
    while (this.model.isValid(this.model.currentPiece, 0, 1)) {
      this.model.currentPiece.y++;
      this.model.score += 2;
    }
    this.lockAndCheck();
  }

  lockAndCheck() {
    const result = this.model.lockPiece();
    if (result) {
      this.view.flashEffect();
      this.view.showScorePop(result.pts, result.lines);
      if (result.levelUp) this.view.showLevelUp(this.model.level);
    }
    if (this.model.gameOver) {
      this.endGame();
    }
    this.view.updateUI(this.model.score, this.model.level, this.model.lines, this.model.hiScore);
    this.view.drawNext(this.model.nextPiece);
    this.view.drawHold(this.model.holdPiece, this.model.canHold);
  }

  getDropInterval() {
    return Math.max(80, 1000 - (this.model.level - 1) * 85);
  }

  gameLoop(timestamp) {
    if (!this.gameRunning || this.gamePaused || this.model.gameOver) return;
    const delta = timestamp - (this.lastTime || timestamp);
    this.lastTime = timestamp;
    this.dropCounter += delta;

    if (this.dropCounter >= this.getDropInterval()) {
      this.dropCounter = 0;
      if (this.model.isValid(this.model.currentPiece, 0, 1)) {
        this.model.currentPiece.y++;
      } else {
        this.lockAndCheck();
      }
    }
    this.draw();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  draw() {
    this.view.drawBoard(this.model.board, this.model.currentPiece, this.model.getGhostY());
    this.view.drawNext(this.model.nextPiece);
    this.view.drawHold(this.model.holdPiece, this.model.canHold);
  }

  startGame() {
    this.view.hideStart();
    this.model.reset();
    this.model.spawnPiece();
    this.gameRunning = true;
    this.gamePaused = false;
    this.lastTime = 0;
    this.dropCounter = 0;
    this.view.updateUI(this.model.score, this.model.level, this.model.lines, this.model.hiScore);
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  pauseGame() {
    if (!this.gameRunning || this.model.gameOver) return;
    this.gamePaused = !this.gamePaused;
    this.view.showPause(this.gamePaused);
    if (!this.gamePaused) {
      this.lastTime = 0;
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  resumeGame() {
    if (this.gamePaused) this.pauseGame();
  }

  endGame() {
    this.gameRunning = false;
    this.view.showGameOver(this.model.score);
  }

  restartGame() {
    this.view.hideGameOver();
    this.startGame();
  }
}
