import React from 'react';

interface SquareProps {
  value: string;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  const getColor = () => {
    if (value === 'black') return 'black';
    if (value === 'white') return 'white';
    return 'green';
  };

  return (
    <div
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        backgroundColor: 'green',
        border: '1px solid black',
        position: 'relative',
      }}
    >
      {value && (
        <div
          style={{
            backgroundColor: getColor(),
            borderRadius: '50%',
            width: '80%',
            height: '80%',
            margin: '10%',
          }}
        ></div>
      )}
    </div>
  );
};

export default Square;

