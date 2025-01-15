const CellStatus = {
  DEAD: 0,
  ALIVE: 1,
};

class Cell {
  constructor(context, x, y, size) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;
    this.status = CellStatus.DEAD;
  }

  draw() {
    this.status === CellStatus.ALIVE
      ? (this.context.fillStyle = "#aa6f73")
      : (this.context.fillStyle = "#f6e0b5");
    this.context.strokeStyle = "black";
    this.context.lineWidth = 0.1;
    this.context.fillRect(this.x, this.y, this.size, this.size);
    this.context.strokeRect(this.x, this.y, this.size, this.size);
  }
}

class Grid {
  constructor(canvas, cellsPerColumn) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.cellsPerColumn = cellsPerColumn;
    this.generation = 0;
    this.cells = new Array(this.cellsPerColumn)
      .fill(null)
      .map(() => new Array(this.cellsPerColumn).fill(null));

    this.populateGrid();
    this.draw();
  }

  populateGrid() {
    var cellSize = this.canvasWidth / this.cellsPerColumn;

    for (let y = 0; y < this.cellsPerColumn; y++) {
      for (let x = 0; x < this.cellsPerColumn; x++) {
        this.cells[y][x] = new Cell(
          this.context,
          x * cellSize,
          y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  updateGeneration() {
    this.generation++;
    const nextGeneration = this.cells.map((row) =>
      row.map((cell) => new Cell(this.context, cell.x, cell.y, cell.size))
    );

    for (let y = 0; y < this.cells.length; y++) {
      for (let x = 0; x < this.cells[y].length; x++) {
        let cell = this.cells[y][x];
        let aliveNeighbors = 0;

        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        directions.forEach(([dy, dx]) => {
          const newY = y + dy;
          const newX = x + dx;
          if (
            newY >= 0 &&
            newY < this.cells.length &&
            newX >= 0 &&
            newX < this.cells[y].length &&
            this.cells[newY][newX].status === CellStatus.ALIVE
          ) {
            aliveNeighbors++;
          }
        });

        if (cell.status === CellStatus.ALIVE) {
          if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGeneration[y][x].status = CellStatus.DEAD;
          } else {
            nextGeneration[y][x].status = CellStatus.ALIVE;
          }
        } else {
          if (cell.status === CellStatus.DEAD && aliveNeighbors === 3) {
            nextGeneration[y][x].status = CellStatus.ALIVE;
          }
        }
      }
    }

    this.cells = nextGeneration;
  }

  draw() {
    this.cells.forEach((row) => row.forEach((cell) => cell.draw()));
  }

  clear() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  reset() {
    this.generation = 0;
    this.cells.forEach((row) =>
      row.forEach((cell) => (cell.status = CellStatus.DEAD))
    );
    this.draw();
  }
}

const canvas = document.getElementById("canvas");
const generationTag = document.getElementById("generation");

let grid = new Grid(canvas, 30);

canvas.addEventListener("click", (e) => {
  const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  const mouseY = e.clientY - canvas.getBoundingClientRect().top;

  for (let row of grid.cells) {
    let clickedCell = row.find(
      (cell) =>
        mouseX >= cell.x &&
        mouseX <= cell.x + cell.size &&
        mouseY >= cell.y &&
        mouseY <= cell.y + cell.size
    );
    if (clickedCell) {
      clickedCell.status = CellStatus.ALIVE;
      grid.draw();
    }
  }
});

let isPaused = true;

const pauseButton = document.getElementById("pause");

function togglePause() {
  pauseButton.innerText = isPaused ? "Pause" : "Start";
  isPaused = !isPaused;
}

pauseButton.addEventListener("click", () => {
  togglePause();
});

const resetButton = document.getElementById("reset");

resetButton.addEventListener("click", () => {
  //! Add reset logic

  grid.reset();
  generationTag.innerText = `Generation: ${grid.generation}`;
  togglePause();
});

function animate() {
  const frame = () => {
    if (!isPaused) {
      grid.clear();
      grid.draw();
      grid.updateGeneration();
      generationTag.innerText = `Generation: ${grid.generation}`;
    }
    requestAnimationFrame(frame);
  };
  frame();
}

animate();
