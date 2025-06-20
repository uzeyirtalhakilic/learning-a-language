# Learning Languages

A full-stack web application for learning languages through flashcards and quizzes. Built with React (frontend) and Node.js (backend).

## Features

- **Flashcard Learning**: Interactive flashcards for vocabulary practice
- **Quiz System**: Multiple choice and text-based quizzes
- **Progress Tracking**: Monitor your learning progress
- **Category Management**: Organize content by categories and difficulty levels
- **Favorites System**: Save your favorite words and phrases
- **Notes**: Add personal notes to your learning materials

## Tech Stack

### Frontend

- **React** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling
- **ESLint** - Code linting

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **dotenv** - Environment variables management

## Project Structure

```
learning-languages/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/           # Node.js server
│   └── src/
│       ├── routes/        # API routes
│       └── config/        # Configuration files
└── database.sql       # Database schema
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database server

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd learning-languages
   ```

2. **Set up the database**

   - Create a MySQL database named `language_learning`
   - Import the database schema:

   ```bash
   mysql -u root -p language_learning < database.sql
   ```

3. **Configure environment variables**
   Create a `.env` file in the `backend` directory:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Or create it manually with the following content:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=language_learning
   DB_PORT=3306
   PORT=3000
   ```

4. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in the terminal)

## Environment Variables

The backend requires the following environment variables (configured in `backend/.env`):

| Variable      | Description             | Default             |
| ------------- | ----------------------- | ------------------- |
| `DB_HOST`     | MySQL database host     | `localhost`         |
| `DB_USER`     | MySQL database username | `root`              |
| `DB_PASSWORD` | MySQL database password | `` (empty)          |
| `DB_NAME`     | MySQL database name     | `language_learning` |
| `DB_PORT`     | MySQL database port     | `3306`              |
| `PORT`        | Backend server port     | `3000`              |

## API Endpoints

The backend provides RESTful APIs for:

- Words management
- Categories
- Difficulty levels
- Favorites
- Notes
- Sentences
- Tags

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue in the repository.
