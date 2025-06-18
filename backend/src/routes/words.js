const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all words
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT w.*, l.language, c.category, lev.level_name 
            FROM Words w
            LEFT JOIN Languages l ON w.languageID = l.language_id
            LEFT JOIN Categories c ON w.categoryID = c.category_id
            LEFT JOIN Levels lev ON w.level_id = lev.level_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get word by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT w.*, l.language, c.category, lev.level_name 
            FROM Words w
            LEFT JOIN Languages l ON w.languageID = l.language_id
            LEFT JOIN Categories c ON w.categoryID = c.category_id
            LEFT JOIN Levels lev ON w.level_id = lev.level_id
            WHERE w.word_id = ?
        `, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new word
router.post('/', async (req, res) => {
    const { word, level_id, languageID, categoryID } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Words (word, level_id, languageID, categoryID) VALUES (?, ?, ?, ?)',
            [word, level_id, languageID, categoryID]
        );
        res.status(201).json({ 
            id: result.insertId, 
            word, 
            level_id, 
            languageID, 
            categoryID 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update word
router.put('/:id', async (req, res) => {
    const { word, level_id, languageID, categoryID } = req.body;
    try {
        // First check if the word exists
        const [existingWord] = await pool.query(
            'SELECT * FROM Words WHERE word_id = ?',
            [req.params.id]
        );

        if (existingWord.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }

        // Update the word
        const [result] = await pool.query(
            'UPDATE Words SET word = ?, level_id = ?, languageID = ?, categoryID = ? WHERE word_id = ?',
            [word, level_id, languageID, categoryID, req.params.id]
        );

        // Get the updated word with all related information
        const [updatedWord] = await pool.query(`
            SELECT w.*, l.language, c.category, lev.level_name 
            FROM Words w
            LEFT JOIN Languages l ON w.languageID = l.language_id
            LEFT JOIN Categories c ON w.categoryID = c.category_id
            LEFT JOIN Levels lev ON w.level_id = lev.level_id
            WHERE w.word_id = ?
        `, [req.params.id]);

        res.json(updatedWord[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete word
router.delete('/:id', async (req, res) => {
    try {
        // Start a transaction
        await pool.query('START TRANSACTION');

        try {
            // Delete related records first
            await pool.query('DELETE FROM translate_of_word WHERE word_id_1 = ? OR word_id_2 = ?', [req.params.id, req.params.id]);
            await pool.query('DELETE FROM Favorites WHERE word_id = ?', [req.params.id]);
            await pool.query('DELETE FROM Notes WHERE word_id = ?', [req.params.id]);
            await pool.query('DELETE FROM words_of_sentences WHERE wordID = ?', [req.params.id]);

            // Finally delete the word itself
            const [result] = await pool.query('DELETE FROM Words WHERE word_id = ?', [req.params.id]);
            
            if (result.affectedRows === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Word not found' });
            }

            // If everything is successful, commit the transaction
            await pool.query('COMMIT');
            res.json({ message: 'Word and all related records deleted successfully' });
        } catch (error) {
            // If any error occurs, rollback the transaction
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            message: 'Error deleting word and related records',
            error: error.message 
        });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    console.log('Fetching categories...');
    const [categories] = await pool.query('SELECT * FROM Categories ORDER BY categoryID');
    console.log('Categories fetched:', categories);
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      message: 'Error fetching categories',
      error: err.message 
    });
  }
});

// Get all levels
router.get('/levels', async (req, res) => {
  try {
    console.log('Fetching levels...');
    const [levels] = await pool.query('SELECT * FROM Levels ORDER BY level_id');
    console.log('Levels fetched:', levels);
    res.json(levels);
  } catch (err) {
    console.error('Error fetching levels:', err);
    res.status(500).json({ 
      message: 'Error fetching levels',
      error: err.message 
    });
  }
});

// Search words
router.get('/search', async (req, res) => {
    const { text, languageId } = req.query;
    try {
        const [rows] = await pool.query(`
            SELECT w.*, l.language, c.category, lev.level_name 
            FROM Words w
            LEFT JOIN Languages l ON w.languageID = l.language_id
            LEFT JOIN Categories c ON w.categoryID = c.category_id
            LEFT JOIN Levels lev ON w.level_id = lev.level_id
            WHERE w.languageID = ? AND w.word LIKE ?
            LIMIT 5
        `, [languageId, `%${text}%`]);
        res.json(rows);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 