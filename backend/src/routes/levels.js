const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all levels
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Levels');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get level by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Levels WHERE level_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Level not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new level
router.post('/', async (req, res) => {
    const { level_name } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO Levels (level_name) VALUES (?)', [level_name]);
        res.status(201).json({ id: result.insertId, level_name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update level
router.put('/:id', async (req, res) => {
    const { level_name } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Levels SET level_name = ? WHERE level_id = ?',
            [level_name, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Level not found' });
        }
        res.json({ id: req.params.id, level_name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete level
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Levels WHERE level_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Level not found' });
        }
        res.json({ message: 'Level deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 