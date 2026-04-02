const { getDB } = require("../config/config");

const createOtp = async ({ email, userId, otpHash, expiresAt }) => {
    const sql = `
        INSERT INTO otp (email, user_id, otp_hash, expires_at)
        VALUES (?, ?, ?, ?)
    `;
    const db = getDB(); // ✅ CALL function
    return db.execute(sql, [email, userId, otpHash, expiresAt]);
};

const findByEmail = async (email) => {
    const sql = `
        SELECT * FROM otp 
        WHERE email = ? 
        ORDER BY id DESC 
        LIMIT 1
    `;
    const db = getDB(); // ✅ FIX
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
};

const deleteByUser = async (userId) => {
    const sql = `DELETE FROM otp WHERE user_id = ?`;
    const db = getDB(); // ✅ FIX
    return db.execute(sql, [userId]);
};

module.exports = {
    createOtp,
    findByEmail,
    deleteByUser
};