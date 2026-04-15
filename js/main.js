import { TetrisModel } from './model.js';
import { TetrisView } from './view.js';
import { TetrisController } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
    const model = new TetrisModel();
    const view = new TetrisView();
    const controller = new TetrisController(model, view);
});
