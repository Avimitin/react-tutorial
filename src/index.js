import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                last_click: 0,
            }],
            xIsNext: true,
            current_step: 0,
        }
    }

    handleClick(i) {
        let history = this.state.history.slice(0, this.state.current_step + 1);
        let current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState(
            {
                history: history.concat([{ squares: squares, last_click: i }]),
                xIsNext: !this.state.xIsNext,
                current_step: history.length,
            }
        )
    }

    jumpTo(i) {
        this.setState(
            {
                current_step: i,
                xIsNext: i % 2 === 0
            }
        )
    }

    render() {
        let history = this.state.history;
        let current = history[this.state.current_step];
        const winner = calculateWinner(current.squares);

        const history_move = history.map((hist, idx) => {
            const locate = (idx) => {
                const x = (idx % 3).toFixed();
                const y = (idx / 3).toFixed();
                return `(${x}, ${y})`;
            };
            const desc = idx ? "Go to move: " + locate(hist.last_click) : "Go to beginning";
            return (
                <li key={idx}>
                    <button onClick={() => this.jumpTo(idx)}>{desc}</button>
                </li>
            )
        })

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next: " + (this.state.xIsNext ? "X" : "O");
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{history_move}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

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
            return squares[a];
        }
    }
    return null;
}