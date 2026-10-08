const Gameboard = (() => {
  const SIZE = 9;
  const board = Array(SIZE).fill("");

  const getBoard = () => [...board];

  const isCellEmpty = (index) => board[index] === "";

  const placeMark = (index, mark) => {
    if (index < 0 || index >= SIZE || !isCellEmpty(index)) return false;
    board[index] = mark;
    return true;
  };

  const isFull = () => board.every((cell) => cell !== "");

  const reset = () => board.fill("");

  const print = () => {
    const rows = [0, 3, 6].map((i) => board.slice(i, i + 3).map((c) => c || "·").join(" | "));
    console.log(rows.join("\n---------\n"));
  };

  return { getBoard, placeMark, isFull, reset, print };
})();

const createPlayer = (name, mark) => {
  let score = 0;

  const getScore = () => score;
  const addWin = () => score++;

  return { name, mark, getScore, addWin };
};

const GameController = (() => {
  const WINNING_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  let players = [createPlayer("Player 1", "X"), createPlayer("Player 2", "O")];
  let activePlayer = players[0];
  let gameOver = false;
  let winner = null;

  const getActivePlayer = () => activePlayer;
  const getWinner = () => winner;
  const isGameOver = () => gameOver;

  const switchPlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const checkWin = (mark) => {
    const board = Gameboard.getBoard();
    return WINNING_LINES.some((line) => line.every((i) => board[i] === mark));
  };

  const setPlayers = (name1 = "Player 1", name2 = "Player 2") => {
    players = [createPlayer(name1, "X"), createPlayer(name2, "O")];
    restart();
  };

  const restart = () => {
    Gameboard.reset();
    activePlayer = players[0];
    gameOver = false;
    winner = null;
  };

  const playRound = (index) => {
    if (gameOver) return "Game is over. Call GameController.restart() to play again.";

    if (!Gameboard.placeMark(index, activePlayer.mark)) {
      return `Invalid move. ${activePlayer.name}, pick an empty cell (0-8).`;
    }

    if (checkWin(activePlayer.mark)) {
      gameOver = true;
      winner = activePlayer;
      activePlayer.addWin();
      return `${activePlayer.name} wins!`;
    }

    if (Gameboard.isFull()) {
      gameOver = true;
      return "It's a tie!";
    }

    switchPlayer();
    return `${activePlayer.name}'s turn (${activePlayer.mark})`;
  };

  const getPlayers = () => [...players];

  return { playRound, restart, setPlayers, getActivePlayer, getPlayers, getWinner, isGameOver };
})();

const displayController = (() => {
  const boardEl = document.querySelector("#board");
  const statusEl = document.querySelector("#status");
  const scoresEl = document.querySelector("#scores");
  const form = document.querySelector("#player-form");
  const restartBtn = document.querySelector("#restart");

  const renderBoard = () => {
    boardEl.textContent = "";
    const gameOver = GameController.isGameOver();

    Gameboard.getBoard().forEach((mark, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.index = index;
      cell.textContent = mark;
      if (mark) cell.classList.add(mark === "X" ? "x" : "o");
      cell.disabled = gameOver || mark !== "";
      cell.setAttribute("aria-label", `Cell ${index + 1}${mark ? `, ${mark}` : ""}`);
      boardEl.appendChild(cell);
    });
  };

  const renderScores = () => {
    scoresEl.textContent = GameController.getPlayers()
      .map((p) => `${p.name} (${p.mark}): ${p.getScore()}`)
      .join("  ·  ");
  };

  const turnMessage = () => {
    const player = GameController.getActivePlayer();
    return `${player.name}'s turn (${player.mark})`;
  };

  const render = (message = turnMessage()) => {
    renderBoard();
    renderScores();
    statusEl.textContent = message;
  };

  boardEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    render(GameController.playRound(Number(cell.dataset.index)));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name1 = form.elements.player1.value.trim() || undefined;
    const name2 = form.elements.player2.value.trim() || undefined;
    GameController.setPlayers(name1, name2);
    render();
  });

  restartBtn.addEventListener("click", () => {
    GameController.restart();
    render();
  });

  render();
})();
