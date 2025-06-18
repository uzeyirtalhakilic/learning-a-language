import React, { useState, useEffect } from 'react';
import { formatDifficulty, formatCategory } from '../utils/formatters';
import CardNavigation from './CardNavigation';
import '../styles/Quiz.css';

const MultipleChoiceQuiz = ({ 
  cards, 
  currentCardIndex, 
  isFlipped, 
  onNext, 
  onPrev, 
  isShuffling, 
  onCardClick 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [options, setOptions] = useState([]);
  const [showResult, setShowResult] = useState(false);
  
  // Sınav modu state'leri
  const [isExamMode, setIsExamMode] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [examCards, setExamCards] = useState([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [examScore, setExamScore] = useState({ correct: 0, incorrect: 0 });
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResults, setExamResults] = useState([]);

  // Generate multiple choice options
  const generateOptions = (correctAnswer, allCards) => {
    const correctText = correctAnswer.targetText;
    const otherCards = allCards.filter(card => card.targetText !== correctText);
    
    // Get 3 random wrong answers
    const wrongAnswers = [];
    const shuffledCards = [...otherCards].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(3, shuffledCards.length); i++) {
      wrongAnswers.push(shuffledCards[i].targetText);
    }
    
    // If we don't have enough wrong answers, add some dummy options
    while (wrongAnswers.length < 3) {
      wrongAnswers.push(`Seçenek ${wrongAnswers.length + 1}`);
    }
    
    // Combine correct and wrong answers, then shuffle
    const allOptions = [correctText, ...wrongAnswers];
    return allOptions.sort(() => Math.random() - 0.5);
  };

  // Filter cards by level
  const filterCardsByLevel = (level) => {
    if (level === 'all') return cards;
    return cards.filter(card => card.difficulty?.toLowerCase() === level.toLowerCase());
  };

  // Start exam
  const startExam = () => {
    const filteredCards = filterCardsByLevel(selectedLevel);
    if (filteredCards.length === 0) {
      alert('Bu seviyede kart bulunamadı!');
      return;
    }
    
    // Use cards in original order (no shuffling)
    setExamCards(filteredCards);
    setCurrentExamIndex(0);
    setExamScore({ correct: 0, incorrect: 0 });
    setExamCompleted(false);
    setExamResults([]);
    setIsExamMode(true);
    
    // Generate options for first question
    const firstCard = filteredCards[0];
    const firstOptions = generateOptions(firstCard, filteredCards);
    setOptions(firstOptions);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResult(false);
    
    // Ensure card starts on front side
    if (isFlipped) {
      onCardClick();
    }
  };

  // Reset exam
  const resetExam = () => {
    setIsExamMode(false);
    setExamCards([]);
    setCurrentExamIndex(0);
    setExamScore({ correct: 0, incorrect: 0 });
    setExamCompleted(false);
    setExamResults([]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResult(false);
  };

  // Reset quiz state when card changes (normal mode)
  useEffect(() => {
    if (!isExamMode && cards.length > 0 && currentCardIndex < cards.length) {
      const currentCard = cards[currentCardIndex];
      const newOptions = generateOptions(currentCard, cards);
      setOptions(newOptions);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      
      // Reset card to front side
      if (isFlipped) {
        onCardClick();
      }
    }
  }, [currentCardIndex, cards, isFlipped, onCardClick, isExamMode]);

  // Reset card to front side when exam card changes
  useEffect(() => {
    if (isExamMode && examCards.length > 0) {
      // Ensure card is on front side when exam card changes
      if (isFlipped) {
        onCardClick();
      }
    }
  }, [currentExamIndex, isExamMode, isFlipped, onCardClick]);

  // Reset when shuffling
  useEffect(() => {
    if (isShuffling) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
    }
  }, [isShuffling]);

  const handleOptionSelect = (option) => {
    if (showResult) return; // Prevent changing answer after submission
    
    setSelectedAnswer(option);
    
    if (isExamMode) {
      const currentCard = examCards[currentExamIndex];
      const isAnswerCorrect = option === currentCard.targetText;
      setIsCorrect(isAnswerCorrect);
      setShowResult(true);
      
      // Update score
      setExamScore(prev => ({
        correct: prev.correct + (isAnswerCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isAnswerCorrect ? 0 : 1)
      }));
      
      // Save result
      setExamResults(prev => [...prev, {
        card: currentCard,
        selectedAnswer: option,
        isCorrect: isAnswerCorrect
      }]);
      
      // Auto-flip card after a short delay to show answer
      setTimeout(() => {
        if (!isFlipped) {
          onCardClick();
        }
      }, 1000);
      
      // Auto-advance to next question after showing answer
      setTimeout(() => {
        if (currentExamIndex < examCards.length - 1) {
          setCurrentExamIndex(prev => {
            const nextIndex = prev + 1;
            const nextCard = examCards[nextIndex];
            const nextOptions = generateOptions(nextCard, examCards);
            setOptions(nextOptions);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setShowResult(false);
            return nextIndex;
          });
        } else {
          setExamCompleted(true);
        }
      }, 2000); // Show answer for 2 seconds total
    } else {
      const currentCard = cards[currentCardIndex];
      const isAnswerCorrect = option === currentCard.targetText;
      setIsCorrect(isAnswerCorrect);
      setShowResult(true);
      
      // Auto-flip card after a short delay to show correct answer
      setTimeout(() => {
        if (!isFlipped) {
          onCardClick();
        }
      }, 1000);
    }
  };

  const handleNext = () => {
    if (isExamMode) {
      if (currentExamIndex < examCards.length - 1) {
        setCurrentExamIndex(prev => {
          const nextIndex = prev + 1;
          const nextCard = examCards[nextIndex];
          const nextOptions = generateOptions(nextCard, examCards);
          setOptions(nextOptions);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setShowResult(false);
          return nextIndex;
        });
      } else {
        setExamCompleted(true);
      }
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      onNext();
    }
  };

  const handlePrev = () => {
    if (isExamMode) {
      if (currentExamIndex > 0) {
        setCurrentExamIndex(prev => {
          const prevIndex = prev - 1;
          const prevCard = examCards[prevIndex];
          const prevOptions = generateOptions(prevCard, examCards);
          setOptions(prevOptions);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setShowResult(false);
          return prevIndex;
        });
      }
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      onPrev();
    }
  };

  // Exam setup screen
  if (!isExamMode) {
    return (
      <div className="quiz-container">
        <div className="exam-setup">
          <h2 className="exam-title">Çoktan Seçmeli Sınav</h2>
          <p className="exam-description">
            Seviye seçin ve sınavı başlatın. Sınav sırasında doğru ve yanlış cevaplarınız takip edilecektir.
          </p>
          
          <div className="level-selection">
            <label htmlFor="level-select">Seviye Seçin:</label>
            <select 
              id="level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="level-select"
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="beginner">Başlangıç</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İleri</option>
            </select>
          </div>
          
          <div className="exam-info">
            <p>Seçilen seviyede <strong>{filterCardsByLevel(selectedLevel).length}</strong> kart bulunmaktadır.</p>
          </div>
          
          <button 
            onClick={startExam}
            className="start-exam-button"
            disabled={filterCardsByLevel(selectedLevel).length === 0}
          >
            🚀 Sınavı Başlat
          </button>
        </div>
      </div>
    );
  }

  // Exam completed screen
  if (examCompleted) {
    const totalQuestions = examCards.length;
    const correctAnswers = examScore.correct;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    return (
      <div className="quiz-container">
        <div className="exam-results">
          <h2 className="exam-title">Sınav Tamamlandı!</h2>
          
          <div className="score-summary">
            <div className="score-card">
              <h3>Toplam Soru</h3>
              <p className="score-number">{totalQuestions}</p>
            </div>
            <div className="score-card correct">
              <h3>Doğru</h3>
              <p className="score-number">{correctAnswers}</p>
            </div>
            <div className="score-card incorrect">
              <h3>Yanlış</h3>
              <p className="score-number">{examScore.incorrect}</p>
            </div>
            <div className="score-card percentage">
              <h3>Başarı Oranı</h3>
              <p className="score-number">{percentage}%</p>
            </div>
          </div>
          
          <div className="exam-actions">
            <button onClick={resetExam} className="retry-exam-button">
              🔄 Yeni Sınav
            </button>
            <button onClick={() => setIsExamMode(false)} className="back-to-setup-button">
              ← Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal quiz mode (not exam)
  if (!isExamMode && (!cards.length || currentCardIndex >= cards.length)) {
    return <div>Kart bulunamadı.</div>;
  }

  // Exam mode - show current question
  const currentCard = isExamMode ? examCards[currentExamIndex] : cards[currentCardIndex];

  return (
    <div className="quiz-container">
      {/* Exam Header */}
      {isExamMode && (
        <div className="exam-header">
          <div className="exam-progress">
            <span className="question-counter">
              Soru {currentExamIndex + 1} / {examCards.length}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentExamIndex + 1) / examCards.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="exam-score">
            <div className="score-item correct">
              <span className="score-label">Doğru:</span>
              <span className="score-value">{examScore.correct}</span>
            </div>
            <div className="score-item incorrect">
              <span className="score-label">Yanlış:</span>
              <span className="score-value">{examScore.incorrect}</span>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`quiz-card ${isFlipped ? 'flipped' : ''} ${isShuffling ? 'shuffling' : ''}`}
      >
        <div className="quiz-card-inner">
          <div className="quiz-front">
            <h1 className="quiz-text" style={{ fontSize: '2.5rem', fontWeight: '500' }}>
              {currentCard.sourceText}
            </h1>
            <p className="quiz-instruction">
              {isExamMode ? 'Aşağıdaki seçeneklerden doğru çeviriyi seçin:' : 'Aşağıdaki seçeneklerden doğru çeviriyi seçin:'}
            </p>
          </div>
          <div className="quiz-back">
            <h1 className="quiz-text" style={{ fontSize: '2.5rem', fontWeight: '500' }}>
              {currentCard.targetText}
            </h1>
            {isCorrect ? (
              <p className="success-message">Tebrikler! Doğru cevap!</p>
            ) : (
              <p className="error-message">Yanlış cevap. Doğru cevap: {currentCard.targetText}</p>
            )}
          </div>
        </div>
      </div>

      <div className="quiz-controls">
        <div className="multiple-choice-options">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className={`option-button ${
                selectedAnswer === option 
                  ? isCorrect 
                    ? 'correct' 
                    : 'incorrect'
                  : showResult && option === currentCard.targetText
                    ? 'correct-answer'
                    : ''
              } ${showResult ? 'disabled' : ''}`}
              disabled={showResult}
            >
              {option}
            </button>
          ))}
        </div>
        
        {showResult && !isExamMode && (
          <div className="result-message">
            {isCorrect ? (
              <p className="success-text">Tebrikler! Doğru cevap!</p>
            ) : (
              <p className="error-text">Yanlış cevap. Doğru cevap: {currentCard.targetText}</p>
            )}
          </div>
        )}
      </div>

      <div className="card-info">
        <p>
          {formatDifficulty(currentCard?.difficulty)} • {formatCategory(currentCard?.category)}
        </p>
      </div>
      
      {!isExamMode && (
        <CardNavigation 
          currentIndex={currentCardIndex}
          totalCards={cards.length}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default MultipleChoiceQuiz;