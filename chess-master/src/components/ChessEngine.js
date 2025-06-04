import wK from "./piecePics/wK.png";
import wQ from "./piecePics/wQ.png";
import wR from "./piecePics/wR.png";
import wB from "./piecePics/wB.png";
import wN from "./piecePics/wN.png";
import wP from "./piecePics/wP.png";
import bK from "./piecePics/bK.png";
import bQ from "./piecePics/bQ.png";
import bR from "./piecePics/bR.png";
import bB from "./piecePics/bB.png";
import bN from "./piecePics/bN.png";
import bP from "./piecePics/bP.png";

import { userService } from "../services/userService.ts";

// ===== Chess Game Variables and Functions =====
let board = [];
let currentTurn = "white"; // white starts
let selectedSquare = null;
let gameMode = null; // either 'sandbox', 'afnan', or 'engine'

let whiteKingIndex = 60;
let blackKingIndex = 4;
const depth = 10;
let totalMoves = 0; // Total moves made in the game, used for move count display

let selectedMoves = [];
let whiteCastleKingside = true;
let whiteCastleQueenside = true;
let blackCastleKingside = true;
let blackCastleQueenside = true;

let enPassantSquare = null;

const userName = userService.getCurrentUser();
let userStats = userService.getUserStats(userName);

const pieceSymbols = {
  K_white: wK,
  Q_white: wQ,
  R_white: wR,
  B_white: wB,
  N_white: wN,
  P_white: wP,
  K_black: bK,
  Q_black: bQ,
  R_black: bR,
  B_black: bB,
  N_black: bN,
  P_black: bP,
};
const pieceVal = {
  N: 3,
  Q: 9,
  R: 5,
  B: 3,
  K: 100,
  P: 1,
};

export function initBoard(gameModeParam) {
  selectedMoves = [];
  whiteCastleKingside = true;
  whiteCastleQueenside = true;
  blackCastleKingside = true;
  blackCastleQueenside = true;
  enPassantSquare = null;
  selectedSquare = null;
  totalMoves = 0;
  currentTurn = "white";
  document.getElementById("black-captured").textContent === "-";
  document.getElementById("white-captured").textContent === "-";
  document.getElementById("moves-number").textContent = "0 moves made";

  gameMode = gameModeParam;
  board = new Array(64).fill(null);

  //Each piece is stored as a JavaScript object
  // Black pieces (top row is row 0)
  board[0] = { type: "R", color: "black" };
  board[1] = { type: "N", color: "black" };
  board[2] = { type: "B", color: "black" };
  board[3] = { type: "Q", color: "black" };
  board[4] = { type: "K", color: "black" };
  board[5] = { type: "B", color: "black" };
  board[6] = { type: "N", color: "black" };
  board[7] = { type: "R", color: "black" };
  for (let i = 8; i < 16; i++) {
    board[i] = { type: "P", color: "black" };
  }

  // White pieces (bottom rows)
  board[56] = { type: "R", color: "white" };
  board[57] = { type: "N", color: "white" };
  board[58] = { type: "B", color: "white" };
  board[59] = { type: "Q", color: "white" };
  board[60] = { type: "K", color: "white" };
  board[61] = { type: "B", color: "white" };
  board[62] = { type: "N", color: "white" };
  board[63] = { type: "R", color: "white" };
  for (let i = 48; i < 56; i++) {
    board[i] = { type: "P", color: "white" };
  }
}

// Render the chess board inside the #chess-board div
export function renderBoard() {
  const boardDiv = document.getElementById("chess-board");
  //If the board was called before, this would delete all the previous info on the board and start from scratch
  boardDiv.innerHTML = "";
  for (let i = 0; i < 64; i++) {
    //Creates a div element with Javascript variable square
    const square = document.createElement("div");
    //Adds a CSS class for square
    square.classList.add("square");
    const row = Math.floor(i / 8);
    const col = i % 8;
    // Adds either the light or dark CSS class to the square (to alternate colors)
    square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
    square.dataset.index = i;
    if (selectedSquare === i) {
      square.classList.add("highlight-selected");
    }
    const piece = board[i];
    if (piece) {
      const key = piece.type + "_" + piece.color;
      const img = document.createElement("img");
      img.src = pieceSymbols[key];
      img.alt = key;
      img.classList.add("chess-piece");
      square.appendChild(img);
    }
    if (selectedMoves.includes(i)) {
      const dot = document.createElement("div");
      dot.classList.add("highlight-move");
      square.appendChild(dot);
    }
    square.addEventListener("click", handleSquareClick);
    boardDiv.appendChild(square);
  }
  document.getElementById("game-info").textContent =
    currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1) + "'s turn";
  totalMoves += 0.25;
}

function handleSquareClick(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  const piece = board[index];
  const square = e.currentTarget;

  // moveKingInCheckPopup.style.display = 'none';

  if (selectedSquare === null) {
    if (piece && piece.color === currentTurn) {
      selectedSquare = index;
      selectedMoves = generateMoves(selectedSquare, piece);
      renderBoard();
    }
  } else {
    if (selectedSquare === index) {
      selectedSquare = null;
      selectedMoves = [];
      renderBoard();
      return;
    }

    const movingPiece = board[selectedSquare];
    const movingTo = board[index];

    // Prevent moving to your own piece
    if (piece && piece.color === currentTurn) {
      selectedSquare = index;
      selectedMoves = generateMoves(selectedSquare, movingTo);
      renderBoard();
      return;
    }

    // selectedMoves = generateMoves(selectedSquare, movingPiece);

    if (
      (selectedMoves.length > 0 && !selectedMoves.includes(index)) ||
      !legal(selectedSquare, index)
    ) {
      //Run legal code
      console.log("Illegal move: Piece can't move here.");
      illegalMoveCSS();
      board[selectedSquare] = movingPiece;
      board[index] = movingTo;
      return;
    }

    move(selectedSquare, index);

    if (movingPiece.type === "K") {
      if (movingPiece.color === "white") {
        whiteKingIndex = index;
      } else {
        blackKingIndex = index;
      }
    } else if (movingPiece.type === "P") {
      if (index == enPassantSquare) {
        let pawnCapIndex =
          board[index].color === "white" ? index + 8 : index - 8;
        board[pawnCapIndex] = null;
      }

      if (Math.abs(index - selectedSquare) === 16) {
        enPassantSquare = (index + selectedSquare) / 2;
      } else {
        enPassantSquare = null;
      }
    } else {
      enPassantSquare = null;
    }

    // Check if king is captured
    if (piece && piece.type === "K") {
       
      userService.updateUserStats(userName, {
        gamesPlayed: userStats.gamesPlayed + 1,
        gamesWon: userStats.gamesWon + 1,
        winStreak: userStats.winStreak + 1,
      });
      gameOver();
    }

    if (!kingSafe()) {
      console.log("Illegal move: You can't leave your king in check.");
      moveToCheck(); //CSS function
      board[selectedSquare] = movingPiece;
      board[index] = movingTo;
      return;
    }

    currentTurn = currentTurn === "white" ? "black" : "white";

    if (checkMate()) {
       
      userService.updateUserStats(userName, {
        gamesPlayed: userStats.gamesPlayed + 1,
        gamesWon: userStats.gamesWon + 1,
        winStreak: userStats.winStreak + 1,
      });
      gameOver();
    }

    if (
      whiteCastleQueenside ||
      whiteCastleKingside ||
      blackCastleQueenside ||
      blackCastleKingside
    ) {
      if (movingPiece.type === "R") {
        if (movingPiece.color === "white") {
          if (selectedSquare === 56) whiteCastleQueenside = false; // a1 rook
          if (selectedSquare === 63) whiteCastleKingside = false; // h1 rook
        } else {
          if (selectedSquare === 0) blackCastleQueenside = false; // a8 rook
          if (selectedSquare === 7) blackCastleKingside = false; // h8 rook
        }
      }
      if (movingTo && movingTo.type === "R") {
        if (movingTo.color === "white") {
          if (index === 56) whiteCastleQueenside = false; // a1 rook
          if (index === 63) whiteCastleKingside = false; // h1 rook
        } else {
          if (index === 0) blackCastleQueenside = false; // a8 rook
          if (index === 7) blackCastleKingside = false; // h8 rook
        }
      }
    }

    if (movingPiece.type === "K") {
      if (movingPiece.color === "white") {
        whiteCastleKingside = false;
        whiteCastleQueenside = false;
      } else {
        blackCastleKingside = false;
        blackCastleQueenside = false;
      }
      if (selectedSquare === 60) {
        if (index === 62) {
          board[61] = board[63]; // Move rook to f1
          board[63] = null; // Remove rook from h1
        } else if (index === 58) {
          board[59] = board[56]; // Move rook to d1
          board[56] = null; // Remove rook from a1
        }
      } else if (selectedSquare === 4) {
        if (index === 6) {
          board[5] = board[7]; // Move rook to f8
          board[7] = null; // Remove rook from h8
        } else if (index === 2) {
          board[3] = board[0]; // Move rook to d8
          board[0] = null; // Remove rook from a8
        }
      }
    }
    document.getElementById("moves-number").textContent =
      Math.floor(totalMoves) + " moves made";
    if (movingTo) {
      if (currentTurn !== "white") {
        if (document.getElementById("white-captured").textContent === "") {
          document.getElementById("white-captured").textContent = movingTo.type;
        } else {
          document.getElementById("white-captured").textContent +=
            ", " + movingTo.type;
        }
      } else {
        if (document.getElementById("black-captured").textContent === "") {
          document.getElementById("black-captured").textContent = movingTo.type;
        } else {
          document.getElementById("black-captured").textContent +=
            ", " + movingTo.type;
        }
      }
    }
    selectedMoves = [];
    renderBoard();

    // Bot move
    if (gameMode !== "sandbox" && currentTurn === botColor()) {
      setTimeout(botMove, 500);
    }
  }
}

function legal(from, to) {
  let test = generateMoves(from, board[from]);
  return test.includes(to);
}

function isSquareAttacked(index, attackerColor) {
  for (let i = 0; i < 64; i++) {
    const attacker = board[i];
    if (attacker && attacker.color === attackerColor) {
      const moves = generateMoves(i, attacker, true);
      if (moves.includes(index)) return true;
    }
  }
  return false;
}

function checkMate() {
  const kinIndex = currentTurn === "white" ? whiteKingIndex : blackKingIndex;

  if (!kingSafe()) {
    for (let i = 0; i < 64; i++) {
      if (board[i] && board[i].color === currentTurn) {
        let moves = generateMoves(i, board[i]);
        if (moves.length > 0) {
          return false; // Not CheckMate
        }
      }
    }
    return true; // CheckMate
  }
  return false; //Not Checkmate, could be stalemate
}

function botColor() {
  // In bot games we assume the human is white.
  return "black";
}

function points(piece) {
  if (piece) {
    return pieceVal[piece.type];
  } else {
    return 0;
  }
  return 0;
}

function evaluateBoard() {
  let evaluation = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i]) {
      if (board[i].color === botColor()) {
        evaluation += points(board[i]);
      } else {
        evaluation -= points(board[i]);
      }
    }
  }
  return evaluation;
}

function getFen() {
  let fen = "";
  let count = 0;
  for (let i = 0; i < 64; i++) {
    if (i % 8 === 0 && i !== 0) {
      fen += count > 0 ? count : "";
      count = 0;
      fen += "/";
    }
    if (board[i]) {
      if (count > 0) {
        fen += count;
      }
      count = 0;
      if (board[i].color === "white") {
        fen += board[i].type;
      } else {
        fen += board[i].type.toLowerCase();
      }
    } else {
      count++;
    }
  }
  // fen += " b - - 0 1";
  fen += " b ";
  if (whiteCastleKingside) fen += "K";
  if (whiteCastleQueenside) fen += "Q";
  if (blackCastleKingside) fen += "k";
  if (blackCastleQueenside) fen += "q";
  if (
    !whiteCastleKingside &&
    !whiteCastleQueenside &&
    !blackCastleKingside &&
    !blackCastleQueenside
  )
    fen += "-";
  fen += " - 0 1";
  return fen;
}

function move(start, end) {
  board[end] = board[start];
  board[start] = null;
}

function kingSafe(customKingIndex = null) {
  const kingIndex =
    customKingIndex !== null
      ? customKingIndex
      : currentTurn === "white"
      ? whiteKingIndex
      : blackKingIndex;
  return !isSquareAttacked(
    kingIndex,
    currentTurn === "white" ? "black" : "white"
  );
}

function generateMoves(i, piece, ignoreKingCheck = false) {
  const directions = [];

  const isOpponent = (target) =>
    board[target] && board[target].color !== piece.color;

  const sameRow = (a, b) => Math.floor(a / 8) === Math.floor(b / 8);
  // if (to >= 0 && to < 64 && (!board[to] || isOpponent(to)))
  const tryAdd = (to) => {
    const originalFrom = board[i];
    const originalTo = board[to];
    move(i, to);

    const movingKing = originalFrom.type === "K";
    const tempKingIndex = movingKing ? to : null;

    const safe = ignoreKingCheck || kingSafe(tempKingIndex);
    if (safe) directions.push(to);
    board[i] = originalFrom;
    board[to] = originalTo;
  };

  if (piece.type === "P") {
    const dir = piece.color === "white" ? -8 : 8;
    const startRow = piece.color === "white" ? 6 : 1;

    if (i + dir >= 0 && i + dir < 64 && !board[i + dir]) {
      tryAdd(i + dir);
      if (Math.floor(i / 8) === startRow && !board[i + dir * 2]) {
        tryAdd(i + dir * 2);
      }
    }

    // Captures
    const captureOffsets = piece.color !== "white" ? [7, 9] : [-7, -9];
    for (let offset of captureOffsets) {
      const to = i + offset;
      if (
        to >= 0 &&
        to < 64 &&
        board[to] &&
        isOpponent(to) &&
        Math.abs((to % 8) - (i % 8)) === 1
      ) {
        tryAdd(to);
      }
    }

    //en passant
    if (
      enPassantSquare !== null &&
      Math.abs((enPassantSquare % 8) - (i % 8)) === 1 &&
      (enPassantSquare === i + dir + 1 || enPassantSquare === i + dir - 1)
    ) {
      tryAdd(enPassantSquare);
    }
  } else if (piece.type === "R" || piece.type === "Q") {
    // Vertical & horizontal
    const vectors = [8, -8, 1, -1];
    for (let v of vectors) {
      let x = 1;
      while (true) {
        const to = i + v * x;
        if (to < 0 || to >= 64) break;
        if ((v === 1 || v === -1) && !sameRow(i, to)) break;

        if (!board[to]) {
          tryAdd(to);
        } else if (isOpponent(to)) {
          tryAdd(to);
          break;
        } else {
          break;
        }
        x++;
      }
    }
  }

  if (piece.type === "B" || piece.type === "Q") {
    // Diagonals
    const vectors = [9, -9, 7, -7];
    for (let v of vectors) {
      let x = 1;
      while (true) {
        const to = i + v * x;
        if (to < 0 || to >= 64) break;
        if (Math.abs((to % 8) - (i % 8)) !== x) break;

        if (!board[to]) {
          tryAdd(to);
        } else if (isOpponent(to)) {
          tryAdd(to);
          break;
        } else {
          break;
        }
        x++;
      }
    }
  }

  if (piece.type === "N") {
    const offsets = [15, 17, 6, 10, -15, -17, -6, -10];
    for (let offset of offsets) {
      const to = i + offset;
      if (
        to >= 0 &&
        to < 64 &&
        Math.abs((to % 8) - (i % 8)) <= 2 &&
        (!board[to] || isOpponent(to))
      ) {
        tryAdd(to);
      }
    }
  }

  if (piece.type === "K") {
    const offsets = [-1, 1, -8, 8, -7, -9, 7, 9];
    for (let offset of offsets) {
      const to = i + offset;
      if (
        to >= 0 &&
        to < 64 &&
        Math.abs((to % 8) - (i % 8)) <= 1 &&
        (!board[to] || isOpponent(to))
      ) {
        tryAdd(to);
      }
    }
    //Castling Moves
    if (!ignoreKingCheck && piece.color === "white" && i === 60) {
      if (
        whiteCastleKingside &&
        !board[61] &&
        !board[62] &&
        !isSquareAttacked(60, "black") &&
        !isSquareAttacked(61, "black") &&
        !isSquareAttacked(62, "black")
      ) {
        directions.push(62); // Kingside castle
      }
      if (
        whiteCastleQueenside &&
        !board[59] &&
        !board[58] &&
        !isSquareAttacked(60, "black") &&
        !isSquareAttacked(59, "black") &&
        !isSquareAttacked(58, "black")
      ) {
        directions.push(58); // Queenside castle
      }
    } else if (!ignoreKingCheck && piece.color === "black" && i === 4) {
      if (
        blackCastleKingside &&
        !board[5] &&
        !board[6] &&
        !isSquareAttacked(4, "white") &&
        !isSquareAttacked(5, "white") &&
        !isSquareAttacked(6, "white")
      ) {
        directions.push(6); // Kingside castle
      }
      if (
        blackCastleQueenside &&
        !board[3] &&
        !board[2] &&
        !isSquareAttacked(4, "white") &&
        !isSquareAttacked(3, "white") &&
        !isSquareAttacked(2, "white")
      ) {
        directions.push(2); // Queenside castle
      }
    }
  }

  return directions;
}

function letToNum(letter) {
  let conversion = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
  };
  return conversion[letter[0]] + (8 - parseInt(letter[1])) * 8;
}

async function getBestMove(fen) {
  let url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(
    fen
  )}&depth=${depth}`;
  let response = await fetch(url);
  let data = await response.json();
  let bestMoveString = data.bestmove;
  let parts = bestMoveString.split(" ");
  let move = parts[1];
  let fromLet = move.substring(0, 2);
  let toLet = move.substring(2, 4);
  let from = letToNum(fromLet);
  let to = letToNum(toLet);
  return { from: from, to: to };
}

// A simple bot move function
function botMove() {
  let possibleMoves = [];
  let currEval = evaluateBoard(board);
  let bestMove = null;
  let maxEval = currEval;
  if (gameMode === "hard") {
    //hard: Play an engine move
    let fen = getFen();
    getBestMove(fen).then((move) => {
      if (!move) return;
      const movingPiece = board[move.from];
      const capturedPiece = board[move.to];
      board[move.to] = movingPiece;
      board[move.from] = null;

      if (movingPiece.type === "K") {
        if (movingPiece.color === "white") whiteKingIndex = move.to;
        else blackKingIndex = move.to;
      }

      if (capturedPiece && capturedPiece.type === "K") {
         
        userService.updateUserStats(userName, {
          gamesPlayed: userStats.gamesPlayed + 1,
          gamesWon: userStats.gamesWon,
          winStreak: userStats.winStreak,
        });

        gameOver();
      }
      let movingTo = capturedPiece;
      let selectedSquare = move.from;
      let index = move.to;

      if (
        whiteCastleQueenside ||
        whiteCastleKingside ||
        blackCastleQueenside ||
        blackCastleKingside
      ) {
        if (movingPiece.type === "R") {
          if (movingPiece.color === "white") {
            if (selectedSquare === 56) whiteCastleQueenside = false; // a1 rook
            if (selectedSquare === 63) whiteCastleKingside = false; // h1 rook
          } else {
            if (selectedSquare === 0) blackCastleQueenside = false; // a8 rook
            if (selectedSquare === 7) blackCastleKingside = false; // h8 rook
          }
        }
        if (movingTo && movingTo.type === "R") {
          if (movingTo.color === "white") {
            if (index === 56) whiteCastleQueenside = false; // a1 rook
            if (index === 63) whiteCastleKingside = false; // h1 rook
          } else {
            if (index === 0) blackCastleQueenside = false; // a8 rook
            if (index === 7) blackCastleKingside = false; // h8 rook
          }
        }
      }

      if (movingPiece.type === "K") {
        if (movingPiece.color === "white") {
          whiteCastleKingside = false;
          whiteCastleQueenside = false;
        } else {
          blackCastleKingside = false;
          blackCastleQueenside = false;
        }
        if (selectedSquare === 60) {
          if (index === 62) {
            board[61] = board[63]; // Move rook to f1
            board[63] = null; // Remove rook from h1
          } else if (index === 58) {
            board[59] = board[56]; // Move rook to d1
            board[56] = null; // Remove rook from a1
          }
        } else if (selectedSquare === 4) {
          if (index === 6) {
            board[5] = board[7]; // Move rook to f8
            board[7] = null; // Remove rook from h8
          } else if (index === 2) {
            board[3] = board[0]; // Move rook to d8
            board[0] = null; // Remove rook from a8
          }
        }
      } else if (movingPiece.type === "P") {
        if (index == enPassantSquare) {
          let pawnCapIndex =
            board[index].color === "white" ? index + 8 : index - 8;
          board[pawnCapIndex] = null;
        }

        if (Math.abs(index - selectedSquare) === 16) {
          enPassantSquare = (index + selectedSquare) / 2;
        } else {
          enPassantSquare = null;
        }
      } else {
        enPassantSquare = null;
      }

      if (capturedPiece) {
        if (document.getElementById("black-captured").textContent === "") {
          document.getElementById("black-captured").textContent =
            capturedPiece.type;
        } else {
          document.getElementById("black-captured").textContent +=
            ", " + capturedPiece.type;
        }
      }

      currentTurn = "white";
      renderBoard();
      if (checkMate()) {
         
        userService.updateUserStats(userName, {
          gamesPlayed: userStats.gamesPlayed + 1,
          gamesWon: userStats.gamesWon,
          winStreak: userStats.winStreak,
        });
        gameOver();
      }
    });
    return;
  }
  //-----------------------------------------------------------------------------------------------------------------------
  else if (gameMode === "easy") {
    for (let i = 0; i < 64; i++) {
      if (!board[i]) {
        continue;
      }
      const piece = board[i];
      if (piece && piece.color === botColor()) {
        // For demonstration, generate potential moves by trying each adjacent square.
        let directions = generateMoves(i, piece);

        directions.forEach((dir) => {
          const target = dir;
          possibleMoves.push({ from: i, to: target });
          //Here

          if (board[target] && board[target].type === "K") {
             
            userService.updateUserStats(userName, {
              gamesPlayed: userStats.gamesPlayed + 1,
              gamesWon: userStats.gamesWon,
              winStreak: 0,
            });
            gameOver();
            currentTurn = "white";
            renderBoard();
          }
          if (gameMode === "easy") {
            let testEval = currEval + points(board[target]);
            if (testEval > maxEval) {
              bestMove = { from: i, to: target };
              maxEval = testEval;
            }
          }
        });
      }
    }

    if (possibleMoves.length > 0) {
      let moveToDo;

      if (bestMove == null) {
        moveToDo =
          possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      } else {
        moveToDo = bestMove;
      }
      let capturedPiece = board[moveToDo.to];
      if (board[moveToDo.to] && board[moveToDo.to].type === "K") {
         
        userService.updateUserStats(userName, {
          gamesPlayed: userStats.gamesPlayed + 1,
          gamesWon: userStats.gamesWon,
          winStreak: 0,
        });
        gameOver();
        board[moveToDo.to] = board[moveToDo.from];
        board[moveToDo.from] = null;
        currentTurn = "white";
        renderBoard();
      } else {
        enPassantSquare = null;
        board[moveToDo.to] = board[moveToDo.from];
        board[moveToDo.from] = null;
        currentTurn = "white";
        if (checkMate()) {
           
          userService.updateUserStats(userName, {
            gamesPlayed: userStats.gamesPlayed + 1,
            gamesWon: userStats.gamesWon,
            winStreak: 0,
          });
          gameOver();
        }
        if (capturedPiece) {
          if (document.getElementById("black-captured").textContent === "") {
            document.getElementById("black-captured").textContent =
              capturedPiece.type;
          } else {
            document.getElementById("black-captured").textContent +=
              ", " + capturedPiece.type;
          }
        }
        renderBoard();
      }
    } else {
       
      userService.updateUserStats(userName, {
        gamesPlayed: userStats.gamesPlayed + 1,
        gamesWon: userStats.gamesWon + 1,
        winStreak: userStats.winStreak + 1,
      });
      gameOver();
    }
  }
}

export function resign() {
  // Logic to handle resigning the game
   
  userService.updateUserStats(userName, {
    gamesPlayed: userStats.gamesPlayed + 1,
    gamesWon: userStats.gamesWon,
    winStreak: 0,
  });
  gameOver();
}

export function gameOver() {
  //document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById("game-over-popup");
  popup.style.display = "flex";
  document.getElementById("close-popup").addEventListener("click", () => {
    popup.style.display = "none";
  });
  //});
}
function moveToCheck() {
  //document.addEventListener('DOMContentLoaded', () => {
  const moveKingInCheckPopup = document.getElementById("moveKingInCheck-popup");
  moveKingInCheckPopup.style.display = "flex";
  document
    .getElementById("moveIntoCheck-popup")
    .addEventListener("click", () => {
      moveKingInCheckPopup.style.display = "none";
    });
  //});
}
function illegalMoveCSS() {
  //document.addEventListener('DOMContentLoaded', () => {
  const illegalMovePopup = document.getElementById("illegalMove-popup");
  illegalMovePopup.style.display = "flex";
  document.getElementById("illegalMove-popup").addEventListener("click", () => {
    illegalMovePopup.style.display = "none";
  });
  //});
}

// Handle clicks on a square: select a piece or attempt a move.
