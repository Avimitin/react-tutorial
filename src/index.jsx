import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { useState } from "react";

// Calculate the winner line
function calculateWinner(squares) {
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

function Board({ squares, winner_line, onClick }) {
  const render_nth_square = (nth) => {
    return (
      <Square
        key={nth}
        value={squares[nth]}
        highlight={winner_line !== null && winner_line.includes(nth)}
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

function handle_click(history, nth, next_is_x) {
  const current_gameboard = history[history.length - 1];
  const square_values = current_gameboard.square_values.slice();
  // If we already have a winner, or the current square is clicked
  if (calculateWinner(square_values) || square_values[nth]) {
    // Update nothing and return
    return null;
  }

  // draw "X" or "O" based on state
  square_values[nth] = next_is_x ? "X" : "O";
  return {
    history: history.concat([
      { square_values: square_values, last_click: nth },
    ]),
    next_is_x: !next_is_x,
    current_step: history.length,
  };
}

function handle_history_click(n) {
  return {
    current_step: n,
    next_is_x: n % 2 === 0,
  };
}

function History({ history, current_step, setState, isAscSort }) {
  const list_item = history.map((record, idx) => {
    const locate = (idx) => {
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
    const text = idx === current_step ? <b>{desc}</b> : desc;
    return (
      <li key={idx}>
        <button onClick={() => setState(handle_history_click(idx))}>
          {text}
        </button>
      </li>
    );
  });

  return isAscSort ? list_item : list_item.reverse();
}

function GameStatusText({ winner_line, gameboard, next_is_x }) {
  let status_text;
  if (winner_line !== null) {
    status_text = "Winner: " + gameboard[winner_line[0]];
  } else if (!gameboard.includes(null)) {
    // if winner line, and all the square in gameboard are filled up
    status_text = "No player win!";
  } else {
    status_text = "Next player: " + (next_is_x ? "X" : "O");
  }

  return <div>{status_text}</div>;
}

function SortButton({ isAscSort, setSortOrder }) {
  return <button onClick={() => setSortOrder(!isAscSort)}>Reverse Sort</button>;
}

function Game() {
  const [gameData, setGameData] = useState({
    history: [
      {
        square_values: Array(9).fill(null),
        last_click: 0,
      },
    ],
    next_is_x: true,
    current_step: 0,
  });

  const [isAscendingSort, setSortOrder] = useState(true);

  const current = gameData.history[gameData.current_step];
  const winner = calculateWinner(current.square_values);

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.square_values}
          winner_line={winner}
          onClick={(nth) => {
            const game_data = handle_click(
              gameData.history,
              nth,
              gameData.next_is_x
            );
            if (game_data === null) {
              return;
            }
            setGameData(game_data);
          }}
        />
      </div>
      <div className="game-info">
        <GameStatusText
          winner_line={winner}
          gameboard={current.square_values}
          next_is_x={gameData.next_is_x}
        />
        <SortButton isAscSort={isAscendingSort} setSortOrder={setSortOrder} />
        <ol>
          <History
            history={gameData.history}
            current_step={gameData.current_step}
            setState={setGameData}
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
