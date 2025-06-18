export const formatDifficulty = (difficulty) => {
  const difficultyMap = {
    'beginner': 'Başlangıç',
    'elementary': 'Temel',
    'pre-intermediate': 'Orta Altı',
    'intermediate': 'Orta',
    'upper-intermediate': 'Orta Üstü',
    'advanced': 'İleri'
  };
  return difficultyMap[difficulty?.toLowerCase()] || difficulty;
};

export const formatCategory = (category) => {
  const categoryMap = {
    'greetings': 'Selamlaşma',
    'food': 'Yemek',
    'travel': 'Seyahat',
    'business': 'İş'
  };
  return categoryMap[category?.toLowerCase()] || category;
}; 