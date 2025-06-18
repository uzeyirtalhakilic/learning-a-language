const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all favorites
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT f.*, 
                   w.word as word_text, w.languageID as word_language_id,
                   s.sentence as sentence_text, s.languageID as sentence_language_id
            FROM Favorites f
            LEFT JOIN Words w ON f.word_id = w.word_id
            LEFT JOIN Sentences s ON f.sentence_id = s.sentence_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a favorite
router.post('/', async (req, res) => {
    const { word_id, sentence_id } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO Favorites (word_id, sentence_id) VALUES (?, ?)',
            [word_id, sentence_id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a favorite
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM Favorites WHERE favorite_id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 