"use strict";

function createMat(ROWS, COLS) {
  const mat = [];
  for (var i = 0; i < ROWS; i++) {
    const row = [];
    for (var j = 0; j < COLS; j++) {
      row.push("");
    }
    mat.push(row);
  }
  return mat;
}

function countNegBalls(cellI, cellJ, board) {
  let countBalls = 0;

  for (let i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (let j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === cellI && j === cellJ) continue;

      if (board[i][j].gameElement === POKEMON) countBalls++;
    }
  }

  return countBalls;
}

function getEmptyCell(board) {
  let emptyCells = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const currCell = board[i][j];
      if (currCell.type === FLOOR && currCell.gameElement === null) {
        emptyCells.push({ i, j });
      }
    }
  }

  if (!emptyCells.length) return null;

  const randomIdx = getRandomInt(0, emptyCells.length - 1);
  return emptyCells[randomIdx];
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}
