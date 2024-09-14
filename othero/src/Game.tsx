import React, { useState, useEffect } from 'react';
import Board from './Board';

type Player = 'black' | 'white';

const BOARD_SIZE = 8;

const initializeBoard = (): string[][] => {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill('')
  );
  board[3][3] = 'white';
  board[4][4] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  return board;
};

const Game: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [aiLevel, setAiLevel] = useState<number>(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);

  const handleMove = (x: number, y: number) => {
    if (!isValidMove(board, x, y, currentPlayer)) return;

    const newBoard = makeMove(board, x, y, currentPlayer);
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, currentPlayer, aiLevel);
        if (aiMove) {
          const newBoard = makeMove(board, aiMove.x, aiMove.y, currentPlayer);
          setBoard(newBoard);
        }
        setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
        setIsPlayerTurn(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn]);

  return (
    <div>
      <Board board={board} onMove={handleMove} />
      <div>
        <label>
          AIレベル:
          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(Number(e.target.value))}
          >
            <option value={1}>レベル1</option>
            <option value={2}>レベル2</option>
            <option value={3}>レベル3</option>
            <option value={4}>レベル4</option>
            <option value={5}>レベル5</option>
          </select>
        </label>
      </div>
    </div>
  );
};

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

const isValidMove = (
  board: string[][],
  x: number,
  y: number,
  player: Player
): boolean => {
  if (board[y][x]) return false;

  const opponent = player === 'black' ? 'white' : 'black';

  for (const [dx, dy] of DIRECTIONS) {
    let i = 1;
    while (true) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= BOARD_SIZE ||
        ny >= BOARD_SIZE ||
        !board[ny][nx]
      ) {
        break;
      }
      if (board[ny][nx] === opponent) {
        i++;
      } else if (board[ny][nx] === player) {
        if (i > 1) return true;
        else break;
      } else {
        break;
      }
    }
  }
  return false;
};

const makeMove = (
  board: string[][],
  x: number,
  y: number,
  player: Player
): string[][] => {
  const newBoard = board.map((row) => row.slice());
  newBoard[y][x] = player;

  const opponent = player === 'black' ? 'white' : 'black';

  for (const [dx, dy] of DIRECTIONS) {
    let i = 1;
    const toFlip: { x: number; y: number }[] = [];
    while (true) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= BOARD_SIZE ||
        ny >= BOARD_SIZE ||
        !newBoard[ny][nx]
      ) {
        break;
      }
      if (newBoard[ny][nx] === opponent) {
        toFlip.push({ x: nx, y: ny });
        i++;
      } else if (newBoard[ny][nx] === player) {
        for (const pos of toFlip) {
          newBoard[pos.y][pos.x] = player;
        }
        break;
      } else {
        break;
      }
    }
  }
  return newBoard;
};

const getValidMoves = (board: string[][], player: Player) => {
  const moves: { x: number; y: number }[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (isValidMove(board, x, y, player)) {
        moves.push({ x, y });
      }
    }
  }
  return moves;
};

const getAIMove = (
  board: string[][],
  player: Player,
  level: number
): { x: number; y: number } | null => {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;

  switch (level) {
    case 1:
      // ランダムな有効手を返す
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    case 2:
      // 最も多くの石をひっくり返せる手を選ぶ
      return validMoves.reduce((bestMove, move) => {
        const newBoard = makeMove(board, move.x, move.y, player);
        const score = countDiscs(newBoard, player);
        const bestScore = countDiscs(
          makeMove(board, bestMove.x, bestMove.y, player),
          player
        );
        return score > bestScore ? move : bestMove;
      });
    case 3:
      // 簡易的な評価関数を用いたミニマックス法（深さ1）
      return minimax(board, player, 1).move;
    case 4:
      // ミニマックス法（深さ2）
      return minimax(board, player, 2).move;
    case 5:
      // ミニマックス法（深さ3）
      return minimax(board, player, 3).move;
    default:
      return validMoves[0];
  }
};

const countDiscs = (board: string[][], player: Player): number => {
  return board.flat().filter((cell) => cell === player).length;
};

const minimax = (
  board: string[][],
  player: Player,
  depth: number,
  maximizingPlayer = true
): { score: number; move: { x: number; y: number } | null } => {
  if (depth === 0) {
    return { score: evaluateBoard(board, player), move: null };
  }

  const validMoves = getValidMoves(board, player);

  if (validMoves.length === 0) {
    return { score: evaluateBoard(board, player), move: null };
  }

  let bestScore = maximizingPlayer ? -Infinity : Infinity;
  let bestMove = null;

  for (const move of validMoves) {
    const newBoard = makeMove(board, move.x, move.y, player);
    const opponent = player === 'black' ? 'white' : 'black';
    const result = minimax(
      newBoard,
      opponent,
      depth - 1,
      !maximizingPlayer
    );

    if (maximizingPlayer) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
  }

  return { score: bestScore, move: bestMove };
};

const evaluateBoard = (board: string[][], player: Player): number => {
  const opponent = player === 'black' ? 'white' : 'black';
  const playerCount = countDiscs(board, player);
  const opponentCount = countDiscs(board, opponent);
  return playerCount - opponentCount;
};


export default Game;

