const {getDB} = require('../config/config');

const PasswordResetModel = {

    createToken: async (userId, token, expiresAt) => {
        const pool = getDB();
        const query = `
            INSERT INTO password_resets (user_id, token, expires_at)
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.execute(query, [userId, token, expiresAt]);
        return result;
    },

    findByToken: async (token) => {
        const pool = getDB();
        const query = `
            SELECT * FROM password_resets
            WHERE token = ?
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [token]);
        return rows[0];
    },

    deleteByUserId: async (userId) => {
        const pool = getDB();
        const query = `
            DELETE FROM password_resets
            WHERE user_id = ?
        `;
        const [result] = await pool.execute(query, [userId]);
        return result;
    }
};

module.exports = PasswordResetModel;