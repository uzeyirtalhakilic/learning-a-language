const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Categories WHERE category_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new category
router.post('/', async (req, res) => {
    const { category } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO Categories (category) VALUES (?)', [category]);
        res.status(201).json({ id: result.insertId, category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    const { category } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Categories SET category = ? WHERE category_id = ?',
            [category, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ id: req.params.id, category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Categories WHERE category_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 