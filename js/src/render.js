import { Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const CELL_SIZE = 8; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

export function init(canvas, universe) {
  const width = universe.width();
  const height = universe.height();

  // Give the canvas room for all of our cells and a 1px border
  // around each of them.
  canvas.height = (CELL_SIZE + 1) * height + 1;
  canvas.width = (CELL_SIZE + 1) * width + 1;

  const ctx = canvas.getContext('2d');
  render(ctx, universe);
  canvas.onclick = function (evt) {
    const columnToUpdate = parseInt(evt.offsetX / (CELL_SIZE + 1), 10);
    const rowToUpdate = parseInt(evt.offsetY / (CELL_SIZE + 1), 10);
    universe.toggle_cell(rowToUpdate, columnToUpdate);
    render(ctx, universe);
  };
  return ctx;
}

export function render(ctx, universe) {
  const width = universe.width();
  const height = universe.height();
  const cellsPtr = universe.get_cells_ptr();
  drawGrid(ctx, height, width);
  drawCells(ctx, cellsPtr, height, width);
}

function drawGrid(ctx, height, width) {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

function getIndex(row, column, width) {
  return row * width + column;
}

function drawCells(ctx, cellsPtr, height, width) {
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
  ctx.beginPath();

  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, width);
      if (cells[idx] === Cell.Dead) {
        ctx.fillRect(col * (CELL_SIZE + 1) + 1,
                     row * (CELL_SIZE + 1) + 1,
                     CELL_SIZE,
                     CELL_SIZE);
      }
    }
  }

  ctx.fillStyle = ALIVE_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, width);
      if (cells[idx] === Cell.Alive) {
        ctx.fillRect(col * (CELL_SIZE + 1) + 1,
                     row * (CELL_SIZE + 1) + 1,
                     CELL_SIZE,
                     CELL_SIZE);
      }
    }
  }
  ctx.stroke();
}
