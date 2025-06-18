CREATE DATABASE learning_language;
USE learning_language;

-- Create ENUM for levels
CREATE TABLE Levels (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    level_name ENUM('Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Languages table
CREATE TABLE Languages (
    language_id INT AUTO_INCREMENT PRIMARY KEY,
    language VARCHAR(100) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Words table
CREATE TABLE Words (
    word_id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    level_id INT,
    languageID INT,
    categoryID INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES Levels(level_id),
    FOREIGN KEY (languageID) REFERENCES Languages(language_id),
    FOREIGN KEY (categoryID) REFERENCES Categories(category_id)
);

-- Create Sentences table
CREATE TABLE Sentences (
    sentence_id INT AUTO_INCREMENT PRIMARY KEY,
    sentence TEXT NOT NULL,
    level_id INT,
    languageID INT,
    categoryID INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES Levels(level_id),
    FOREIGN KEY (languageID) REFERENCES Languages(language_id),
    FOREIGN KEY (categoryID) REFERENCES Categories(category_id)
);

-- Create word-sentence relationships table
CREATE TABLE words_of_sentences (
    words_of_sentences_id INT AUTO_INCREMENT PRIMARY KEY,
    wordID INT,
    sentenceID INT,
    FOREIGN KEY (wordID) REFERENCES Words(word_id),
    FOREIGN KEY (sentenceID) REFERENCES Sentences(sentence_id)
);

-- Create word translations table
CREATE TABLE translate_of_word (
    translation_id INT AUTO_INCREMENT PRIMARY KEY,
    word_id_1 INT,
    word_id_2 INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id_1) REFERENCES Words(word_id),
    FOREIGN KEY (word_id_2) REFERENCES Words(word_id)
);

-- Create sentence translations table
CREATE TABLE translate_of_sentence (
    translation_id INT AUTO_INCREMENT PRIMARY KEY,
    sentence_id_1 INT,
    sentence_id_2 INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sentence_id_1) REFERENCES Sentences(sentence_id),
    FOREIGN KEY (sentence_id_2) REFERENCES Sentences(sentence_id)
);

-- Create Favorites table
CREATE TABLE Favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    word_id INT,
    sentence_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES Words(word_id),
    FOREIGN KEY (sentence_id) REFERENCES Sentences(sentence_id),
    CONSTRAINT check_favorite_type CHECK (
        (word_id IS NOT NULL AND sentence_id IS NULL) OR
        (word_id IS NULL AND sentence_id IS NOT NULL)
    )
);

-- Create Notes table
CREATE TABLE Notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    word_id INT,
    sentence_id INT,
    note_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES Words(word_id),
    FOREIGN KEY (sentence_id) REFERENCES Sentences(sentence_id),
    CONSTRAINT check_note_type CHECK (
        (word_id IS NOT NULL AND sentence_id IS NULL) OR
        (word_id IS NULL AND sentence_id IS NOT NULL)
    )
);

-- Create Tags table
CREATE TABLE Tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#808080',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
-- Insert languages
INSERT INTO Languages (language) VALUES 
('English'),
('Turkish');

-- Insert levels
INSERT INTO Levels (level_name) VALUES 
('Beginner'),
('Elementary'),
('Pre-Intermediate'),
('Intermediate'),
('Upper-Intermediate'),
('Advanced');

-- Insert categories
INSERT INTO Categories (category) VALUES 
('Greetings'),
('Food'),
('Travel'),
('Business');

-- Insert English words (ID: 1-28)
INSERT INTO Words (word, level_id, languageID, categoryID) VALUES 
-- Greetings (Category 1)
('Hello', 1, 1, 1),
('Goodbye', 1, 1, 1),
('Thank you', 1, 1, 1),
('Please', 1, 1, 1),
('Good morning', 1, 1, 1),
('Good evening', 1, 1, 1),
('Excuse me', 1, 1, 1),

-- Food (Category 2)
('Water', 1, 1, 2),
('Bread', 1, 1, 2),
('Coffee', 1, 1, 2),
('Tea', 1, 1, 2),
('Restaurant', 2, 1, 2),
('Menu', 2, 1, 2),

-- Travel (Category 3)
('Airport', 2, 1, 3),
('Hotel', 2, 1, 3),
('Passport', 2, 1, 3),
('Ticket', 2, 1, 3),
('Reservation', 3, 1, 3),

-- Business (Category 4)
('Meeting', 3, 1, 4),
('Project', 3, 1, 4),
('Conference', 3, 1, 4),
('Deadline', 3, 1, 4),
('Negotiation', 4, 1, 4),
('Strategy', 4, 1, 4),
('Implementation', 5, 1, 4),
('Innovation', 5, 1, 4),
('Sustainability', 6, 1, 4),
('Entrepreneurship', 6, 1, 4);

-- Insert Turkish words (ID: 29-56)
INSERT INTO Words (word, level_id, languageID, categoryID) VALUES 
-- Greetings (Category 1)
('Merhaba', 1, 2, 1),
('Hoşça kal', 1, 2, 1),
('Teşekkür ederim', 1, 2, 1),
('Lütfen', 1, 2, 1),
('Günaydın', 1, 2, 1),
('İyi akşamlar', 1, 2, 1),
('Affedersiniz', 1, 2, 1),

-- Food (Category 2)
('Su', 1, 2, 2),
('Ekmek', 1, 2, 2),
('Kahve', 1, 2, 2),
('Çay', 1, 2, 2),
('Restoran', 2, 2, 2),
('Menü', 2, 2, 2),

-- Travel (Category 3)
('Havaalanı', 2, 2, 3),
('Otel', 2, 2, 3),
('Pasaport', 2, 2, 3),
('Bilet', 2, 2, 3),
('Rezervasyon', 3, 2, 3),

-- Business (Category 4)
('Toplantı', 3, 2, 4),
('Proje', 3, 2, 4),
('Konferans', 3, 2, 4),
('Son tarih', 3, 2, 4),
('Müzakere', 4, 2, 4),
('Strateji', 4, 2, 4),
('Uygulama', 5, 2, 4),
('Yenilik', 5, 2, 4),
('Sürdürülebilirlik', 6, 2, 4),
('Girişimcilik', 6, 2, 4);

-- Insert English sentences (ID: 1-16)
INSERT INTO Sentences (sentence, level_id, languageID, categoryID) VALUES 
-- Greetings
('Hello, how are you?', 1, 1, 1),
('Thank you for your help.', 1, 1, 1),
('Good morning, how are you today?', 1, 1, 1),
('Excuse me, could you help me?', 1, 1, 1),

-- Food
('I would like some water, please.', 1, 1, 2),
('I would like to order coffee, please.', 1, 1, 2),
('Could I see the menu, please?', 2, 1, 2),
('Where is the nearest restaurant?', 2, 1, 2),

-- Travel
('The hotel is near the airport.', 2, 1, 3),
('I need to make a hotel reservation.', 2, 1, 3),

-- Business
('We have a business meeting tomorrow.', 3, 1, 4),
('I have a business conference next week.', 3, 1, 4),
('We need to meet the project deadline.', 3, 1, 4),
('The company is implementing a new strategy.', 4, 1, 4),
('Innovation is key to business success.', 5, 1, 4),
('Sustainability practices are essential for modern businesses.', 6, 1, 4);

-- Insert Turkish sentences (ID: 17-32)
INSERT INTO Sentences (sentence, level_id, languageID, categoryID) VALUES 
-- Greetings
('Merhaba, nasılsınız?', 1, 2, 1),
('Teşekkür ederim, yardımınız için.', 1, 2, 1),
('Günaydın, bugün nasılsınız?', 1, 2, 1),
('Affedersiniz, yardım edebilir misiniz?', 1, 2, 1),

-- Food
('Biraz su alabilir miyim, lütfen?', 1, 2, 2),
('Kahve sipariş etmek istiyorum.', 1, 2, 2),
('Menüyü görebilir miyim, lütfen?', 2, 2, 2),
('En yakın restoran nerede?', 2, 2, 2),

-- Travel
('Otel havaalanına yakın.', 2, 2, 3),
('Otel rezervasyonu yapmam gerekiyor.', 2, 2, 3),

-- Business
('Yarın bir iş toplantımız var.', 3, 2, 4),
('Gelecek hafta bir iş konferansım var.', 3, 2, 4),
('Proje son tarihini karşılamamız gerekiyor.', 3, 2, 4),
('Şirket yeni bir strateji uyguluyor.', 4, 2, 4),
('Yenilik, iş başarısının anahtarıdır.', 5, 2, 4),
('Sürdürülebilirlik uygulamaları modern işletmeler için gereklidir.', 6, 2, 4);

-- Insert word translations (English-Turkish pairs)
INSERT INTO translate_of_word (word_id_1, word_id_2) VALUES 
-- Greetings
(1, 29),   -- Hello - Merhaba
(2, 30),   -- Goodbye - Hoşça kal
(3, 31),   -- Thank you - Teşekkür ederim
(4, 32),   -- Please - Lütfen
(5, 33),   -- Good morning - Günaydın
(6, 34),   -- Good evening - İyi akşamlar
(7, 35),   -- Excuse me - Affedersiniz

-- Food
(8, 36),   -- Water - Su
(9, 37),   -- Bread - Ekmek
(10, 38),  -- Coffee - Kahve
(11, 39),  -- Tea - Çay
(12, 40),  -- Restaurant - Restoran
(13, 41),  -- Menu - Menü

-- Travel
(14, 42),  -- Airport - Havaalanı
(15, 43),  -- Hotel - Otel
(16, 44),  -- Passport - Pasaport
(17, 45),  -- Ticket - Bilet
(18, 46),  -- Reservation - Rezervasyon

-- Business
(19, 47),  -- Meeting - Toplantı
(20, 48),  -- Project - Proje
(21, 49),  -- Conference - Konferans
(22, 50),  -- Deadline - Son tarih
(23, 51),  -- Negotiation - Müzakere
(24, 52),  -- Strategy - Strateji
(25, 53),  -- Implementation - Uygulama
(26, 54),  -- Innovation - Yenilik
(27, 55),  -- Sustainability - Sürdürülebilirlik
(28, 56);  -- Entrepreneurship - Girişimcilik

-- Insert sentence translations (English-Turkish pairs)
INSERT INTO translate_of_sentence (sentence_id_1, sentence_id_2) VALUES 
-- Greetings
(1, 17),   -- "Hello, how are you?" - "Merhaba, nasılsınız?"
(2, 18),   -- "Thank you for your help." - "Teşekkür ederim, yardımınız için."
(3, 19),   -- "Good morning, how are you today?" - "Günaydın, bugün nasılsınız?"
(4, 20),   -- "Excuse me, could you help me?" - "Affedersiniz, yardım edebilir misiniz?"

-- Food
(5, 21),   -- "I would like some water, please." - "Biraz su alabilir miyim, lütfen?"
(6, 22),   -- "I would like to order coffee, please." - "Kahve sipariş etmek istiyorum."
(7, 23),   -- "Could I see the menu, please?" - "Menüyü görebilir miyim, lütfen?"
(8, 24),   -- "Where is the nearest restaurant?" - "En yakın restoran nerede?"

-- Travel
(9, 25),   -- "The hotel is near the airport." - "Otel havaalanına yakın."
(10, 26),  -- "I need to make a hotel reservation." - "Otel rezervasyonu yapmam gerekiyor."

-- Business
(11, 27),  -- "We have a business meeting tomorrow." - "Yarın bir iş toplantımız var."
(12, 28),  -- "I have a business conference next week." - "Gelecek hafta bir iş konferansım var."
(13, 29),  -- "We need to meet the project deadline." - "Proje son tarihini karşılamamız gerekiyor."
(14, 30),  -- "The company is implementing a new strategy." - "Şirket yeni bir strateji uyguluyor."
(15, 31),  -- "Innovation is key to business success." - "Yenilik, iş başarısının anahtarıdır."
(16, 32);  -- "Sustainability practices are essential for modern businesses." - "Sürdürülebilirlik uygulamaları modern işletmeler için gereklidir."

-- Insert example tags
INSERT INTO Tags (tag_name, color) VALUES
('Difficult', '#FF0000'),    -- Red for difficult items
('Important', '#00FF00'),    -- Green for important items
('To Review', '#0000FF'),    -- Blue for items to review
('Learned', '#808080');      -- Gray for learned items

-- Insert example favorites
INSERT INTO Favorites (word_id, sentence_id) VALUES
(1, NULL),   -- Favorite the word "Hello"
(NULL, 1),   -- Favorite the sentence "Hello, how are you?"
(2, NULL);   -- Favorite the word "Thank you"

-- Insert example notes
INSERT INTO Notes (word_id, sentence_id, note_text) VALUES
(1, NULL, 'Remember to use this in formal situations'),
(NULL, 1, 'Common greeting, practice pronunciation'),
(2, NULL, 'Use with "very much" for emphasis');

