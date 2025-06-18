import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FlashCards from '../components/FlashCards';
import Quiz from '../components/Quiz';
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';
import Filters from '../components/Filters';
import '../styles/Cards.css'

function Cards() {
  const { sourceId, targetId } = useParams();
  const navigate = useNavigate();
  const [sourceLanguage, setSourceLanguage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('flashcards');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all'
  });
  const [isShuffling, setIsShuffling] = useState(false);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    setIsFlipped(false);
    setIsCorrect(null);
    setUserAnswer('');
    
    // Add a small delay to show the shuffle animation
    setTimeout(() => {
      setCards(prevCards => shuffleArray(prevCards));
      setCurrentCardIndex(0);
      setIsShuffling(false);
    }, 500);
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);

        const sourceResponse = await axios.get(`http://localhost:3000/api/languages/${sourceId}`);
        setSourceLanguage(sourceResponse.data);

        const targetResponse = await axios.get(`http://localhost:3000/api/languages/${targetId}`);
        setTargetLanguage(targetResponse.data);

        const cardsResponse = await axios.get(`http://localhost:3000/api/languages/${sourceId}/cards/${targetId}`);
        
        const formattedCards = cardsResponse.data.map(card => ({
          ...card,
          sourceText: card.source_text,
          targetText: card.target_text,
          difficulty: card.difficulty,
          category: card.category
        }));
        
        // Shuffle cards initially
        setCards(shuffleArray(formattedCards));

      } catch (error) {
        console.error('API Error:', error);
        if (error.response?.status !== 404) {
          setError(error.response?.data?.message || 'Dil bilgileri yüklenirken bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, [sourceId, targetId]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    // First flip the card back if it's flipped
    if (isFlipped) {
      setIsFlipped(false);
      // Wait for the flip animation to complete before changing the card
      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredCards.length);
      }, 300);
    } else {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredCards.length);
    }
  };

  const handlePrevCard = () => {
    // First flip the card back if it's flipped
    if (isFlipped) {
      setIsFlipped(false);
      // Wait for the flip animation to complete before changing the card
      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
      }, 300);
    } else {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentCardIndex(0);
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const currentCard = filteredCards[currentCardIndex];
    const isAnswerCorrect = userAnswer.trim().toLowerCase() === currentCard.targetText.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      handleCardClick();
    }
  };

  const handleNextQuiz = () => {
    setUserAnswer('');
    setIsCorrect(null);
    // First flip the card back if it's flipped
    if (isFlipped) {
      setIsFlipped(false);
      // Wait for the flip animation to complete before changing the card
      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredCards.length);
      }, 300);
    } else {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredCards.length);
    }
  };

  const handlePrevQuiz = () => {
    setUserAnswer('');
    setIsCorrect(null);
    // First flip the card back if it's flipped
    if (isFlipped) {
      setIsFlipped(false);
      // Wait for the flip animation to complete before changing the card
      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
      }, 300);
    } else {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const filteredCards = cards.filter(card => {
    if (filters.difficulty !== 'all' && card.difficulty?.toLowerCase() !== filters.difficulty) return false;
    if (filters.category !== 'all' && card.category?.toLowerCase() !== filters.category) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Loading...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <button 
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Ana Sayfaya Dön
          </button>
          <h1>Error</h1>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <button 
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Ana Sayfaya Dön
        </button>
        <h1>{sourceLanguage?.language} → {targetLanguage?.language}</h1>
        <button 
          onClick={() => navigate('/words-Management')}
          className="settings-button"
        >
          ⚙️ Kelime Yönetimi
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          Flash Kartlar
        </button>
        <button 
          className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          Quiz Modu
        </button>
        <button 
          className={`tab-button ${activeTab === 'multiple-choice' ? 'active' : ''}`}
          onClick={() => setActiveTab('multiple-choice')}
        >
          Çoktan Seçmeli
        </button>
      </div>

      <div className="content-wrapper">
        <div className="cards-section">
          {filteredCards.length > 0 ? (
            <div className="card-container">
              <button 
                onClick={handleShuffle}
                className={`shuffle-button ${isShuffling ? 'shuffling' : ''}`}
                disabled={isShuffling}
              >
                🔄 Karıştır
              </button>
              {activeTab === 'flashcards' ? (
                <FlashCards 
                  cards={filteredCards}
                  currentCardIndex={currentCardIndex}
                  isFlipped={isFlipped}
                  onCardClick={handleCardClick}
                  onNext={handleNextCard}
                  onPrev={handlePrevCard}
                  isShuffling={isShuffling}
                />
              ) : activeTab === 'quiz' ? (
                <Quiz 
                  cards={filteredCards}
                  currentCardIndex={currentCardIndex}
                  isFlipped={isFlipped}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  isCorrect={isCorrect}
                  onSubmit={handleAnswerSubmit}
                  onNext={handleNextQuiz}
                  onPrev={handlePrevQuiz}
                  isShuffling={isShuffling}
                  onCardClick={handleCardClick}
                />
              ) : (
                <MultipleChoiceQuiz 
                  cards={filteredCards}
                  currentCardIndex={currentCardIndex}
                  isFlipped={isFlipped}
                  onNext={handleNextQuiz}
                  onPrev={handlePrevQuiz}
                  isShuffling={isShuffling}
                  onCardClick={handleCardClick}
                />
              )}
            </div>
          ) : (
            <div className="no-cards-container">
              <p className="no-cards-message">
                {filters.difficulty !== 'all' || filters.category !== 'all' 
                  ? 'Bu kriterlere uygun kart bulunamadı.'
                  : `"${sourceLanguage?.language}" ve "${targetLanguage?.language}" dilleri arasında kelime çifti bulunamadı.`}
              </p>
              <button 
                onClick={() => navigate('/settings')}
                className="add-words-button"
              >
                Kelime Ekle!
              </button>
            </div>
          )}
        </div>

        <Filters 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
}

export default Cards; 