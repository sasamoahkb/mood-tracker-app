const db =  require('../db');
class Moods {
    static isValidMoodEntry(data) {
        const { mood, mood_rating, notes, location, factors } = data;
        if (!mood || !mood_rating || !Array.isArray(factors)) {
            return 'Missing required fields: mood, mood_rating, notes, location, or factors';

        }

        if (typeof mood !== 'string' || mood.trim() === '') {
            return 'Mood must be a non-empty string';
        }

        if (!Number.isInteger(mood_rating) || mood_rating < 1 || mood_rating > 10) {
            return 'Mood rating must be an integer between 1 and 10';
        }

        if (notes && typeof notes !== 'string') {
            return 'Notes must be a string';
        }

        if (location && typeof location !== 'string') {
            return 'Location must be a string';
        }

        if (factors) {
            if (!Array.isArray(factors)) return 'Factors must be an array';
            if (factors.length > 3) return 'You can only select up to 3 factors';
            for (const f of factors) {
                if (
                    typeof f.factor_id !== 'number' ||
                    typeof f.intensity !== 'number' ||
                    f.intensity < 1 || f.intensity > 10
                ) {
                    return 'Each factor must have a valid factor_id and intensity between 1 and 10';
                }
            }
        }

        return null; // All good
    }

    static async createMoodEntry(userId, data) {
        try {
            const validationError = this.isValidMoodEntry(data);
            if (validationError) throw new Error(validationError);
            // Destructure data for easier access
            const { mood, mood_rating, notes = '', location = '', factors = [] } = data;

            // Insert into mood_entries
            const insertMoodSql = `
                INSERT INTO mood_entries (user_id, mood, mood_rating, notes, location)
                VALUES (?, ?, ?, ?, ?)
                RETURNING *
            `;
            const moodResult = await db.query(insertMoodSql, [userId, mood, mood_rating, notes, location]);
            const moodEntry = moodResult.rows[0];

            // Insert associated mood factors
            for (const f of factors) {
                if (!f.factor_id || typeof f.intensity !== 'number') {
                    throw new Error('Invalid factor data');
                }
                const insertFactorSql = `   
                    INSERT INTO mood_factors (entry_id, factor_id, intensity)
                    VALUES (?, ?, ?)`;
                await db.query(insertFactorSql, [moodEntry.entry_id, f.factor_id, f.intensity]);
            }

            return { success: true, data: moodEntry };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}

module.exports = Moods;

// Express route receives request → calls createMoodEntry()
//   ↓
// createMoodEntry() calls isValidMoodEntry() to validate data
//   ↓
// Destructure values (mood, rating, notes, location, factors)
//   ↓
// Insert into mood_entries
//   ↓
// For each factor → insert into mood_factors