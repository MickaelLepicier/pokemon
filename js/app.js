"use strict";

// Model:
var gBoard;
var gGamerPos;
var gPokemons;
var gBallsCollected;
var gBallCount;
var gIsGlued;
var gIsCandy;

var gBallInterval;
var gGlueInterval;
var gCandyInterval;

var gGlueTimeOut;
var gCandyTimeOut;

const WALL = "WALL";
const FLOOR = "FLOOR";
const POKEMON = "POKEMON";
const GAMER = "GAMER";
const GLUE = "GLUE";
const CANDY = "CANDY";

// DOM:
// Img:
const GAMER_IMG = '<img src="img/gamer.png">';
const POKEMON_IMG = '<img src="img/pokemons/pikachu.png">'; // later on delete the str
const GLUE_IMG = '<img src="img/glue.png">';
const CANDY_IMG = '<img src="img/candy.jpg">'; // download img for that
const GAMER_GLUED_IMG = '<img src="img/gamer-glued.png">';
const SUPER_GAMER_IMG = '<img src="img/super-gamer.png">';

// Sound:
const COLLECT_SOUND = new Audio("sound/collect.mp3");

// BUGs:
// The only bug is that the player
// disappear when he is on Candy and then on Glue

// --------------------------------------------------------------------------------------------------------------------------------
// Model Functions

function onInitGame() {
  gBallCount = 0;
  gBallsCollected = 0;
  gIsGlued = false;
  gIsCandy = false;

  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  gPokemons = createPokemons();
  renderBoard(gBoard);
  ballCollected();

  gBallInterval = setInterval(() => addItem(POKEMON, POKEMON_IMG), 3000); // 100
  gGlueInterval = setInterval(() => addItem(GLUE, GLUE_IMG), 5000); // 100
  gCandyInterval = setInterval(() => addItem(CANDY, CANDY_IMG), 5000); // 100

  gGlueTimeOut = null;
  gCandyTimeOut = null;

  const elRestartBtn = document.querySelector(".restart-btn");
  elRestartBtn.classList.add("hidden");
}

function buildBoard() {
  const board = [];
  const rowsCount = 11;
  const colsCount = 13;
  for (var i = 0; i < rowsCount; i++) {
    board[i] = [];
    for (var j = 0; j < colsCount; j++) {
      board[i][j] = { type: FLOOR, gameElement: null };
      if (i === 0 || i === rowsCount - 1 || j === 0 || j === colsCount - 1) {
        board[i][j].type = WALL;
      }
    }
  }
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  board[0][6].type =
    board[rowsCount - 1][6].type =
    board[5][colsCount - 1].type =
    board[5][0].type =
      FLOOR;

  return board;
}

function renderBoard(board) {
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>";

    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j];
      var cellClass = getClassName({ i: i, j: j });

      if (currCell.type === FLOOR) cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";
      strHTML += `<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >`;

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === POKEMON) {
        strHTML += POKEMON_IMG;
      } else if (currCell.gameElement === GLUE) {
        strHTML += GLUE_IMG;
      } else if (currCell.gameElement === CANDY) {
        strHTML += CANDY_IMG;
      }
      strHTML += "</td>";
    }
    strHTML += "</tr>";
  }

  const elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  if (gIsGlued && !gIsCandy) return;

  const lastRowIdx = gBoard.length - 1;
  const lastColIdx = gBoard[0].length - 1;

  if (i < 0) i = lastRowIdx;
  if (i > lastRowIdx) i = 0;
  if (j < 0) j = lastColIdx;
  if (j > lastColIdx) j = 0;

  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i);
  const jAbsDiff = Math.abs(j - gGamerPos.j);

  if (
    iAbsDiff + jAbsDiff === 1 ||
    iAbsDiff === lastRowIdx ||
    jAbsDiff === lastColIdx
  ) {
    const targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;
    if (targetCell.gameElement === POKEMON) {
      updateBallCount(-1);
      COLLECT_SOUND.play();
      gBallsCollected++;
      ballCollected();
      checkVictory();
    } else if (targetCell.gameElement === GLUE && !gIsCandy) {
      gIsGlued = true;
      clearTimeout(gGlueTimeOut);
      updateGamer({ i, j }, GAMER_GLUED_IMG);

      setTimeout(() => {
        gIsGlued = false;
        renderCell(gGamerPos, GAMER_IMG);
      }, 3000);
      return;
    } else if (targetCell.gameElement === CANDY) {
      gIsCandy = true;
      // clearTimeout(gGlueTimeOut); // If it's on the bug is fixed but it makes other bug... - when player step on candy the glue don't disappear
      clearTimeout(gCandyTimeOut);
      updateGamer({ i, j }, SUPER_GAMER_IMG);

      setTimeout(() => {
        gIsCandy = false;
        renderCell(gGamerPos, GAMER_IMG);
      }, 3000); // 5000
      return;
    }

    const gamerImg = gIsCandy ? SUPER_GAMER_IMG : GAMER_IMG;

    updateGamer({ i, j }, gamerImg);
  }
}

function updateGamer(targetCell, gamerImg) {
  const { i, j } = targetCell;

  //* REMOVE FROM LAST CELL
  gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
  renderCell(gGamerPos, "");

  //* ADD TO NEXT CELL
  gGamerPos = { i, j };
  gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
  renderCell(gGamerPos, gamerImg);

  updateNegBallCount(gGamerPos, gBoard);
}

function renderCell(location, value) {
  const cellSelector = "." + getClassName(location);
  const elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Returns the class name for a specific cell
function getClassName(location) {
  const cellClass = `cell-${location.i}-${location.j}`;
  return cellClass;
}

// Move the player by keyboard arrows
function onKey(ev) {
  const i = gGamerPos.i;
  const j = gGamerPos.j;

  switch (ev.key) {
    case "ArrowLeft":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      moveTo(i + 1, j);
      break;
  }
}

function addItem(item, itemImg) {
  const emptyCell = getEmptyCell(gBoard);
  if (!emptyCell) {
    checkVictory(true);
    return;
  }

  if (item === POKEMON) {
    // itemImg = '<img src="img/1.png">';
    itemImg = getPokemonImg();
    updateBallCount(1);
  }

  // Update Model
  gBoard[emptyCell.i][emptyCell.j].gameElement = item;
  // Update DOM
  renderCell(emptyCell, itemImg);
  if (item === GLUE) {
    gGlueTimeOut = setTimeout(() => {
      gBoard[emptyCell.i][emptyCell.j].gameElement = null;
      renderCell(emptyCell, "");
    }, 3000);
  } else if (item === CANDY) {
    gCandyTimeOut = setTimeout(() => {
      gBoard[emptyCell.i][emptyCell.j].gameElement = null;
      renderCell(emptyCell, "");
    }, 3000); // 2000
  }
}

function getPokemonImg() {
  const randomIdx = getRandomInt(0, gPokemons.length - 1);
  const pokemon = gPokemons[randomIdx];
  gPokemons.slice(1, randomIdx);
  return `<img src="img/pokemons/${pokemon}.png">`;
  // '<img src="img/1.png">'
}

function createPokemons() {
  return [
    "alakazam",
    "articuno",
    "blastoise",
    "bulbasaur",
    "chansey",
    "charmander",
    "charizard",
    "clefairy",
    "cubone",
    "dragonite",
    "eevee",
    "flareon",
    "flareon",
    "gengar",
    "geodude",
    "golduck",
    "hitmonchan",
    "hitmonlee",
    "ho-oh",
    "jigglypuff",
    "jolteon",
    "kabutops",
    "lugia",
    "machamp",
    "machoke",
    "marowak",
    "mew",
    "mewtwo",
    "moltres",
    "onix",
    "pidgeot",
    "pikachu",
    "poliwrath",
    "primeape",
    "psyduck",
    "scyther",
    "snorlax",
    "squirtle",
    "starmie",
    "staryu",
    "togepi",
    "vaporeon",
    "venusaur",
    "voltorb",
    "zapdos",
    "mega-charizard-x",
  ];
}

function updateBallCount(diff) {
  gBallCount += diff;
  document.querySelector(".pokemons-balls span").innerText = gBallCount;
}

function ballCollected() {
  const elBallCollected = document.querySelector(".pokemons-collected span");
  elBallCollected.innerText = gBallsCollected;
}

function updateNegBallCount(gamerPos, board) {
  let countBalls = countNegBalls(gamerPos.i, gamerPos.j, board);
  const elHeader = document.querySelector(".pokemons-around-you span");
  elHeader.innerText = countBalls;
}

function checkVictory(playerLose = false) {
  if (gBallCount && !playerLose) return;

  clearInterval(gBallInterval);
  clearInterval(gGlueInterval);
  clearInterval(gCandyInterval);

  const elRestartBtn = document.querySelector(".restart-btn");
  elRestartBtn.classList.remove("hidden");

  const elHeader = document.querySelector("h1");

  elHeader.innerText = playerLose ? "You Lost!" : "You Won!";
}
