const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all notes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT n.*, 
                   w.word as word_text, w.languageID as word_language_id,
                   s.sentence as sentence_text, s.languageID as sentence_language_id
            FROM Notes n
            LEFT JOIN Words w ON n.word_id = w.word_id
            LEFT JOIN Sentences s ON n.sentence_id = s.sentence_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get note by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT n.*, 
                   w.word as word_text, w.languageID as word_language_id,
                   s.sentence as sentence_text, s.languageID as sentence_language_id
            FROM Notes n
            LEFT JOIN Words w ON n.word_id = w.word_id
            LEFT JOIN Sentences s ON n.sentence_id = s.sentence_id
            WHERE n.note_id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a note
router.post('/', async (req, res) => {
    const { word_id, sentence_id, note_text } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO Notes (word_id, sentence_id, note_text) VALUES (?, ?, ?)',
            [word_id, sentence_id, note_text]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a note
router.put('/:id', async (req, res) => {
    const { note_text } = req.body;
    try {
        await db.execute(
            'UPDATE Notes SET note_text = ? WHERE note_id = ?',
            [note_text, req.params.id]
        );
        res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM Notes WHERE note_id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 