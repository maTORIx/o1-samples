import React from 'react';
import Square from './Square';

interface BoardProps {
  board: string[][];
  onMove: (x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onMove }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${board.length}, 40px)` }}>
      {board.flatMap((row, y) =>
        row.map((cell, x) => (
          <Square key={`${x}-${y}`} value={cell} onClick={() => onMove(x, y)} />
        ))
      )}
    </div>
  );
};

export default Board;

