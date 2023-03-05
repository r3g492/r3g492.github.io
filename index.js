import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "./pkg/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 30; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";
const SELECTED_COLOR = "#00FF00";
const LINE_COLOR = "#FF0000";

// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;



const ctx = canvas.getContext('2d');

let animationId = null;
const renderLoop = () => {
    drawGrid();
    drawCells();
    drawLineWithlistOfIdxConnection();


    universe.tick();
    console.log(isConnected());
    result = -1;
    if (isConnected()) {
        console.log(maxConnection());
        result = maxConnection();
    }
    if (result === -1) {
        resultElement.textContent = "모든 노드를 포함하는 네트워크를 만들어보세요. 최대 연결 개수는 6개 입니다.";
    } else {
        resultElement.textContent = `네트워크가 완성 되었습니다. 네트워크에 포함된 연결 중 가장 긴 것은 ${result}의 길이를 가집니다.`;
    }

    animationId = requestAnimationFrame(renderLoop);
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
    playPauseButton.textContent = "RESET";
    renderLoop();
};

playPauseButton.addEventListener("click", event => {
    listOfIdxConnection = [];
    renderLoop();
});

const drawGrid = () => {
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
};

const getIndex = (row, column) => {
    return row * width + column;
};

let selectCount = 0; // Replace with the actual variable name and value
const selectedCountElement = document.getElementById('selected-count');

const listOfIdxConnectionElement = document.getElementById('list-of-idx-connection');

let listOfIdx = [];
// javaScript list of sets (new Set())
let listOfIdxConnection = [];
let listOfSelection = [];


const resultElement = document.getElementById('result');
let result = -1;


const setToArray = (set) => {
    return Array.from(set, idx => Number(idx));
};

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    selectedCountElement.textContent = `선택된 셀 : ${selectCount} 개`;
    if (selectCount > 2) {
        universe.reset_every_selected_to_alive();
    }
    if (listOfIdxConnection.length > 6) {
        listOfIdxConnection = [];
    }

    // show list of idx connection inside the sets

    listOfIdxConnectionElement.textContent = `연결 : ${JSON.stringify(listOfIdxConnection.map(setToArray))}`;


    // clear everything
    listOfIdx = [];
    listOfSelection = [];
    selectCount = 0;

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            if (listOfSelection.length === 2) {
                if (listOfIdxConnection.some(set => {
                    const arr = Array.from(set);
                    return arr.length === 2 && arr[0] === listOfSelection[0] && arr[1] === listOfSelection[1];
                })) {
                    listOfIdxConnection = listOfIdxConnection.filter(set => {
                        const arr = Array.from(set);
                        return !(arr.length === 2 && arr[0] === listOfSelection[0] && arr[1] === listOfSelection[1]);
                    });
                } else {
                    let set = new Set();
                    for (const idx of listOfSelection) {
                        set.add(idx);
                        console.log(idx);
                    }
                    console.log("hello");
                    listOfIdxConnection.push(set);
                }

                listOfSelection = [];

                universe.reset_every_selected_to_alive();
            }

            if (cells[idx] === Cell.Selected) {
                selectCount++;
                listOfSelection.push(idx);
            }

            if (cells[idx] === Cell.Alive || cells[idx] === Cell.Selected) {
                listOfIdx.push(idx);
            }

            ctx.fillStyle =
                cells[idx] === Cell.Dead
                ? DEAD_COLOR
                : cells[idx] === Cell.Alive
                ? ALIVE_COLOR
                : SELECTED_COLOR

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

const drawLineWithlistOfIdxConnection = () => {
    ctx.beginPath();

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 5;

    for (const set of listOfIdxConnection) {
        const [idx1, idx2] = Array.from(set);

        const row1 = Math.floor(idx1 / width);
        const col1 = idx1 % width;
        const row2 = Math.floor(idx2 / width);
        const col2 = idx2 % width;

        ctx.moveTo(
            col1 * (CELL_SIZE + 1) + CELL_SIZE / 2 + 1,
            row1 * (CELL_SIZE + 1) + CELL_SIZE / 2 + 1
        );
        ctx.lineTo(
            col2 * (CELL_SIZE + 1) + CELL_SIZE / 2 + 1,
            row2 * (CELL_SIZE + 1) + CELL_SIZE / 2 + 1
        );
    }

    ctx.stroke();
}

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    // universe.toggle_cell(row, col);
    universe.select_cell(row, col);

    drawGrid();
    drawCells();
    drawLineWithlistOfIdxConnection();
});

drawGrid();
drawCells();
drawLineWithlistOfIdxConnection();
play();

function isConnected() {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    // Get the set of all alive and selected cells
    const aliveSet = new Set(listOfIdx.filter(idx => cells[idx] !== Cell.Dead));

    // If there are no alive/selected cells, they are trivially connected
    if (aliveSet.size === 0) {
        return true;
    }

    // Iterate through all sets in listOfIdxConnection and add their elements to a new set
    const connectedSet = new Set();
    for (const set of listOfIdxConnection) {
        for (const idx of set) {
            connectedSet.add(idx);
        }
    }

    // Check if the set of all alive/selected cells is equal to the connected set
    return aliveSet.size === connectedSet.size;
}

function maxConnection() {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    const aliveSet = new Set(listOfIdx.filter(idx => cells[idx] === Cell.Alive || cells[idx] === Cell.Selected));

    if (aliveSet.size === 0) {
        return -1;
    }

    let maxLines = 0;

    // Build adjacency list
    const adjList = new Map();
    for (const set of listOfIdxConnection) {
        const [a, b] = Array.from(set);
        if (!adjList.has(a)) {
            adjList.set(a, []);
        }
        if (!adjList.has(b)) {
            adjList.set(b, []);
        }
        adjList.get(a).push(b);
        adjList.get(b).push(a);
    }

    // DFS to find longest path
    for (const start of aliveSet) {
        const visited = new Set();
        const stack = [[start, 0]];
        while (stack.length > 0) {
            const [node, dist] = stack.pop();
            visited.add(node);
            maxLines = Math.max(maxLines, dist);
            for (const neighbor of adjList.get(node)) {
                if (!visited.has(neighbor)) {
                    stack.push([neighbor, dist + 1]);
                }
            }
        }
    }

    return maxLines;
}