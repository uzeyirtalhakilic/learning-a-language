import React, { useEffect } from 'react';
import { formatDifficulty, formatCategory } from '../utils/formatters';
import CardNavigation from './CardNavigation';

const FlashCards = ({ cards, currentCardIndex, isFlipped, onCardClick, onNext, onPrev, isShuffling }) => {
  // Reset card to front side when card index changes
  useEffect(() => {
    if (isFlipped) {
      onCardClick();
    }
  }, [currentCardIndex]);

  return (
    <>
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''} ${isShuffling ? 'shuffling' : ''}`}
        onClick={onCardClick}
      >
        <div className="flashcard-inner">
          <div className="card-front">
            <h2>{cards[currentCardIndex]?.sourceText}</h2>
          </div>
          <div className="card-back">
            <h2>{cards[currentCardIndex]?.targetText}</h2>
          </div>
        </div>
      </div>
      <div className="card-info">
        <p>
          {formatDifficulty(cards[currentCardIndex]?.difficulty)} • {formatCategory(cards[currentCardIndex]?.category)}
        </p>
      </div>
      <CardNavigation 
        currentIndex={currentCardIndex}
        totalCards={cards.length}
        onNext={onNext}
        onPrev={onPrev}
      />
    </>
  );
};

export default FlashCards; 