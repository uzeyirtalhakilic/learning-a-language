import React from 'react';

const Filters = ({ filters, onFilterChange }) => {
  return (
    <div className="filters-section">
      <h3>Filtreler</h3>
      <div className="filter-group">
        <label>Zorluk Seviyesi:</label>
        <select 
          value={filters.difficulty}
          onChange={(e) => onFilterChange('difficulty', e.target.value)}
          className="filter-select"
        >
          <option value="all">Tüm Seviyeler</option>
          <option value="beginner">Başlangıç</option>
          <option value="elementary">Temel</option>
          <option value="pre-intermediate">Orta Altı</option>
          <option value="intermediate">Orta</option>
          <option value="upper-intermediate">Orta Üstü</option>
          <option value="advanced">İleri</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Kategori:</label>
        <select 
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="all">Tüm Kategoriler</option>
          <option value="greetings">Selamlaşma</option>
          <option value="food">Yemek</option>
          <option value="travel">Seyahat</option>
          <option value="business">İş</option>
        </select>
      </div>
    </div>
  );
};

export default Filters; 