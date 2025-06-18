import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/WordsManagement.css';

function WordsManagement() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [words, setWords] = useState([]);
  const [unlinkedWords, setUnlinkedWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWord, setNewWord] = useState({
    sourceText: '',
    targetText: '',
    difficulty: '',
    category: ''
  });
  const [showUnlinkedWords, setShowUnlinkedWords] = useState(false);
  const [targetWordInputs, setTargetWordInputs] = useState({});
  const [existingWords, setExistingWords] = useState([]);
  const [searchResults, setSearchResults] = useState({});

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/languages');
        console.log('Languages response:', response.data);
        setLanguages(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching languages:', err);
        setError('Diller yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    const fetchCategoriesAndLevels = async () => {
      setIsLoading(true);
      setError('');
      try {
        console.log('Fetching categories and levels...');
        const [categoriesRes, levelsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/categories'),
          axios.get('http://localhost:3000/api/levels')
        ]);
        
        console.log('Categories response:', categoriesRes.data);
        console.log('Levels response:', levelsRes.data);

        if (!categoriesRes.data || !levelsRes.data) {
          throw new Error('Invalid response from server');
        }

        setCategories(categoriesRes.data);
        setLevels(levelsRes.data);
        
        // Set default values if available
        if (categoriesRes.data.length > 0 && levelsRes.data.length > 0) {
          setNewWord(prev => ({
            ...prev,
            category: categoriesRes.data[0].category_id.toString(),
            difficulty: levelsRes.data[0].level_id.toString()
          }));
        } else {
          setError('Kategori veya seviye bilgisi bulunamadı');
        }
      } catch (err) {
        console.error('Error fetching categories and levels:', err);
        setError('Kategori ve seviye bilgileri yüklenirken bir hata oluştu: ' + 
          (err.response?.data?.error || err.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndLevels();
  }, []);

  useEffect(() => {
    const fetchUnlinkedWords = async () => {
      if (!selectedSource || !selectedTarget) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/languages/${selectedSource.language_id}/unlinked-words/${selectedTarget.language_id}`
        );
        setUnlinkedWords(response.data);
        setLoading(false);
      } catch (err) {
        setError('Bağlantısız kelimeler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchUnlinkedWords();
  }, [selectedSource, selectedTarget]);

  useEffect(() => {
    const fetchWords = async () => {
      if (!selectedSource || !selectedTarget) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/languages/${selectedSource.language_id}/cards/${selectedTarget.language_id}`
        );
        setWords(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          // If no word pairs found, just set empty array
          setWords([]);
        } else {
          setError('Kelimeler yüklenirken bir hata oluştu.');
        }
        setLoading(false);
      }
    };

    fetchWords();
  }, [selectedSource, selectedTarget]);

  const handleLanguageSelect = (language, type) => {
    if (type === 'source') {
      setSelectedSource(language);
    } else {
      setSelectedTarget(language);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!selectedSource || !selectedTarget) return;

    try {
      // First create the source word
      const sourceWordResponse = await axios.post('http://localhost:3000/api/words', {
        word: newWord.sourceText,
        level_id: parseInt(newWord.difficulty),
        languageID: selectedSource.language_id,
        categoryID: parseInt(newWord.category)
      });

      // Then create the target word and link them
      const response = await axios.post(
        `http://localhost:3000/api/languages/${selectedSource.language_id}/link-word/${selectedTarget.language_id}`,
        {
          word_id: sourceWordResponse.data.id,
          target_text: newWord.targetText
        }
      );

      setWords([...words, response.data]);
      setIsAddingWord(false);
      setNewWord({
        sourceText: '',
        targetText: '',
        difficulty: levels[0]?.level_id.toString() || '',
        category: categories[0]?.category_id.toString() || ''
      });
    } catch (err) {
      console.error('Add error:', err);
      setError('Kelime eklenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditWord = async (e) => {
    e.preventDefault();
    if (!selectedSource || !selectedTarget || !editingWord) return;

    try {
      // Update source word
      await axios.put(`http://localhost:3000/api/words/${editingWord.source_word_id}`, {
        word: newWord.sourceText,
        level_id: parseInt(newWord.difficulty),
        languageID: selectedSource.language_id,
        categoryID: parseInt(newWord.category)
      });

      // Update target word
      await axios.put(`http://localhost:3000/api/words/${editingWord.target_word_id}`, {
        word: newWord.targetText,
        level_id: parseInt(newWord.difficulty),
        languageID: selectedTarget.language_id,
        categoryID: parseInt(newWord.category)
      });

      // Refresh the words list
      const response = await axios.get(
        `http://localhost:3000/api/languages/${selectedSource.language_id}/cards/${selectedTarget.language_id}`
      );
      setWords(response.data);
      setEditingWord(null);
      setNewWord({
        sourceText: '',
        targetText: '',
        difficulty: levels[0]?.level_id.toString() || '',
        category: categories[0]?.category_id.toString() || ''
      });
    } catch (err) {
      console.error('Edit error:', err);
      setError('Kelime düzenlenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditClick = (word) => {
    setEditingWord(word);
    setNewWord({
      sourceText: word.source_text,
      targetText: word.target_text,
      difficulty: word.level_id?.toString() || levels[0]?.level_id.toString() || '',
      category: word.category_id?.toString() || categories[0]?.category_id.toString() || ''
    });
  };

  const handleDeleteWord = async (sourceWordId) => {
    if (!selectedSource || !selectedTarget) return;

    try {
      // Find the word pair to get the target word ID
      const wordPair = words.find(w => w.source_word_id === sourceWordId);
      if (!wordPair) {
        setError('Kelime çifti bulunamadı.');
        return;
      }

      // Delete the word pair and all related records
      await axios.delete(
        `http://localhost:3000/api/languages/${selectedSource.language_id}/word-pairs/${sourceWordId}/${wordPair.target_word_id}`
      );
      
      // Update the words list
      setWords(words.filter(word => word.source_word_id !== sourceWordId));
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Kelime silinirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
    }
  };

  const searchExistingWords = async (searchText, wordId) => {
    if (!searchText || !selectedTarget) return;
    
    try {
      const response = await axios.get(
        `http://localhost:3000/api/words/search?text=${encodeURIComponent(searchText)}&languageId=${selectedTarget.language_id}`
      );
      setSearchResults(prev => ({
        ...prev,
        [wordId]: response.data
      }));
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleTargetWordChange = (wordId, value) => {
    setTargetWordInputs(prev => ({
      ...prev,
      [wordId]: value
    }));
    searchExistingWords(value, wordId);
  };

  const handleWordSelection = (wordId, selectedWord) => {
    setTargetWordInputs(prev => ({
      ...prev,
      [wordId]: selectedWord.word
    }));
    setSearchResults(prev => ({
      ...prev,
      [wordId]: []
    }));
  };

  const handleLinkWordConfirm = async (wordId) => {
    const targetText = targetWordInputs[wordId];
    if (!targetText) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/languages/${selectedSource.language_id}/link-word/${selectedTarget.language_id}`,
        { 
          word_id: wordId,
          target_text: targetText
        }
      );
      
      // Remove from unlinked words and add to regular words
      setUnlinkedWords(unlinkedWords.filter(word => word.word_id !== wordId));
      setWords([...words, response.data]);
      // Clear the input and search results
      setTargetWordInputs(prev => {
        const newState = { ...prev };
        delete newState[wordId];
        return newState;
      });
      setSearchResults(prev => {
        const newState = { ...prev };
        delete newState[wordId];
        return newState;
      });
    } catch (err) {
      setError('Kelime bağlanırken bir hata oluştu.');
    }
  };

  const handleDeleteUnlinkedWord = async (wordId) => {
    if (!selectedSource) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/languages/${selectedSource.language_id}/unlinked-words/${wordId}`
      );
      setUnlinkedWords(unlinkedWords.filter(word => word.word_id !== wordId));
    } catch (err) {
      setError('Kelime silinirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <button 
              onClick={() => navigate(-1)}
              className="back-button"
            >
              ← Geri
            </button>
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <button 
              onClick={() => navigate(-1)}
              className="back-button"
            >
              ← Geri
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
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Geri
          </button>
          <h1>Kelime Yönetimi</h1>
        </div>

        <div className="language-selector">
          <div className="select-group">
            <label>Kaynak Dil:</label>
            <select 
              value={selectedSource?.language_id || ''} 
              onChange={(e) => {
                const lang = languages.find(l => l.language_id === parseInt(e.target.value));
                setSelectedSource(lang);
                setSelectedTarget(null);
                setWords([]);
              }}
            >
              <option value="">Dil Seçin</option>
              {languages.map(lang => (
                <option key={lang.language_id} value={lang.language_id}>
                  {lang.language}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label>Hedef Dil:</label>
            <select 
              value={selectedTarget?.language_id || ''} 
              onChange={(e) => {
                const lang = languages.find(l => l.language_id === parseInt(e.target.value));
                setSelectedTarget(lang);
              }}
              disabled={!selectedSource}
            >
              <option value="">Dil Seçin</option>
              {languages
                .filter(lang => lang.language_id !== selectedSource?.language_id)
                .map(lang => (
                  <option key={lang.language_id} value={lang.language_id}>
                    {lang.language}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {selectedSource && (
          <>
            <div className="section-header">
              <h2>Bağlantısız Kelimeler</h2>
              <button 
                onClick={() => setShowUnlinkedWords(!showUnlinkedWords)}
                className="toggle-button"
              >
                {showUnlinkedWords ? 'Gizle' : 'Göster'}
              </button>
            </div>

            {showUnlinkedWords && (
              <div className="words-list">
                {unlinkedWords.length > 0 ? (
                  unlinkedWords.map(word => (
                    <div key={word.word_id} className="word-item">
                      <div className="word-content">
                        <div className="word-text">
                          <span className="source-text">{word.source_text}</span>
                          <span className="separator">→</span>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder={`${selectedTarget?.language} karşılığını girin`}
                              className="target-input"
                              value={targetWordInputs[word.word_id] || ''}
                              onChange={(e) => handleTargetWordChange(word.word_id, e.target.value)}
                            />
                            {searchResults[word.word_id]?.length > 0 && (
                              <div className="search-results">
                                {searchResults[word.word_id].map(result => (
                                  <div
                                    key={result.word_id}
                                    className="search-result-item"
                                    onClick={() => handleWordSelection(word.word_id, result)}
                                  >
                                    {result.word}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="word-meta">
                          <span>Zorluk: {word.difficulty}</span>
                          <span>Kategori: {word.category}</span>
                        </div>
                      </div>
                      <div className="word-actions">
                        <button 
                          onClick={() => handleLinkWordConfirm(word.word_id)}
                          className="confirm-button"
                          disabled={!targetWordInputs[word.word_id]}
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => handleDeleteUnlinkedWord(word.word_id)}
                          className="delete-button"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-words-message">
                    {selectedSource && selectedTarget 
                      ? 'Bu dil çifti için bağlantısız kelime bulunmamaktadır.'
                      : 'Lütfen kaynak ve hedef dil seçin.'}
                  </div>
                )}
              </div>
            )}

            {selectedTarget && (
              <>
                <div className="section-header">
                  <h2>Kelime Listesi</h2>
                  <button 
                    onClick={() => setIsAddingWord(true)}
                    className="add-word-button"
                    disabled={isAddingWord || editingWord}
                  >
                    + Yeni Kelime Ekle
                  </button>
                </div>

                {(isAddingWord || editingWord) && (
                  <div className="word-form">
                    <h3>{editingWord ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}</h3>
                    <form onSubmit={editingWord ? handleEditWord : handleAddWord}>
                      <div className="form-group">
                        <label>Kaynak Kelime:</label>
                        <input
                          type="text"
                          value={newWord.sourceText}
                          onChange={(e) => setNewWord({...newWord, sourceText: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hedef Kelime:</label>
                        <input
                          type="text"
                          value={newWord.targetText}
                          onChange={(e) => setNewWord({...newWord, targetText: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Zorluk Seviyesi:</label>
                        <select
                          value={newWord.difficulty}
                          onChange={(e) => setNewWord({...newWord, difficulty: e.target.value})}
                          disabled={isLoading || levels.length === 0}
                        >
                          {levels.map(level => (
                            <option key={level.level_id} value={level.level_id.toString()}>
                              {level.level_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Kategori:</label>
                        <select
                          value={newWord.category}
                          onChange={(e) => setNewWord({...newWord, category: e.target.value})}
                          disabled={isLoading || categories.length === 0}
                        >
                          {categories.map(category => (
                            <option key={category.category_id} value={category.category_id.toString()}>
                              {category.category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-buttons">
                        <button type="submit" className="save-button">
                          {editingWord ? 'Kaydet' : 'Ekle'}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => {
                            setIsAddingWord(false);
                            setEditingWord(null);
                            setNewWord({
                              sourceText: '',
                              targetText: '',
                              difficulty: '',
                              category: ''
                            });
                          }}
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="words-list">
                  {words.length > 0 ? (
                    words.map(word => (
                      <div key={word.source_word_id} className="word-item">
                        <div className="word-content">
                          <div className="word-text">
                            <span className="source-text">{word.source_text}</span>
                            <span className="separator">→</span>
                            <span className="target-text">{word.target_text}</span>
                          </div>
                          <div className="word-meta">
                            <span>Zorluk: {word.difficulty}</span>
                            <span>Kategori: {word.category}</span>
                          </div>
                        </div>
                        <div className="word-actions">
                          <button 
                            onClick={() => handleEditClick(word)}
                            className="edit-button"
                            disabled={isAddingWord || editingWord}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteWord(word.source_word_id)}
                            className="delete-button"
                            disabled={isAddingWord || editingWord}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-words-message">
                      {selectedSource && selectedTarget 
                        ? 'Bu dil çifti için henüz kelime eklenmemiş. Yeni kelime eklemek için "Yeni Kelime Ekle" butonunu kullanın.'
                        : 'Lütfen kaynak ve hedef dil seçin.'}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WordsManagement; 