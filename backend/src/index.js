require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const favoritesRouter = require('./routes/favorites');
const notesRouter = require('./routes/notes');
const tagsRouter = require('./routes/tags');
const languagesRouter = require('./routes/languages');
const categoriesRouter = require('./routes/categories');
const wordsRouter = require('./routes/words');
const sentencesRouter = require('./routes/sentences');
const levelsRouter = require('./routes/levels');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/favorites', favoritesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/languages', languagesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/words', wordsRouter);
app.use('/api/sentences', sentencesRouter);
app.use('/api/levels', levelsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 