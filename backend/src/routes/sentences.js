const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all sentences
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, l.language, c.category, lev.level_name 
            FROM Sentences s
            LEFT JOIN Languages l ON s.languageID = l.language_id
            LEFT JOIN Categories c ON s.categoryID = c.category_id
            LEFT JOIN Levels lev ON s.level_id = lev.level_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sentence by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, l.language, c.category, lev.level_name 
            FROM Sentences s
            LEFT JOIN Languages l ON s.languageID = l.language_id
            LEFT JOIN Categories c ON s.categoryID = c.category_id
            LEFT JOIN Levels lev ON s.level_id = lev.level_id
            WHERE s.sentence_id = ?
        `, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sentence not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new sentence
router.post('/', async (req, res) => {
    const { sentence, level_id, languageID, categoryID } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Sentences (sentence, level_id, languageID, categoryID) VALUES (?, ?, ?, ?)',
            [sentence, level_id, languageID, categoryID]
        );
        res.status(201).json({ 
            id: result.insertId, 
            sentence, 
            level_id, 
            languageID, 
            categoryID 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update sentence
router.put('/:id', async (req, res) => {
    const { sentence, level_id, languageID, categoryID } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Sentences SET sentence = ?, level_id = ?, languageID = ?, categoryID = ? WHERE sentence_id = ?',
            [sentence, level_id, languageID, categoryID, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sentence not found' });
        }
        res.json({ 
            id: req.params.id, 
            sentence, 
            level_id, 
            languageID, 
            categoryID 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete sentence
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Sentences WHERE sentence_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sentence not found' });
        }
        res.json({ message: 'Sentence deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 