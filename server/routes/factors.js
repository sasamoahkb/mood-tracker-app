const db = require('../db');

class Factors {
    static allowedCategories = [
        "Sleep",
        "Nutrition",
        "Physical Activity",
        "Social",
        "Work/School",
        "Environment",
        "Mental Health",
        "Substance Use",
        "Technology",
        "Routine"
    ];

    static isValidFactor(data, { allowPartial = false } = {}) {
        const { name, category, icon } = data;

        if (!allowPartial || name !== undefined) {
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return 'Factor name is required and must be a non-empty string';
            }
        }

        if (!allowPartial || category !== undefined) {
            if (!category || typeof category !== 'string' || !this.allowedCategories.includes(category.trim())) {
                return `Category must be one of: ${this.allowedCategories.join(', ')}`;
            }
        }

        if (icon !== undefined && icon !== null) {
            if (typeof icon !== 'string') {
                return 'Icon must be a string';
            }
        }

        return null;
    }

    static async getAllFactors() {
        try {
            const sql = 'SELECT * FROM factors ORDER BY factor_id ASC';
            const result = await db.query(sql);
            return { success: true, data: result.rows, message: 'Factors retrieved successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    static async createFactor(data) {
        try {
            const validationError = this.isValidFactor(data, { allowPartial: false });
            if (validationError) {
                return { success: false, error: validationError };
            }

            const { name, category, icon } = data;
            const sql = `
                INSERT INTO factors (name, category, icon)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await db.query(sql, [name.trim(), category.trim(), icon || null]);
            return { success: true, data: result.rows[0], message: 'Factor created successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async updateFactor(id, updates) {
        try {
            if (!this.isValidId(id)) return { success: false, error: 'Invalid factor ID' };
            
            const validationError = this.isValidFactor(updates, { allowPartial: true });
            if (validationError) {
                return { success: false, error: validationError };
            }
            const fields = [];
            const values = [];
            let paramIndex = 1;

            if (updates.name) {
                fields.push(`name = $${paramIndex++}`);
                values.push(updates.name.trim());
            }

            if (updates.category) {
                fields.push(`category = $${paramIndex++}`);
                values.push(updates.category.trim());
            }

            if (updates.icon !== undefined) {
                fields.push(`icon = $${paramIndex++}`);
                values.push(updates.icon ? updates.icon.trim() : null);
            }

            if (fields.length === 0) return { success: false, error: 'No valid fields to update' };

            values.push(id);
            const sql = `UPDATE factors SET ${fields.join(', ')} WHERE factor_id = $${paramIndex} RETURNING *`;
            const result = await db.query(sql, values);

            if (result.rowCount === 0) return { success: false, error: 'Factor not found' };

            return { success: true, data: result.rows[0] };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    static isValidId(id) {
        return Number.isInteger(id) && id > 0;
    }

    static async deleteFactor(id) {
        try {
            if (!this.isValidId(id)) return { success: false, error: 'Invalid factor ID' };

            const sql = 'DELETE FROM factors WHERE factor_id = $1 RETURNING *';
            const result = await db.query(sql, [id]);

            if (result.rowCount === 0) return { success: false, error: 'Factor not found' };

            return { success: true, message: 'Factor deleted successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}

module.exports = Factors;
