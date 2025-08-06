const db =require('../db');

class Journals {
    // Validate journal entry data
    static isValidJournalEntry(data) {
    
        if (!data.content || typeof data.content !== 'string') {
            return 'Journal content is required: title or content';
        }

        return null;
    }

    // Create a new journal entry   
    static async createJournalEntry(userId, entryId, content) {
        try {
            const validationError = this.isValidJournalEntry({content});
            if (validationError) return { success: false, error: validationError };
            
            // Ensure mood entry belongs to the user
            const checkMoodSql = `SELECT * FROM mood_entries WHERE entry_id = $1 AND user_id = $2`;
            const checkMood = await db.query(checkMoodSql, [entryId, userId]);
            if (checkMood.rows.length === 0) {
                return { success: false, error: 'Mood entry not found or not authorized' };
            }
            
            const sql = `
                INSERT INTO journal_entries (user_id, entry_id, content)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await db.query(sql, [userId, entryId, content]);
            return { success: true, data: result.rows[0], message: 'Journal entry created successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

 // Get all journal entries for a user
    static async getJournalEntries(userId, filters = {}) {
        try {
            const { from, to } = filters;
            let sql = `SELECT * FROM journal_entries WHERE user_id = $1`;
            const params = [userId];
            let paramIndex = 2;

            if (from) {
                sql += ` AND timestamp >= $${paramIndex++}`;
                params.push(from);
            }
            if (to) {
                sql += ` AND timestamp <= $${paramIndex++}`;
                params.push(to);
            }

            sql += ` ORDER BY timestamp DESC`;
            const result = await db.query(sql, params);
            return { success: true, data: result.rows };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // Update journal entry
    static async updateJournalEntry(userId, journalId, content) {
        try {
            const validationError = this.isValidJournalEntry({ content });
            if (validationError) return { success: false, error: validationError };
            
            const checkSql = `SELECT user_id FROM journal_entries WHERE journal_id = $1`;
            const checkResult = await db.query(checkSql, [journalId]);

            if (checkResult.rows.length === 0) {
                return { success: false, error: 'No journal entry with that ID found' };
            }
            
            // Step 2: Check if the logged-in user owns the entry
            if (result.rows[0].user_id !== userId) {
                return { success: false, error: 'You do not have permission to update this journal entry' };
            }
            const sql = `
                UPDATE journal_entries
                SET content = $1
                WHERE journal_id = $2 AND user_id = $3
                RETURNING *
            `;
            const result = await db.query(sql, [content, journalId, userId]);

            return { success: true, data: result.rows[0] };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // Delete journal entry
    static async deleteJournalEntry(userId, journalId) {
        try {
            const sql = `
                DELETE FROM journal_entries
                WHERE journal_id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await db.query(sql, [journalId, userId]);

            if (result.rows.length === 0) {
                return { success: false, error: 'Journal entry not found or not authorized' };
            }

            return { success: true, message: 'Journal entry deleted successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}

module.exports = Journals;