const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Users {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof email === 'string' && emailRegex.test(email);
    }

    static isValidPassword(password) {
        // For login, just check it's a non-empty string
        return (typeof password === 'string' && password.length > 0);
    }   

    static validatePassword(password) {
        if (typeof password !== 'string') return 'Password must be a string';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter';
        if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
        if (!/\d/.test(password)) return 'Password must include a number';
        return null;
    }

    static isValidUsername(username) {
        return typeof username === 'string' && username.length >= 3 && username.length <= 30;
    }

    static async getUserIdByEmail(email) {
        try {
            if (!this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }
            const sql = 'SELECT user_id FROM users WHERE email = $1';
            const result = await db.query(sql, [email]);
            return { success: true, data: result.rows[0]?.user_id || null, message: 'User ID retrieved successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async getUserByEmail(email) {
        try {
            if (!this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }
            const sql = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(sql, [email]);
            return { success: true, data: result.rows[0] || null, message: 'User retrieved successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async getUserById(userId) {
        try {
            if (!Number.isInteger(userId)) {
                return { success: false, error: 'Invalid user ID' };
            }
            const sql = 'SELECT * FROM users WHERE user_id = $1';
            const result = await db.query(sql, [userId]);
            return { success: true, data: result.rows[0] || null, message: 'User retrieved successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async createUser({ username, email, password }) {
        try {
            if (!this.isValidUsername(username)) {
                return { success: false, error: 'Invalid username' };
            }
            if (!this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }

            const passwordError = this.validatePassword(password);
            if (passwordError) {
                return { success: false, error: passwordError };
            }

            const { data: existingUserID } = await this.getUserIdByEmail(email);
            if (existingUserID) {
                return { success: false, error: 'User already exists with this email' };
            }
            
            const password_hash = await bcrypt.hash(password, 10);
            const sql = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
            await db.query(sql, [username, email, password_hash]);

            const { data: newUser } = await this.getUserByEmail(email);
            return { success: true, data: newUser, message: 'User created successfully' };
        
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async updateUser(userId, updates) {
        try {
            if (!Number.isInteger(userId)) {
                return { success: false, error: 'Invalid user ID' };
            }
            const fields = [];
            const values = [];
            let paramIndex = 1;

            if (updates.username) {
                if (!this.isValidUsername(updates.username)) {
                    return { success: false, error: 'Invalid username' };
                } 
                fields.push(`username = $${paramIndex++}`);
                values.push(updates.username);
            }

            if (updates.email) {
                if (!this.isValidEmail(updates.email)) {
                    return { success: false, error: 'Invalid email format' };
                }
                fields.push(`email = $${paramIndex++}`);
                values.push(updates.email);
            }

            if (updates.password) {
                const passwordError = this.validatePassword(updates.password);
                if (passwordError) {
                    return { success: false, error: passwordError };
                }   
                const password_hash = await bcrypt.hash(updates.password, 10);
                fields.push(`password = $${paramIndex++}`);
                values.push(password_hash);
            }

            if (fields.length === 0) {
                return { success: false, error: 'No valid fields to update' };
            }
            values.push(userId);
            const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramIndex}`;
            await db.query(sql, values);

            const { data: updatedUser } = await this.getUserById(userId);
            if (!updatedUser) {
                return { success: false, error: 'User not found' };
            }
            return { success: true, data: updatedUser, message: 'User updated successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async deleteUser(userId) {
        try {
            if (!Number.isInteger(userId)) {
                return { success: false, error: 'Invalid user ID' };
            }
            const sql = 'DELETE FROM users WHERE user_id = $1';
            const result = await db.query(sql, [userId]);
            if (result.rowCount === 0) {
                return { success: false, error: 'User not found' };
            }
            return { success: true, data: null, message: 'User deleted successfully' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static async verifyUser(email, password) {
        try {
            if (!this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }
            if (!this.isValidPassword(password)) {
                return { success: false, error: 'Invalid password' };
            }

            const { data: user } = await this.getUserByEmail(email);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return { success: false, error: 'Incorrect password' };
            }

            return { success: true, data: user, message: 'Login successful' };
        } catch (err) {
            return { success: false, error: err.message || 'An error occurred while verifying user' };
        }
    }

    static generateToken(user) {
        const payload = {
            user_id: user.user_id,
            email: user.email
        };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    }
}

module.exports = Users;
