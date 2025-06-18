import React, { useEffect } from 'react';
import { formatDifficulty, formatCategory } from '../utils/formatters';
import CardNavigation from './CardNavigation';
import '../styles/Quiz.css';

const Quiz = ({ cards, currentCardIndex, isFlipped, userAnswer, setUserAnswer, isCorrect, onSubmit, onNext, onPrev, isShuffling, onCardClick }) => {
  // Reset card to front side when card index changes or shuffling starts
  useEffect(() => {
    if (isFlipped && !isShuffling) {
      onCardClick();
    }
  }, [currentCardIndex, isShuffling]);

  // Handle correct answer
  useEffect(() => {
    if (isCorrect === true && !isFlipped && !isShuffling) {
      onCardClick();
    }
  }, [isCorrect, isFlipped, onCardClick, isShuffling]);

  return (
    <div className="quiz-container">
      <div 
        className={`quiz-card ${isFlipped ? 'flipped' : ''} ${isShuffling ? 'shuffling' : ''}`}
      >
        <div className="quiz-card-inner">
          <div className="quiz-front">
            <h1 className="quiz-text" style={{ fontSize: '2.5rem', fontWeight: '500' }}>{cards[currentCardIndex]?.sourceText}</h1>
          </div>
          <div className="quiz-back">
            <h1 className="quiz-text" style={{ fontSize: '2.5rem', fontWeight: '500' }}>{cards[currentCardIndex]?.targetText}</h1>
            <p className="success-message">Tebrikler!</p>
          </div>
        </div>
      </div>

      <div className="quiz-controls">
        <form onSubmit={onSubmit} className="quiz-form">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Cevabınızı yazın..."
            className="quiz-input"
          />
          <button type="submit" className="submit-button">
            Kontrol Et
          </button>
        </form>
        {isCorrect === false && (
          <p className="error-message">Tekrar deneyin!</p>
        )}
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
    </div>
  );
};

export default Quiz; 