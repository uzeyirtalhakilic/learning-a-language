import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

function Home() {
  const [languages, setLanguages] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editLanguageName, setEditLanguageName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/languages');
        setLanguages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Diller yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleLanguageSelect = (language) => {
    if (selectedSource?.language_id === language.language_id) {
      setSelectedSource(null);
      return;
    }
    
    if (selectedTarget?.language_id === language.language_id) {
      setSelectedTarget(null);
      return;
    }

    if (!selectedSource) {
      setSelectedSource(language);
    } else if (!selectedTarget && language.language_id !== selectedSource.language_id) {
      setSelectedTarget(language);
    }
  };

  const handleReset = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const handleContinue = () => {
    if (selectedSource && selectedTarget) {
      navigate(`/language/${selectedSource.language_id}/${selectedTarget.language_id}`);
    }
  };

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    if (!newLanguage.trim()) return;

    setModalLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/languages', {
        language: newLanguage.trim()
      });
      setLanguages([...languages, response.data]);
      setNewLanguage('');
      setModalLoading(false);
    } catch (err) {
      setError('Dil eklenirken bir hata oluştu.');
      setModalLoading(false);
    }
  };

  const handleEditLanguage = (language) => {
    setEditingLanguage(language);
    setEditLanguageName(language.language);
  };

  const handleUpdateLanguage = async (e) => {
    e.preventDefault();
    if (!editLanguageName.trim()) return;

    setModalLoading(true);
    try {
      await axios.put(`http://localhost:3000/api/languages/${editingLanguage.language_id}`, {
        language: editLanguageName.trim()
      });
      
      setLanguages(languages.map(lang => 
        lang.language_id === editingLanguage.language_id 
          ? { ...lang, language: editLanguageName.trim() }
          : lang
      ));
      
      // Update selected languages if they were edited
      if (selectedSource?.language_id === editingLanguage.language_id) {
        setSelectedSource({ ...selectedSource, language: editLanguageName.trim() });
      }
      if (selectedTarget?.language_id === editingLanguage.language_id) {
        setSelectedTarget({ ...selectedTarget, language: editLanguageName.trim() });
      }
      
      setEditingLanguage(null);
      setEditLanguageName('');
      setModalLoading(false);
    } catch (err) {
      setError('Dil güncellenirken bir hata oluştu.');
      setModalLoading(false);
    }
  };

  const handleDeleteLanguage = async (language) => {
    if (!window.confirm(`"${language.language}" dilini ve tüm kelimelerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setModalLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/languages/${language.language_id}`);
      
      setLanguages(languages.filter(lang => lang.language_id !== language.language_id));
      
      // Remove from selected languages if they were deleted
      if (selectedSource?.language_id === language.language_id) {
        setSelectedSource(null);
      }
      if (selectedTarget?.language_id === language.language_id) {
        setSelectedTarget(null);
      }
      
      setModalLoading(false);
    } catch (err) {
      setError('Dil silinirken bir hata oluştu.');
      setModalLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLanguage(null);
    setEditLanguageName('');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <h1>Hata</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Dil Öğrenme</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="settings-button"
        >
          ⚙️Dil Yönetimi
        </button>
      </div>

      <div className="language-selection">
        <div className="selected-languages">
          <div className={`language-box ${selectedSource ? 'selected' : ''}`}>
            {selectedSource ? selectedSource.language : 'Kaynak Dil'}
          </div>
          <div className="arrow">→</div>
          <div className={`language-box ${selectedTarget ? 'selected' : ''}`}>
            {selectedTarget ? selectedTarget.language : 'Hedef Dil'}
          </div>
        </div>

        <div className="languages-grid">
          {languages.map((language) => (
            <div
              key={language.language_id}
              className={`language-card ${
                (selectedSource?.language_id === language.language_id ||
                  selectedTarget?.language_id === language.language_id)
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleLanguageSelect(language)}
            >
              <h2>{language.language}</h2>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button 
            className="reset-button" 
            onClick={handleReset}
            disabled={!selectedSource && !selectedTarget}
          >
            Sıfırla
          </button>
          <button 
            className="continue-button" 
            onClick={handleContinue}
            disabled={!selectedSource || !selectedTarget}
          >
            Devam Et
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal language-management-modal">
            <div className="modal-header">
              <h2>Dil Yönetimi</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLanguage(null);
                  setNewLanguage('');
                  setEditLanguageName('');
                }}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Add New Language Form */}
              <div className="add-language-section">
                <h3>Yeni Dil Ekle</h3>
                <form onSubmit={handleAddLanguage}>
                  <div className="form-group">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Dil adını girin"
                      className="language-input"
                      disabled={modalLoading}
                    />
                    <button 
                      type="submit"
                      className="add-button"
                      disabled={!newLanguage.trim() || modalLoading}
                    >
                      {modalLoading ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Language List */}
              <div className="language-list-section">
                <h3>Mevcut Diller</h3>
                <div className="language-list">
                  {languages.map((language) => (
                    <div key={language.language_id} className="language-item">
                      {editingLanguage?.language_id === language.language_id ? (
                        <form onSubmit={handleUpdateLanguage} className="edit-form">
                          <input
                            type="text"
                            value={editLanguageName}
                            onChange={(e) => setEditLanguageName(e.target.value)}
                            className="edit-input"
                            disabled={modalLoading}
                          />
                          <div className="edit-actions">
                            <button 
                              type="submit" 
                              className="save-button"
                              disabled={!editLanguageName.trim() || modalLoading}
                            >
                              {modalLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button 
                              type="button" 
                              onClick={handleCancelEdit}
                              className="cancel-button"
                              disabled={modalLoading}
                            >
                              İptal
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="language-info">
                          <span className="language-name">{language.language}</span>
                          <div className="language-actions">
                            <button 
                              onClick={() => handleEditLanguage(language)}
                              className="edit-button"
                              disabled={modalLoading}
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteLanguage(language)}
                              className="delete-button"
                              disabled={modalLoading}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLanguage(null);
                  setNewLanguage('');
                  setEditLanguageName('');
                }}
                className="close-modal-button"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home; 