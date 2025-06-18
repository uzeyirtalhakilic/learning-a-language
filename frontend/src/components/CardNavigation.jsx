import React from 'react';

const CardNavigation = ({ currentIndex, totalCards, onNext, onPrev }) => {
  return (
    <div className="card-navigation">
      <button 
        onClick={onPrev}
        className="nav-button"
      >
        ← Önceki
      </button>
      <span className="card-counter">
        {currentIndex + 1} / {totalCards}
      </span>
      <button 
        onClick={onNext}
        className="nav-button"
      >
        Sonraki →
      </button>
    </div>
  );
};

export default CardNavigation; 