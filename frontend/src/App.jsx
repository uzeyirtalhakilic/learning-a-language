import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cards from './pages/Cards';
import WordsManagement from './pages/WordsManagement';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/language/:sourceId/:targetId" element={<Cards />} />
        <Route path="/words-management" element={<WordsManagement />} />
      </Routes>
    </Router>
  );
}

export default App;