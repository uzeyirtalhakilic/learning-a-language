const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all tags
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Tags');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tag by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Tags WHERE tag_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a tag
router.post('/', async (req, res) => {
    const { tag_name, color } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO Tags (tag_name, color) VALUES (?, ?)',
            [tag_name, color]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a tag
router.put('/:id', async (req, res) => {
    const { tag_name, color } = req.body;
    try {
        await db.execute(
            'UPDATE Tags SET tag_name = ?, color = ? WHERE tag_id = ?',
            [tag_name, color, req.params.id]
        );
        res.status(200).json({ message: 'Tag updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a tag
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM Tags WHERE tag_id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 