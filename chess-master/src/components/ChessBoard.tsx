import React, { useEffect, useState } from 'react';
import { initBoard, handleMove, generateMoves } from '@/components/ChessEngine';

const ChessBoard: React.FC = () => {
  const [board, setBoard] = useState(initBoard());
  const [selected, setSelected] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<number[]>([]);

  const onSquareClick = (index: number) => {
    if (selected === null && board[index]) {
      setSelected(index);
      setHighlighted(generateMoves(index));
    } else if (selected !== null) {
      const moveSuccess = handleMove(selected, index);
      if (moveSuccess) {
        setBoard([...board]); // re-render
      }
      setSelected(null);
      setHighlighted([]);
    }
  };

  return (
    <div className="grid grid-cols-8 aspect-square">
      {board.map((piece, i) => {
        const isLight = (Math.floor(i / 8) + (i % 8)) % 2 === 0;
        return (
          <div
            key={i}
            className={`w-full h-full flex items-center justify-center ${
              isLight ? 'bg-amber-100' : 'bg-amber-300'
            } ${highlighted.includes(i) ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => onSquareClick(i)}
          >
            {piece && (
              <img
                src={`/piecePics/${piece.color[0]}${piece.type}.png`}
                alt={`${piece.color} ${piece.type}`}
                className="w-4/5 h-4/5"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
