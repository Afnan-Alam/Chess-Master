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
    let gameMode = null; // either 'sandbox', 'raeed', or 'afnan'
    
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
    
    // A simple bot move (using random move selection for Raeed and a slightly smarter selection for Afnan).
    function botMove() {
      let possibleMoves = [];
      let currEval = eval(board);
      let bestMove = null;
      let maxEval = currEval;
      
      for (let i = 0; i < 64; i++) {
        const piece = board[i];
        if (piece && piece.color === botColor()) {
          // For demonstration, generate potential moves by trying each adjacent square.
          let directions = [];
          if (i == 0){
            directions = [1, 8, 9];
          }
          else if (i == 7){
            directions = [-1, 7, 8];
          }
          else if (i == 56){
            directions = [-8, -7, 1];
          }
          else if (i == 63){
            directions = [-9, -8, -1];
          }
          else if (i%8 == 0){
            directions = [-8, -7, 1,8, 9];
          }
          else if ((i+1)%8 == 0){
            directions = [-9, -8, -1, 7, 8];
          }
          else if (i<8){
            directions = [-1, 1, 7, 8, 9];
          }
          else if (i>55){
            directions = [-9, -8, -7, -1, 1];
          }
          else{
            directions = [-9, -8, -7, -1, 1, 7, 8, 9];
          }
          directions.forEach(dir => {
            const target = i + dir;
            if (target >= 0 && target < 64) {
              if (!board[target] || board[target].color !== botColor()) {
                possibleMoves.push({ from: i, to: target });
                if (gameMode === 'afnan'){
                  let testEval = currEval + points(board[target])
                  if (testEval > maxEval){
                    bestMove = {from:i, to:target}
                    maxEval = testEval;
                  }
                }
              }
            }
          });
        }
      }
      if (possibleMoves.length > 0) {
        let move;
        if (gameMode === 'raeed') {
          // Raeed: purely random move.
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
    document.getElementById('raeed-btn').addEventListener('click', () => {
      gameMode = 'raeed';
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
  