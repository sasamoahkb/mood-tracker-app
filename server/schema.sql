-- schema.sql for Mood Tracker


DROP TABLE IF EXISTS mood_factors CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS mood_entries CASCADE;
DROP TABLE IF EXISTS factors CASCADE;
DROP TABLE IF EXISTS users CASCADE;


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB
);

CREATE TABLE mood_entries (
    entry_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    mood VARCHAR(50),
    mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 10),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    location VARCHAR(100)
);

CREATE TABLE factors (
    factor_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    icon VARCHAR(50)
);

CREATE TABLE mood_factors (
    mood_factor_id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES mood_entries(entry_id),
    factor_id INTEGER REFERENCES factors(factor_id),
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10)
);

CREATE TABLE journal_entries (
    journal_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    entry_id INTEGER REFERENCES mood_entries(entry_id),
    content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_timestamp ON mood_entries(timestamp);
CREATE INDEX idx_mood_entries_user_timestamp ON mood_entries(user_id, timestamp);
CREATE INDEX idx_mood_factors_entry_id ON mood_factors(entry_id);
CREATE INDEX idx_journal_entries_timestamp ON journal_entries(timestamp);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);

-- Prepopulate factors
INSERT INTO factors (name, category, icon) VALUES
('Sleep Quality', 'Sleep', 'bed'),
('Duration of Sleep', 'Sleep', 'clock'),
('Restlessness/Nightmares', 'Sleep', 'alert-triangle'),
('Napping', 'Sleep', 'moon'),
('Bedtime Consistency', 'Sleep', 'calendar'),

('Skipped Meals', 'Nutrition', 'slash'),
('Sugar Intake', 'Nutrition', 'candy'),
('Caffeine Consumption', 'Nutrition', 'coffee'),
('Hydration', 'Nutrition', 'droplet'),
('Balanced Diet', 'Nutrition', 'apple'),

('Exercise', 'Physical Activity', 'dumbbell'),
('Walking/Steps', 'Physical Activity', 'footsteps'),
('Sedentary Time', 'Physical Activity', 'couch'),
('Yoga/Stretching', 'Physical Activity', 'leaf'),
('Outdoor Time', 'Physical Activity', 'sun'),

('Time with Family', 'Social', 'home'),
('Social Interaction', 'Social', 'users'),
('Isolation', 'Social', 'user-x'),
('Conflict with Others', 'Social', 'alert-octagon'),
('Support from Friends', 'Social', 'smile'),

('Productivity', 'Work/School', 'clipboard-check'),
('Deadlines', 'Work/School', 'clock'),
('Overwork', 'Work/School', 'alert-circle'),
('Feedback from Boss/Peers', 'Work/School', 'message-circle'),
('Academic Stress', 'Work/School', 'book'),

('Noise Level', 'Environment', 'volume-2'),
('Weather', 'Environment', 'cloud-sun'),
('Lighting', 'Environment', 'lightbulb'),
('Crowded Spaces', 'Environment', 'users'),
('Nature Exposure', 'Environment', 'tree'),

('Anxiety', 'Mental Health', 'heart-crack'),
('Depression', 'Mental Health', 'frown'),
('Self-esteem', 'Mental Health', 'thumbs-up'),
('Therapy Session', 'Mental Health', 'stethoscope'),
('Medication Adherence', 'Mental Health', 'pill'),

('Alcohol', 'Substance Use', 'wine'),
('Smoking', 'Substance Use', 'smoking'),
('Recreational Drugs', 'Substance Use', 'zap'),
('Prescription Drugs', 'Substance Use', 'capsule'),
('Caffeine Overuse', 'Substance Use', 'coffee'),

('Screen Time', 'Technology', 'monitor'),
('Social Media Use', 'Technology', 'twitter'),
('Doomscrolling', 'Technology', 'phone-off'),
('Gaming', 'Technology', 'gamepad'),
('Notifications/Distractions', 'Technology', 'bell'),

('Planned Day', 'Routine', 'calendar-check'),
('Time Management', 'Routine', 'clock'),
('Morning Routine', 'Routine', 'sunrise'),
('Evening Routine', 'Routine', 'sunset'),
('Unexpected Events', 'Routine', 'alert-triangle');


ALTER TABLE mood_factors
DROP CONSTRAINT mood_factors_entry_id_fkey,
ADD CONSTRAINT mood_factors_entry_id_fkey
    FOREIGN KEY (entry_id) REFERENCES mood_entries(entry_id) ON DELETE CASCADE;

ALTER TABLE mood_factors
DROP CONSTRAINT mood_factors_factor_id_fkey,
ADD CONSTRAINT mood_factors_factor_id_fkey
    FOREIGN KEY (factor_id) REFERENCES factors(factor_id) ON DELETE CASCADE;

ALTER TABLE mood_entries
DROP CONSTRAINT mood_entries_user_id_fkey,
ADD CONSTRAINT mood_entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE journal_entries
DROP CONSTRAINT journal_entries_user_id_fkey,
ADD CONSTRAINT journal_entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE journal_entries
DROP CONSTRAINT journal_entries_entry_id_fkey,
ADD CONSTRAINT journal_entries_entry_id_fkey
    FOREIGN KEY (entry_id) REFERENCES mood_entries(entry_id) ON DELETE CASCADE;
