document.addEventListener('DOMContentLoaded', () => {
    // ===== Authentication =====
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authDiv = document.getElementById('auth');
    const gameDiv = document.getElementById('game');
    const userNameSpan = document.getElementById('user-name');
    

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
      const popup = document.getElementById('game-over-popup');
      popup.style.display = 'flex';
      document.getElementById('close-popup').addEventListener('click', () => {
        popup.style.display = 'none';
      });
    }
    
    // ===== Chess Game Variables and Functions =====
    let board = [];
    let currentTurn = 'white'; // white starts
    let selectedSquare = null;
    let gameMode = null; // either 'sandbox', 'random', or 'afnan'
    
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
      if (selectedSquare === null) {
        // Select a piece if it belongs to the current player
        if (piece && piece.color === currentTurn) {
          selectedSquare = index;
          renderBoard();
        }
      } else {
        // Clicking the same square deselects
        if (selectedSquare === index) {
          selectedSquare = null;
          renderBoard();
          return;
        }
        // Basic move validation: disallow moving to a square occupied by a friendly piece.
        const movingPiece = board[selectedSquare];
        if (piece && piece.color === currentTurn) {
          selectedSquare = index;
          renderBoard();
          return;
        }
        // In a full implementation, you would call your Node.js back‑end (with your chess algorithm)
        // to validate the move. For now, we simply update the board state.
        if (piece && piece.type === 'K'){
          gameOver();
          board[index] = movingPiece;
          board[selectedSquare] = null;
          selectedSquare = null;
        }
        else{
          board[index] = movingPiece;
          board[selectedSquare] = null;
          selectedSquare = null;
        }
        
        // Switch turn
        currentTurn = (currentTurn === 'white') ? 'black' : 'white';
        renderBoard();
        
        // If playing against a bot and it's now the bot’s turn, have it move.
        if (gameMode !== 'sandbox' && currentTurn === botColor()) {
          setTimeout(botMove, 500);
        }
      }
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
    
function generateMoves(i, piece, board) {
  const directions = [];

  const isOpponent = (target) => board[target] && board[target].color !== piece.color;

  const sameRow = (a, b) => Math.floor(a / 8) === Math.floor(b / 8);

  const tryAdd = (to) => {
    if (to >= 0 && to < 64 && (!board[to] || isOpponent(to))) {
      directions.push(to);
    }
  };

  if (piece.type === 'P') {
    const dir = piece.color === 'white' ? -8 : 8;
    const startRow = piece.color === 'white' ? 6 : 1;

    if (!board[i + dir]) {
      directions.push(i + dir);
      if (Math.floor(i / 8) === startRow && !board[i + dir * 2]) {
        directions.push(i + dir * 2);
      }
    }

    // Captures
    const captureOffsets = piece.color === 'white' ? [7, 9] : [-7, -9];
    for (let offset of captureOffsets) {
      const to = i + offset;
      if (
        to >= 0 &&
        to < 64 &&
        board[to] &&
        isOpponent(to) &&
        Math.abs((to % 8) - (i % 8)) === 1
      ) {
        directions.push(to);
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
          directions.push(to);
        } else if (isOpponent(to)) {
          directions.push(to);
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
          directions.push(to);
        } else if (isOpponent(to)) {
          directions.push(to);
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
      if (to >= 0 && to < 64 && Math.abs((to % 8) - (i % 8)) <= 1) {
        tryAdd(to);
      }
    }
  }

  return directions;
}


    // A simple bot move (using random move selection for random and a slightly smarter selection for Afnan).
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
          let directions = generateMoves(i, piece, board);

          directions.forEach(dir => {
            const target = dir;
            possibleMoves.push({ from: i, to: target });
            if (gameMode === 'afnan'){
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
        let move;
        if (gameMode === 'random') {
          // random: purely random move.
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (gameMode === 'afnan') {
          if (bestMove == null){
            move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          }
          else{
            move = bestMove;
          }

          // // Afnan: if a capture is available, take it; otherwise, choose a random move.
          // const captureMoves = possibleMoves.filter(m => board[m.to] && board[m.to].color !== botColor());
          // move = (captureMoves.length > 0) ?
          //   captureMoves[Math.floor(Math.random() * captureMoves.length)] :
          //   possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
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
        renderBoard();
        }
      }
    }
    


    // ===== Game Mode Selection =====
    document.getElementById('sandbox-btn').addEventListener('click', () => {
      gameMode = 'sandbox';
      startChessGame();
    });
    document.getElementById('random-btn').addEventListener('click', () => {
      gameMode = 'random';
      startChessGame();
    });
    document.getElementById('afnan-btn').addEventListener('click', () => {
      gameMode = 'afnan';
      startChessGame();
    });
    
    function startChessGame() {
      initBoard();
      currentTurn = 'white';
      selectedSquare = null;
      renderBoard();
    }
  });
  








  /* 
  Temporary stuff:
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
Old Directions algorithm (missing some stuff)

            let directions = [];

          if (piece.type === 'P'){
            if (piece.color === 'white'){
              if (!board[i+8]){
                directions.push(i+8);
                if (Math.floor(i/8) == 1 && !board[i + 16]){
                  directions.push(i+16);
                }
              } 
            }
            else if (piece.color === 'black'){
              if (!board[i-8]){
                directions.push(i-8);
                if (Math.floor(i/8) == 6 && !board[i - 16]){
                  directions.push(i-16);
                }
              } 
            }
          }

          else if (piece.type === 'R'){
            let x = 1;
            while((i+x*8) < 64 && !board[i+x*8]){
              directions.push(i + x*8);
              x++;
            }
            if ((i+x*8) < 64 && board[i+x*8] && board[i+x*8].color === 'white'){
              directions.push(i+x*8);
            }
            x = 1;
            while((i-x*8) >= 0 && !board[i-x*8]){
              directions.push(i - x*8);
              x++;
            }
            if ((i-x*8) >= 0 && board[i-x*8] && board[i-x*8].color === 'white'){
              directions.push(i-x*8);
            }
            x = 1;
            while((i+x)%8 > i%8 && !board[i+x]){
              directions.push(i + x);
              x++;
            }
            if ((i+x)%8 > i%8 && board[i+x] && board[i+x].color === 'white'){
              directions.push(i+x);
            }
            x = 1;
            while((i-x)%8 < i%8 && !board[i-x]){
              directions.push(i - x);
              x++;
            }
            if ((i-x)%8 && board[i-x] && board[i-x].color === 'white'){
              directions.push(i-x);
            }
          }

          else if (piece.type === 'B'){
            let x = 1;
            while((i+x*9) < 64 && (i + x*9)%8 > i%8 && !board[i+x*9]){
              directions.push(i + x*9);
              x++;
            }
            if ((i+x*9) < 64 && (i + x*9)%8 > i%8 && board[i+x*9] && board[i+x*9].color === 'white'){
              directions.push(i + x*9);
            }
            x = 1;
            while((i-x*9) >= 0 && (i - x*9)%8 < i%8 && !board[i-x*9]){
              directions.push(i - x*9);
              x++;
            }
            if ((i-x*9) >= 0 && (i - x*9)%8 < i%8 && board[i-x*9] && board[i-x*9].color === 'white'){
              directions.push(i - x*9);
            }
            x = 1;
            while((i+x*7) < 64 && (i + x*7)%8 < i%8 && !board[i+x*7]){
              directions.push(i + x*7);
              x++;
            }
            if ((i+x*7) < 64 && (i + x*7)%8 < i%8 && board[i + x*7] && board[i + x*7].color === 'white'){
              directions.push(i + x*7);
            }
            x = 1;
            while((i-x*7) >= 0 && (i - x*7)%8 > i%8 && !board[i-x*7]){
              directions.push(i - x*7);
              x++;
            }
            if ((i-x*7) >= 0 && (i - x*7)%8 > i%8 && board[i-x*7] && board[i-x*7].color === 'white'){
              directions.push(i - x*7);
            }
          }

          else if (piece.type === 'N'){
            if (i%8 != 7 && i + 16 <64 && (!board[i+17] || board[i+17].color === 'white')){
              directions.push(i+17);
            }
            if (i%8 != 0 && i + 16 <64 && (!board[i+15] || board[i+15].color === 'white')){
              directions.push(i+15);
            }
            if (i%8 != 7 && i - 16 >= 0 && (!board[i-15] || board[i-15].color === 'white')){
              directions.push(i-15);
            }
            if (i%8 != 0 && i - 16 >= 0 && (!board[i-17] || board[i-17].color === 'white')){
              directions.push(i-17);
            }


            if ((i+2)%8 > i%8 && i + 8 <64 && (!board[i+10] || board[i+10].color === 'white')){
              directions.push(i+10);
            }
            if ((i-2)%8 < i%8 && i + 8 <64 && (!board[i+6] || board[i+6].color === 'white')){
              directions.push(i+6);
            }
            if ((i+2)%8 > i%8 && i - 8 >= 0 && (!board[i-6]|| board[i-6].color === 'white')){
              directions.push(i-6);
            }
            if ((i-2)%8 < i%8 && i - 8 >= 0 && (!board[i-10]|| board[i-10].color === 'white')){
              directions.push(i-10);
            }
          }

          else if (piece.type === 'Q'){
            //Rook
            let x = 1;
            while((i+x*8) < 64 && !board[i+x*8]){
              directions.push(i + x*8);
              x++;
            }
            if ((i+x*8) < 64 && board[i+x*8] && board[i+x*8].color === 'white'){
              directions.push(i+x*8);
            }
            x = 1;
            while((i-x*8) >= 0 && !board[i-x*8]){
              directions.push(i - x*8);
              x++;
            }
            if ((i-x*8) >= 0 && board[i-x*8] && board[i-x*8].color === 'white'){
              directions.push(i-x*8);
            }
            x = 1;
            while((i+x)%8 > i%8 && !board[i+x]){
              directions.push(i + x);
              x++;
            }
            if ((i+x)%8 > i%8 && board[i+x] && board[i+x].color === 'white'){
              directions.push(i+x);
            }
            x = 1;
            while((i-x)%8 < i%8 && !board[i-x]){
              directions.push(i - x);
              x++;
            }
            if ((i-x)%8 && board[i-x] && board[i-x].color === 'white'){
              directions.push(i-x);
            }

            //Bishop
            x = 1;
            while((i+x*9) < 64 && (i + x*9)%8 > i%8 && !board[i+x*9]){
              directions.push(i + x*9);
              x++;
            }
            if ((i+x*9) < 64 && (i + x*9)%8 > i%8 && board[i+x*9] && board[i+x*9].color === 'white'){
              directions.push(i + x*9);
            }
            x = 1;
            while((i-x*9) >= 0 && (i - x*9)%8 < i%8 && !board[i-x*9]){
              directions.push(i - x*9);
              x++;
            }
            if ((i-x*9) >= 0 && (i - x*9)%8 < i%8 && board[i-x*9] && board[i-x*9].color === 'white'){
              directions.push(i - x*9);
            }
            x = 1;
            while((i+x*7) < 64 && (i + x*7)%8 < i%8 && !board[i+x*7]){
              directions.push(i + x*7);
              x++;
            }
            if ((i+x*7) < 64 && (i + x*7)%8 < i%8 && board[i + x*7] && board[i + x*7].color === 'white'){
              directions.push(i + x*7);
            }
            x = 1;
            while((i-x*7) >= 0 && (i - x*7)%8 > i%8 && !board[i-x*7]){
              directions.push(i - x*7);
              x++;
            }
            if ((i-x*7) >= 0 && (i - x*7)%8 > i%8 && board[i-x*7] && board[i-x*7].color === 'white'){
              directions.push(i - x*7);
            }
          }

          else if (piece.type === 'K'){
            if (!(i%8 == 0) && (!board[i-1] || board[i-1].color === 'white')){
              directions.push(i-1);
            }
            if (!(i%8==7) && (!board[i+1] || board[i+1].color === 'white')){
              directions.push(i+1);
            }
            if (i-8 >= 0 && (!board[i-8] || board[i-8].color === 'white')){
              directions.push(i-8);
            }
            if (i+8 < 64 && (!board[i+8] || board[i+8].color === 'white')){
              directions.push(i+8);
            }
            if (i-7 >= 0 && (i-7)%8 != 0 && (!board[i-7] || board[i-7].color === 'white')){
              directions.push(i-7);
            }
            if (i-9 >= 0 && (i-9)%8 != 7 && (!board[i-9] || board[i-9].color === 'white')){
              directions.push(i-9);
            }
            if (i+7 < 64 && (i+7)%8 != 0 && (!board[i+7] || board[i+7].color === 'white')){
              directions.push(i+7);
            }
            if (i+9 < 64 && (i+9)%8 != 7 && (!board[i+9] || board[i+9].color === 'white')){
              directions.push(i+9);
            }
          }

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  */