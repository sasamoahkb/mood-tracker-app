const db = require('../db');

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
        if (factors.length > 3) {
            return 'You can only select up to 3 factors';
        }
        for (const f of factors) {
            if (
                typeof f.factor_id !== 'number' ||
                typeof f.intensity !== 'number' ||
                f.intensity < 1 || f.intensity > 10
            ) {
                return 'Each factor must have a valid factor_id and intensity between 1 and 10';
            }
        }
        return null;
    }

    static async createMoodEntry(userId, data) {
        try {
            const validationError = this.isValidMoodEntry(data);
            if (validationError) {
                return { success: false, error: validationError };
            }

            const { mood, mood_rating, notes = '', location = '', factors = [] } = data;

            const insertMoodSql = `
                INSERT INTO mood_entries (user_id, mood, mood_rating, notes, location)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const moodResult = await db.query(insertMoodSql, [userId, mood, mood_rating, notes, location]);
            const moodEntry = moodResult.rows[0];

            for (const f of factors) {
                const insertFactorSql = `
                    INSERT INTO mood_factors (entry_id, factor_id, intensity)
                    VALUES ($1, $2, $3)
                `;
                await db.query(insertFactorSql, [moodEntry.entry_id, f.factor_id, f.intensity]);
            }

            return { success: true, message: 'Mood entry created successfully', data: moodEntry };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async getMoodEntriesByUserId(userId, filters = {}) {
    try {
        const { from, to, rating, mood, page = 1, limit = 10 } = filters; 
        // Default page = 1 (first page), limit = 10 (10 results per page)

        let sql = `SELECT * FROM mood_entries WHERE user_id = $1`;
        const params = [userId];
        let paramIndex = 2;

        // Optional filters
        if (from) {
            sql += ` AND timestamp >= $${paramIndex++}`;
            params.push(from);
        }
        if (to) {
            sql += ` AND timestamp <= $${paramIndex++}`;
            params.push(to);
        }
        if (rating) {
            sql += ` AND mood_rating = $${paramIndex++}`;
            params.push(parseInt(rating));
        }
        if (mood) {
            sql += ` AND LOWER(mood) = LOWER($${paramIndex++})`;
            params.push(mood);
        }

        // Sort newest → oldest
        sql += ` ORDER BY timestamp DESC`;

        // Pagination logic
        const offset = (page - 1) * limit; // e.g., page 2 with limit 10 starts at record 10
        sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        // Execute query
        const results = await db.query(sql, params);

        // Get total count (for front-end to know total pages available)
        const countSql = `SELECT COUNT(*) FROM mood_entries WHERE user_id = $1`;
        const countResult = await db.query(countSql, [userId]);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            success: true,
            message: 'Mood history retrieved successfully',
            pagination: {
                totalItems,
                totalPages,
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            },
            data: results.rows
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
    }

    static async updateMoodEntry(userId, entryId, updates) {
    try {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Ensure entry belongs to the user
        const checkSql = `SELECT * FROM mood_entries WHERE entry_id = $1 AND user_id = $2`;
        const checkResult = await db.query(checkSql, [entryId, userId]);
        if (checkResult.rows.length === 0) {
            return { success: false, error: 'Mood entry not found or not authorized' };
        }

        if (updates.mood) {
            fields.push(`mood = $${paramIndex++}`);
            values.push(updates.mood);
        }

        if (updates.mood_rating !== undefined) {
            if (!Number.isInteger(updates.mood_rating) || updates.mood_rating < 1 || updates.mood_rating > 10) {
                return { success: false, error: 'Mood rating must be between 1 and 10' };
            }
            fields.push(`mood_rating = $${paramIndex++}`);
            values.push(updates.mood_rating);
        }

        if (updates.notes !== undefined) {
            fields.push(`notes = $${paramIndex++}`);
            values.push(updates.notes);
        }

        if (updates.location !== undefined) {
            fields.push(`location = $${paramIndex++}`);
            values.push(updates.location);
        }

        if (fields.length === 0) {
            return { success: false, error: 'No valid fields to update' };
        }

        // Add WHERE parameters
        values.push(entryId);
        values.push(userId);

        // WHERE clause uses the last two parameters
        const sql = `
            UPDATE mood_entries
            SET ${fields.join(', ')}
            WHERE entry_id = $${paramIndex++} AND user_id = $${paramIndex}
            RETURNING *
        `;

        const result = await db.query(sql, values);

        return { success: true, message: 'Mood entry updated successfully', data: result.rows[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
    }

    static async deleteMoodEntry(userId, entryId) {
    try {
        const sql = `DELETE FROM mood_entries WHERE entry_id = $1 AND user_id = $2 RETURNING *`;
        const result = await db.query(sql, [entryId, userId]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Mood entry not found or not authorized' };
        }

        return { success: true, message: 'Mood entry deleted successfully' };
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