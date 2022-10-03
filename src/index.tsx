import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { useState } from "react";

// Calculate the winner line
function calculateWinner(squares: Array<string | null>) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}

function Square({ value, highlight, onClick }) {
  return (
    <button
      className={highlight ? "square highlight" : "square"}
      onClick={onClick} // accept click, and call the `onClick` function from its parent
    >
      {value}
    </button>
  );
}

type BoardProps = {
  squares: Array<string | null>,
  // an array contains the 3 index of the winner
  winner: Array<number> | null,
  onClick: (nth: number) => void;
}

function Board({ squares, winner, onClick }: BoardProps) {
  const render_nth_square = (nth: number) => {
    return (
      <Square
        key={nth}
        value={squares[nth]}
        highlight={winner !== null && winner.includes(nth)}
        onClick={() => onClick(nth)} // transfer the `onClick` function from parent to `Square`
      />
    );
  };

  let board = [];
  let n = 0;
  for (let i = 0; i < 3; i++) {
    let row = [];
    for (let j = 0; j < 3; j++) {
      row.push(render_nth_square(n));
      n += 1;
    }
    board.push(
      <div key={i} className="board-row">
        {row}
      </div>
    );
  }

  return <div>{board}</div>;
}

// calculate necessary data update when the nth square was clicked
function handle_board_click(nth: number, gd: GameDataLayout): GameDataLayout | null {
  const history = gd.history;
  const current_gameboard = history[history.length - 1];
  const square_values = current_gameboard.square.slice();
  // If we already have a winner, or the current square is clicked
  if (calculateWinner(square_values) || square_values[nth]) {
    // Update nothing and return
    return null;
  }

  // draw "X" or "O" based on state
  square_values[nth] = gd.next_is_x ? "X" : "O";
  return {
    history: history.concat([
      { square: square_values, last_click: nth },
    ]),
    next_is_x: !gd.next_is_x,
    current_step: history.length,
  };
}

// Handle the history buttons
//
// @param {number} n The number of the clicked history button
function handle_history_click(n: number) {
  return {
    current_step: n,
    next_is_x: n % 2 === 0,
  };
}

type HistoryProp = {
  gd: GameDataLayout,
  onClick: (new_data: GameDataLayout) => void
  isAscSort: boolean,
}

function History({ gd, onClick, isAscSort }: HistoryProp) {
  const list_item = gd.history.map((record, idx) => {
    const locate = (idx: number) => {
      const x = (idx % 3).toFixed();
      const y = (idx / 3).toFixed();
      return `(${x}, ${y})`;
    };
    // If the game haven't start, do not render move location
    const desc =
      idx !== 0
        ? "Go to move: " + locate(record.last_click)
        : "Go to beginning";
    // If current board is the one we choose in history, highlight it as bold text
    const text = idx === gd.current_step ? <b>{desc}</b> : desc;

    return (
      <li key={idx}>
        <button
          onClick={() => {
            const new_game_data = handle_history_click(idx);
            onClick({ ...gd, ...new_game_data })
          }}
        >
          {text}
        </button>
      </li>
    );
  });

  return <ol>{isAscSort ? list_item : list_item.reverse()}</ol>;
}

type GameStatusTextProp = {
  winner: Array<number> | null,
  squares: Array<string | null>,
  next_is_x: boolean,
}

function GameStatusText({ winner, squares, next_is_x }: GameStatusTextProp) {
  let status_text: string;
  if (winner !== null) {
    status_text = "Winner: " + squares[winner[0]];
  } else if (!squares.includes(null)) {
    // if winner line, and all the square in gameboard are filled up
    status_text = "No player win!";
  } else {
    status_text = "Next player: " + (next_is_x ? "X" : "O");
  }

  return <div>{status_text}</div>;
}

type SortButtonProps = {
  isAscSort: boolean,
  onClick: (new_sort: boolean) => void,
}

function SortButton({ isAscSort, onClick }: SortButtonProps) {
  return <button onClick={() => onClick(!isAscSort)}>Reverse Sort</button>;
}

// Represent a single record of the history. Every square value
// and the operation position were stored in this record.
interface HistoryRecord {
  square: Array<string | null>;
  last_click: number;
}

interface GameDataLayout {
  history: Array<HistoryRecord>;
  next_is_x: boolean;
  current_step: number;
}

const initGameData: GameDataLayout = {
  history: [
    {
      square: Array(9).fill(null),
      last_click: 0,
    },
  ],
  next_is_x: true,
  current_step: 0,
}

function Game() {
  const [gameData, setGameData] = useState(initGameData);

  const [isAscendingSort, setSortOrder] = useState(true);

  const current = gameData.history[gameData.current_step];
  const winner = calculateWinner(current.square);

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.square}
          winner={winner}
          onClick={(nth) => {
            const game_data = handle_board_click(nth, gameData);
            if (game_data === null) {
              return;
            }
            setGameData(game_data);
          }}
        />
      </div>
      <div className="game-info">
        <GameStatusText
          winner={winner}
          squares={current.square}
          next_is_x={gameData.next_is_x}
        />
        <SortButton isAscSort={isAscendingSort} onClick={setSortOrder} />
        <ol>
          <History
            gd={gameData}
            onClick={setGameData}
            isAscSort={isAscendingSort}
          />
        </ol>
      </div>
    </div>
  );
}

export default function App() {
  return <Game />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
