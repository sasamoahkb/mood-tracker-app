const db = require('../db');
const bcrypt = require('bcrypt');

class Users {
    // --- Manual validation helpers ---
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof email === 'string' && emailRegex.test(email);
    }

    static isValidPassword(password) {
        if (typeof password !== 'string' || password.length < 1)
            throw new Error('Password is required');
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        // return typeof password === 'string' && passwordRegex.test(password);
    
    }
    static validatePassword(password) {
        if (typeof password !== 'string') return 'Password must be a string';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter';
        if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
        if (!/\d/.test(password)) return 'Password must include a number';
        return null; // no error
    }


    static isValidUsername(username) {
        return typeof username === 'string' && username.length >= 3 && username.length <= 30;
    }

    // --- Get user ID by email ---
    static async getUserIdByEmail(email) {
        try {
            if (!this.isValidEmail(email)) throw new Error('Invalid email format');
            const sql = 'SELECT user_id FROM users WHERE email = ?';
            const result = await db.query(sql, [email]);
            return { success: true, data: result.rows[0]?.user_id || null };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // --- Get full user by email ---
    static async getUserByEmail(email) {
        try {
            if (!this.isValidEmail(email)) throw new Error('Invalid email format');
            const sql = 'SELECT * FROM users WHERE email = ?';
            const result = await db.query(sql, [email]);
            return { success: true, data: result.rows[0] || null };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // --- Get user by ID ---
    static async getUserById(userId) {
        try {
            if (!Number.isInteger(userId)) throw new Error('Invalid user ID');
            const sql = 'SELECT * FROM users WHERE user_id = ?';
            const result = await db.query(sql, [userId]);
            return { success: true, data: result.rows[0] || null };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // --- Create new user ---
    static async createUser({ username, email, password }) {
        try {
            // Validate inputs
            if (!this.isValidUsername(username)) throw new Error('Invalid username');
            if (!this.isValidEmail(email)) throw new Error('Invalid email');
            
            const passwordError = this.validatePassword(password);
            if (passwordError) throw new Error(passwordError);
            
            const { data: existingUserID } = await this.getUserIdByEmail(email);
            if (existingUserID) {
                throw new Error('User already exists with this email');
            }
            // Hash password
            const password_hash = await bcrypt.hash(password, 10);
            // Insert into database
            const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            await db.query(sql, [username, email, password_hash]);
            // Get the newly created user
            const { data: newUser } = await this.getUserByEmail(email);
            return { success: true, data: newUser };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // --- Update user info ---
    static async updateUser(userId, updates) {
        try {
            if (!Number.isInteger(userId)) throw new Error('Invalid user ID');
            const fields = [];
            const values = [];

            if (updates.username) {
                if (!this.isValidUsername(updates.username)) throw new Error('Invalid username');
                fields.push('username = ?');
                values.push(updates.username);
            }

            if (updates.email) {
                if (!this.isValidEmail(updates.email)) throw new Error('Invalid email');
                fields.push('email = ?');
                values.push(updates.email);
            }

            if (updates.password) {
                const passwordError = this.validatePassword(updates.password);
                if (passwordError) throw new Error(passwordError);                const password_hash = await bcrypt.hash(updates.password, 10);
                fields.push('password = ?');
                values.push(password_hash);
            }

            if (fields.length === 0) throw new Error('No valid fields to update');

            values.push(userId);
            const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
            await db.query(sql, values);

            const { data: updatedUser } = await this.getUserById(userId);
            return { success: true, data: updatedUser };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // --- Delete user ---
    static async deleteUser(userId) {
        try {
            if (!Number.isInteger(userId)) throw new Error('Invalid user ID');
            const sql = 'DELETE FROM users WHERE user_id = ?';
            await db.query(sql, [userId]);
            return { success: true, data: 'User deleted' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // --- Verify user credentials (login) ---
    static async verifyUser(email, password) {
        try {
            if (!this.isValidEmail(email)) throw new Error('Invalid email');
            if (!this.isValidPassword(password)) throw new Error('Invalid password');

            const { data: user } = await this.getUserByEmail(email);
            if (!user) throw new Error('User not found');

            const match = await bcrypt.compare(password, user.password);
            if (!match) throw new Error('Incorrect password');

            return { success: true, data: user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static generateToken(user) {
    const payload = {
        user_id: user.user_id,
        email: user.email
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}
}

module.exports = Users;
