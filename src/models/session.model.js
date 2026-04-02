const { getDB } = require("../config/config");

const session = {
    // Create a new session
    create: async ({ user_id, refreshTokenHash, user_agent, ip, revoked = false, created_at, updated_at }) => {
        const pool = getDB();
        const query = `
            INSERT INTO session (user_id, refreshTokenHash, user_agent, ip, revoked, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            user_id,
            refreshTokenHash,
            user_agent,
            ip,
            revoked,
            created_at,
            updated_at
        ]);

        return result;
    },

    // Get session by ID
    findById: async (id) => {
        const pool = getDB();
        const query = `SELECT * FROM session WHERE id = ? AND revoked = false`;
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    },

    // Get all sessions for a user
    findByUserId: async (user_id) => {
        const pool = getDB();
        const query = `SELECT * FROM session WHERE user_id = ? AND revoked = false`;
        const [rows] = await pool.execute(query, [user_id]);
        return rows;
    },

    // Get all sessions (active and revoked)
    findAll: async () => {
        const pool = getDB();
        const query = `SELECT * FROM session ORDER BY created_at DESC`;
        const [rows] = await pool.execute(query);
        return rows;
    },

    // Update session (e.g., revoke session)
    update: async (id, { revoked, updated_at }) => {
        const pool = getDB();
        const query = `UPDATE session SET revoked = ?, updated_at = ? WHERE id = ?`;
        const [result] = await pool.execute(query, [revoked, updated_at, id]);
        return result;
    },

    // Revoke a session by ID
    revokeById: async (id) => {
        const pool = getDB();
        const query = `UPDATE session SET revoked = true, updated_at = NOW() WHERE id = ?`;
        const [result] = await pool.execute(query, [id]);
        return result;
    },

    // Revoke all sessions for a user
    revokeByUserId: async (user_id) => {
        const pool = getDB();
        const query = `UPDATE session SET revoked = true, updated_at = NOW() WHERE user_id = ?`;
        const [result] = await pool.execute(query, [user_id]);
        return result;
    },

    // Delete session by ID
    deleteById: async (id) => {
        const pool = getDB();
        const query = `DELETE FROM session WHERE id = ?`;
        const [result] = await pool.execute(query, [id]);
        return result;
    },

    // Delete all sessions for a user
    deleteByUserId: async (user_id) => {
        const pool = getDB();
        const query = `DELETE FROM session WHERE user_id = ?`;
        const [result] = await pool.execute(query, [user_id]);
        return result;
    },

    // Find session by refresh token hash
    findByTokenHash: async (refreshTokenHash) => {
        const pool = getDB();
        const query = `SELECT * FROM session WHERE refreshTokenHash = ? AND revoked = false`;
        const [rows] = await pool.execute(query, [refreshTokenHash]);
        return rows[0] || null;
    }
};

module.exports = session;