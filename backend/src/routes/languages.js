const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all languages
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Languages');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get language by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Languages WHERE language_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Language not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new language
router.post('/', async (req, res) => {
    const { language } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO Languages (language) VALUES (?)', [language]);
        res.status(201).json({ id: result.insertId, language });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update language
router.put('/:id', async (req, res) => {
    const { language } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Languages SET language = ? WHERE language_id = ?',
            [language, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Language not found' });
        }
        res.json({ id: req.params.id, language });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete language
router.delete('/:id', async (req, res) => {
    try {
        // Start a transaction
        await pool.query('START TRANSACTION');

        try {
            const languageId = req.params.id;

            // Delete related favorites for words in this language
            await pool.query(`
                DELETE FROM Favorites 
                WHERE word_id IN (SELECT word_id FROM Words WHERE languageID = ?)
            `, [languageId]);

            // Delete related favorites for sentences in this language
            await pool.query(`
                DELETE FROM Favorites 
                WHERE sentence_id IN (SELECT sentence_id FROM Sentences WHERE languageID = ?)
            `, [languageId]);

            // Delete related notes for words in this language
            await pool.query(`
                DELETE FROM Notes 
                WHERE word_id IN (SELECT word_id FROM Words WHERE languageID = ?)
            `, [languageId]);

            // Delete related notes for sentences in this language
            await pool.query(`
                DELETE FROM Notes 
                WHERE sentence_id IN (SELECT sentence_id FROM Sentences WHERE languageID = ?)
            `, [languageId]);

            // Delete word translations that involve this language
            await pool.query(`
                DELETE FROM translate_of_word 
                WHERE word_id_1 IN (SELECT word_id FROM Words WHERE languageID = ?)
                   OR word_id_2 IN (SELECT word_id FROM Words WHERE languageID = ?)
            `, [languageId, languageId]);

            // Delete sentence translations that involve this language
            await pool.query(`
                DELETE FROM translate_of_sentence 
                WHERE sentence_id_1 IN (SELECT sentence_id FROM Sentences WHERE languageID = ?)
                   OR sentence_id_2 IN (SELECT sentence_id FROM Sentences WHERE languageID = ?)
            `, [languageId, languageId]);

            // Delete words of sentences relationships for words in this language
            await pool.query(`
                DELETE FROM words_of_sentences 
                WHERE wordID IN (SELECT word_id FROM Words WHERE languageID = ?)
            `, [languageId]);

            // Delete words of sentences relationships for sentences in this language
            await pool.query(`
                DELETE FROM words_of_sentences 
                WHERE sentenceID IN (SELECT sentence_id FROM Sentences WHERE languageID = ?)
            `, [languageId]);

            // Delete all words in this language
            await pool.query('DELETE FROM Words WHERE languageID = ?', [languageId]);

            // Delete all sentences in this language
            await pool.query('DELETE FROM Sentences WHERE languageID = ?', [languageId]);

            // Finally, delete the language
            const [result] = await pool.query('DELETE FROM Languages WHERE language_id = ?', [languageId]);
            
            if (result.affectedRows === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Language not found' });
            }

            // Commit the transaction
            await pool.query('COMMIT');
            res.json({ message: 'Language and all related data deleted successfully' });

        } catch (error) {
            // Rollback on error
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Delete language error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get language pairs (source and target languages)
router.get('/pairs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT 
                l1.language_id as source_language_id,
                l1.language as source_language,
                l2.language_id as target_language_id,
                l2.language as target_language
            FROM Languages l1
            CROSS JOIN Languages l2
            WHERE l1.language_id != l2.language_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get word pairs between two languages
router.get('/:sourceId/cards/:targetId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            (SELECT 
                w1.word_id as source_word_id,
                w1.word as source_text,
                w2.word_id as target_word_id,
                w2.word as target_text,
                lev.level_name as difficulty,
                c.category
            FROM translate_of_word t
            JOIN Words w1 ON t.word_id_1 = w1.word_id
            JOIN Words w2 ON t.word_id_2 = w2.word_id
            JOIN Languages lang1 ON w1.languageID = lang1.language_id
            JOIN Languages lang2 ON w2.languageID = lang2.language_id
            JOIN Levels lev ON w1.level_id = lev.level_id
            JOIN Categories c ON w1.categoryID = c.category_id
            WHERE lang1.language_id = ? AND lang2.language_id = ?)
            UNION
            (SELECT 
                w2.word_id as source_word_id,
                w2.word as source_text,
                w1.word_id as target_word_id,
                w1.word as target_text,
                lev.level_name as difficulty,
                c.category
            FROM translate_of_word t
            JOIN Words w1 ON t.word_id_1 = w1.word_id
            JOIN Words w2 ON t.word_id_2 = w2.word_id
            JOIN Languages lang1 ON w1.languageID = lang1.language_id
            JOIN Languages lang2 ON w2.languageID = lang2.language_id
            JOIN Levels lev ON w2.level_id = lev.level_id
            JOIN Categories c ON w2.categoryID = c.category_id
            WHERE lang2.language_id = ? AND lang1.language_id = ?)
        `, [req.params.sourceId, req.params.targetId, req.params.sourceId, req.params.targetId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No word pairs found between these languages' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get unlinked words between two languages
router.get('/:sourceId/unlinked-words/:targetId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                w.word_id,
                w.word as source_text,
                lev.level_name as difficulty,
                c.category
            FROM Words w
            LEFT JOIN translate_of_word t ON 
                (w.word_id = t.word_id_1 AND EXISTS (
                    SELECT 1 FROM Words w2 
                    WHERE w2.word_id = t.word_id_2 
                    AND w2.languageID = ?
                ))
                OR 
                (w.word_id = t.word_id_2 AND EXISTS (
                    SELECT 1 FROM Words w2 
                    WHERE w2.word_id = t.word_id_1 
                    AND w2.languageID = ?
                ))
            JOIN Languages l ON w.languageID = l.language_id
            JOIN Levels lev ON w.level_id = lev.level_id
            JOIN Categories c ON w.categoryID = c.category_id
            WHERE l.language_id = ? AND t.word_id_1 IS NULL AND t.word_id_2 IS NULL
        `, [req.params.targetId, req.params.targetId, req.params.sourceId]);

        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Link a word to a target language
router.post('/:sourceId/link-word/:targetId', async (req, res) => {
    const { word_id, target_text } = req.body;
    try {
        // Start a transaction
        await pool.query('START TRANSACTION');

        try {
            // First, get the word from the source language
            const [sourceWord] = await pool.query(
                'SELECT * FROM Words WHERE word_id = ? AND languageID = ?',
                [word_id, req.params.sourceId]
            );

            if (sourceWord.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Word not found in source language' });
            }

            // Check if the target word already exists
            const [existingWords] = await pool.query(
                'SELECT * FROM Words WHERE word = ? AND languageID = ?',
                [target_text, req.params.targetId]
            );

            let targetWordId;

            if (existingWords.length > 0) {
                // Use existing word
                targetWordId = existingWords[0].word_id;
            } else {
                // Create a new word in the target language
                const [targetWord] = await pool.query(
                    'INSERT INTO Words (word, level_id, languageID, categoryID) VALUES (?, ?, ?, ?)',
                    [target_text, sourceWord[0].level_id, req.params.targetId, sourceWord[0].categoryID]
                );
                targetWordId = targetWord.insertId;
            }

            // Create the translation relationship
            await pool.query(
                'INSERT INTO translate_of_word (word_id_1, word_id_2) VALUES (?, ?)',
                [word_id, targetWordId]
            );

            // Get the complete word pair information
            const [wordPair] = await pool.query(`
                SELECT 
                    w1.word_id as source_word_id,
                    w1.word as source_text,
                    w2.word_id as target_word_id,
                    w2.word as target_text,
                    lev.level_name as difficulty,
                    c.category
                FROM Words w1
                JOIN Words w2 ON w2.word_id = ?
                JOIN Levels lev ON w1.level_id = lev.level_id
                JOIN Categories c ON w1.categoryID = c.category_id
                WHERE w1.word_id = ?
            `, [targetWordId, word_id]);

            await pool.query('COMMIT');
            res.status(201).json(wordPair[0]);
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete an unlinked word
router.delete('/:sourceId/unlinked-words/:wordId', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM Words WHERE word_id = ? AND languageID = ?',
            [req.params.wordId, req.params.sourceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }

        res.json({ message: 'Word deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete word pair and all related records
router.delete('/:sourceId/word-pairs/:sourceWordId/:targetWordId', async (req, res) => {
    try {
        // Start a transaction
        await pool.query('START TRANSACTION');

        try {
            const { sourceWordId, targetWordId } = req.params;

            // First, delete from words_of_sentences for both words
            await pool.query('DELETE FROM words_of_sentences WHERE wordID = ? OR wordID = ?', [sourceWordId, targetWordId]);

            await pool.query('COMMIT');
            res.json({ message: 'Word pair and all related records deleted successfully' });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Delete word pair error:', error);
        res.status(500).json({ 
            message: 'Error deleting word pair and related records',
            error: error.message 
        });
    }
});

module.exports = router; 