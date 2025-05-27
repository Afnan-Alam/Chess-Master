document.addEventListener('DOMContentLoaded', () => {
    // ===== Authentication =====
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authDiv = document.getElementById('auth');
    const gameDiv = document.getElementById('game');
    const userNameSpan = document.getElementById('user-name');
    const depth = 10;
    const popup = document.getElementById('game-over-popup');
    const moveKingInCheckPopup = document.getElementById('moveKingInCheck-popup');
    const illegalMovePopup = document.getElementById('illegalMove-popup');

    let whiteKingIndex = 60;
    let blackKingIndex = 4;

    // LOG IN AND SIGN UP UI
    
    // User Accounts are stored in LocalStorage.
    function login(username, password) {
      let storedUser = localStorage.getItem(username);
      if (storedUser) {
        let userData = JSON.parse(storedUser);
        if (userData.password === password) {
          return true;
        }
      }
      return false;
    }
    
    function signup(username, password) {
      if (localStorage.getItem(username)) {
        alert("Username already exists!");
        return false;
      }
      localStorage.setItem(username, JSON.stringify({ password: password }));
      return true;
    }
    
    //Logic for logging into the chess website. If it is successful, the transition to the game is called.
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      if (login(username, password)) {
        startGame(username);
      } else {
        alert("Login failed. Check your credentials.");
      }
    });
    

    //Logic for creating a new account in the website. 
    //Need to add logic for when username is new username is already taken
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value;
      const password = document.getElementById('signup-password').value;
      if (signup(username, password)) {
        alert("Sign up successful! Please log in.");
      }
    });
    












    //transition to start the game. Hides the login/signup div and shows the gae div
    function startGame(username) {
      authDiv.style.display = 'none';
      gameDiv.style.display = 'block';
      userNameSpan.textContent = username;
    }
    function gameOver() {
      popup.style.display = 'flex';
      document.getElementById('close-popup').addEventListener('click', () => {
        popup.style.display = 'none';
      });
    }
    function moveToCheck() {
      moveKingInCheckPopup.style.display = 'flex';
      document.getElementById('moveIntoCheck-popup').addEventListener('click', () => {
        moveKingInCheckPopup.style.display = 'none';
      });
    }
    function illegalMoveCSS() {
      illegalMovePopup.style.display = 'flex';
      document.getElementById('illegalMove-popup').addEventListener('click', () => {
        illegalMovePopup.style.display = 'none';
      });
    }
    
    // ===== Chess Game Variables and Functions =====
    let board = [];
    let currentTurn = 'white'; // white starts
    let selectedSquare = null;
    let gameMode = null; // either 'sandbox', 'afnan', or 'engine'
    
    // Mapping piece type and color to Unicode symbols
    //Need to add actual pictures for the pieces
    const pieceSymbols = {
      'K_white': 'piecePics/wK.png', 'Q_white': 'piecePics/wQ.png', 'R_white': 'piecePics/wR.png', 'B_white': 'piecePics/wB.png', 'N_white': 'piecePics/wN.png', 'P_white': 'piecePics/wP.png',
      'K_black': 'piecePics/bK.png', 'Q_black': 'piecePics/bQ.png', 'R_black': 'piecePics/bR.png', 'B_black': 'piecePics/bB.png', 'N_black': 'piecePics/bN.png', 'P_black': 'piecePics/bP.png'
    };
    const pieceVal = {
      'N':3,'Q':9,'R':5, 'B':3,'K':100, 'P':1
    };
    
    // Initialzie the starting board
    function initBoard() {
      board = new Array(64).fill(null);

      //Each piece is stored as a JavaScript object
      // Black pieces (top row is row 0)
      board[0] = { type: 'R', color: 'black' };
      board[1] = { type: 'N', color: 'black' };
      board[2] = { type: 'B', color: 'black' };
      board[3] = { type: 'Q', color: 'black' };
      board[4] = { type: 'K', color: 'black' };
      board[5] = { type: 'B', color: 'black' };
      board[6] = { type: 'N', color: 'black' };
      board[7] = { type: 'R', color: 'black' };
      for (let i = 8; i < 16; i++) {
        board[i] = { type: 'P', color: 'black' };
      }

      // White pieces (bottom rows)
      board[56] = { type: 'R', color: 'white' };
      board[57] = { type: 'N', color: 'white' };
      board[58] = { type: 'B', color: 'white' };
      board[59] = { type: 'Q', color: 'white' };
      board[60] = { type: 'K', color: 'white' };
      board[61] = { type: 'B', color: 'white' };
      board[62] = { type: 'N', color: 'white' };
      board[63] = { type: 'R', color: 'white' };
      for (let i = 48; i < 56; i++) {
        board[i] = { type: 'P', color: 'white' };
      }
    }
    
    // Render the chess board inside the #chess-board div
    function renderBoard() {
      const boardDiv = document.getElementById('chess-board');
      //If the board was called before, this would delete all the previous info on the board and start from scratch
      boardDiv.innerHTML = '';
      for (let i = 0; i < 64; i++) {
        //Creates a div element with Javascript variable square
        const square = document.createElement('div');
        //Adds a CSS class for square
        square.classList.add('square');
        const row = Math.floor(i / 8);
        const col = i % 8;
        // Adds either the light or dark CSS class to the square (to alternate colors)
        square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
        square.dataset.index = i;
        if (selectedSquare === i) {
          square.style.outline = '3px solid red';
        }
        const piece = board[i];
        if (piece) {
          const key = piece.type + '_' + piece.color;
          const img = document.createElement('img');
          img.src = pieceSymbols[key];
          img.alt = key;
          img.classList.add('chess-piece');
          square.appendChild(img);
        }
        square.addEventListener('click', handleSquareClick);
        boardDiv.appendChild(square);
      }
      document.getElementById('game-info').textContent =
        currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1) + "'s turn";
    }
    
    // Handle clicks on a square: select a piece or attempt a move.
function handleSquareClick(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  const piece = board[index];

  moveKingInCheckPopup.style.display = 'none';

  if (selectedSquare === null) {
    if (piece && piece.color === currentTurn) {
      selectedSquare = index;
      renderBoard();
    }
  } else {
    if (selectedSquare === index) {
      selectedSquare = null;
      renderBoard();
      return;
    }

    const movingPiece = board[selectedSquare];
    const movingTo = board[index]

    // Prevent moving to your own piece
    if (piece && piece.color === currentTurn) {
      selectedSquare = index;
      renderBoard();
      return;
    }
    if (!legal(selectedSquare, index)){
      //Run legal code
      console.log("Illegal move: Piece can't move here.");
      illegalMoveCSS();
      board[selectedSquare] = movingPiece;
      board[index] = movingTo;
      return;
    }
    
    move (selectedSquare, index);

    if (movingPiece.type === 'K') {
      if (movingPiece.color === 'white') {
        whiteKingIndex = index;
      } else {
        blackKingIndex = index;
      }
    }

    // Check if king is captured
    if (piece && piece.type === 'K') {
      gameOver();
    }

    if (!kingSafe()) {
      console.log("Illegal move: You can't leave your king in check.");
      moveToCheck(); //CSS function
      board[selectedSquare] = movingPiece;
      board[index] = movingTo;
      return;
    }
    if (checkMate()){
      gameOver();
    }
    currentTurn = currentTurn === 'white' ? 'black' : 'white';

    renderBoard();

    // Bot move
    if (gameMode !== 'sandbox' && currentTurn === botColor()) {
      setTimeout(botMove, 500);
    }
  }
}

function legal(from, to) {
  return generateMoves(from, board[from]).includes(to);
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
  
function checkMate(){
  const kinIndex = currentTurn === 'white' ? whiteKingIndex : blackKingIndex;

  if (!kingSafe()) {
    for (let i = 0; i < 64; i++) {
      if (board[i] && board[i].color === currentTurn){
        moves = generateMoves(i, board[i]);
        console.log(getFen());
        console.log(i, board[i], moves)
        if (moves.length > 0){
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
  return 'black';
}

function points(piece){
  if (piece){
    return pieceVal[piece.type]
  }
  else{
    return 0;
  }
  return 0;
}

function eval(){
  let eval = 0;
  for (let i = 0; i<64;i++){
    if (board[i]){
      if(board[i].color === botColor()){
        eval += points(board[i]);
      }
      else{
        eval -= points(board[i]);
      }
    }
  }
  return eval;
}

function getFen() {
  let fen = '';
  let count = 0;
  for (let i = 0; i < 64; i++) {
    if (i % 8 === 0 && i !== 0) {
      fen += count > 0 ? count : '';
      count = 0;
      fen += '/';
    }
    if (board[i]){
      if (count > 0) {
        fen += count;
      }
      count = 0;
      if (board[i].color === 'white'){
        fen += board[i].type;
      }
      else{
        fen += board[i].type.toLowerCase();
      }
    }
    else{
      count++;
    }
  }
  fen += " b - - 0 1";
  return fen;
}

function move(start, end) {
  board[end] = board[start];
  board[start] = null;
}

function kingSafe(customKingIndex = null) {
  const kingIndex = customKingIndex !== null ? customKingIndex : (currentTurn === 'white' ? whiteKingIndex : blackKingIndex);
  return !isSquareAttacked(kingIndex, currentTurn === 'white' ? 'black' : 'white');
}

function generateMoves(i, piece, ignoreKingCheck = false) {
  const directions = [];

  const isOpponent = (target) => board[target] && board[target].color !== piece.color;

  const sameRow = (a, b) => Math.floor(a / 8) === Math.floor(b / 8);
  // if (to >= 0 && to < 64 && (!board[to] || isOpponent(to)))
  const tryAdd = (to) => {
  const originalFrom = board[i];
  const originalTo = board[to];
  move(i, to);

  const movingKing = originalFrom.type === 'K';
  const tempKingIndex = movingKing ? to : null;

  const safe = ignoreKingCheck || kingSafe(tempKingIndex);
  if (safe) directions.push(to);
  board[i] = originalFrom;
  board[to] = originalTo;
  };

  if (piece.type === 'P') {
    const dir = piece.color === 'white' ? -8 : 8;
    const startRow = piece.color === 'white' ? 6 : 1;

    if (!board[i + dir]) {
        tryAdd(i + dir);
        if (Math.floor(i / 8) === startRow && !board[i + dir * 2]) {
            tryAdd(i + dir * 2);
          }
      }

    // Captures
    const captureOffsets = piece.color !== 'white' ? [7, 9] : [-7, -9];
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
  }

  else if (piece.type === 'R' || piece.type === 'Q') {
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

  if (piece.type === 'B' || piece.type === 'Q') {
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

  if (piece.type === 'N') {
    const offsets = [15, 17, 6, 10, -15, -17, -6, -10];
    for (let offset of offsets) {
      const to = i + offset;
      if (
        to >= 0 &&
        to < 64 &&
        Math.abs((to % 8) - (i % 8)) <= 2
      ) {
        tryAdd(to);
      }
    }
  }

  if (piece.type === 'K') {
    const offsets = [-1, 1, -8, 8, -7, -9, 7, 9];
    for (let offset of offsets) {
      const to = i + offset;
      if (to >= 0 && to < 64 && Math.abs((to % 8) - (i % 8)) <= 1 && (!board[to] || isOpponent(to))) {
        tryAdd(to);
      }
    }
  }

  return directions;
}

function letToNum(letter) {
  let conversion = {
    'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7
  }
  return conversion[letter[0]] + (8 - parseInt(letter[1])) * 8;
}

async function getBestMove(fen){
  let url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`;
  let response = await fetch (url);
  let data = await response.json();
  let bestMoveString = data.bestmove;
  let parts = bestMoveString.split(' ');
  let move = parts[1];
  let fromLet = move.substring(0, 2);
  let toLet = move.substring(2, 4);
  let from = letToNum(fromLet);
  let to = letToNum(toLet);
  return {from: from, to: to};
}

// A simple bot move function
function botMove() {
  let possibleMoves = [];
  let currEval = eval(board);
  let bestMove = null;
  let maxEval = currEval;
  
  for (let i = 0; i < 64; i++) {
    if (!board[i]){
      continue;
    }
    const piece = board[i];
    if (piece && piece.color === botColor()) {
      // For demonstration, generate potential moves by trying each adjacent square.
      let directions = generateMoves(i, piece);

      directions.forEach(dir => {
        const target = dir;
        possibleMoves.push({ from: i, to: target });
        //Here
        if (board[possibleMoves.to] && board[possibleMoves.to].type === 'K'){
          gameOver();
          currentTurn = 'white';
          renderBoard();
        }
        if (gameMode === 'easy'){
          let testEval = currEval + points(board[target])
          if (testEval > maxEval){
            bestMove = {from:i, to:target}
            maxEval = testEval;
          }
        }
      });
    }
  }
  if (possibleMoves.length > 0) {
    if (gameMode === 'hard') {
      //hard: Play an engine move
      let fen = getFen();
      getBestMove(fen).then(move =>{
    if (!move) return;
    const movingPiece = board[move.from];
    const capturedPiece = board[move.to];
    board[move.to] = movingPiece;
    board[move.from] = null;

    if (movingPiece.type === 'K') {
      if (movingPiece.color === 'white') whiteKingIndex = move.to;
      else blackKingIndex = move.to;
    }

    if (capturedPiece && capturedPiece.type === 'K') {
      gameOver();
    }

    currentTurn = 'white';
    renderBoard();
    if (checkMate()){
          gameOver();
    }
  });     
    } else if (gameMode === 'easy') {
      if (bestMove == null){
        move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      }
      else{
        move = bestMove;
      }
      if (board[move.to] && board[move.to].type === 'K'){
        gameOver();
        board[move.to] = board[move.from];
        board[move.from] = null;
        currentTurn = 'white';
        renderBoard();
      }
      else{
        board[move.to] = board[move.from];
        board[move.from] = null;
        currentTurn = 'white';
        if (checkMate()){
          gameOver();
        }
        renderBoard();        
      }
    }
  }
}



// ===== Game Mode Selection =====
document.getElementById('sandbox-btn').addEventListener('click', () => {
  gameMode = 'sandbox';
  startChessGame();
});
document.getElementById('easy-btn').addEventListener('click', () => {
  gameMode = 'easy';
  startChessGame();
});
document.getElementById('hard-btn').addEventListener('click', () => {
  gameMode = 'hard';
  startChessGame();
});

function startChessGame() {
  initBoard();
  currentTurn = 'white';
  selectedSquare = null;
  renderBoard();
}
});