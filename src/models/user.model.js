const { pool } = require("../config/config");

const User = {

    // Create User
    create: async ({ fullName, email, password }) => {
        const query = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            fullName,
            email,
            password
        ]);

        return result;
    },

    // Get All Users
    findAll: async () => {
        const [rows] = await pool.execute("SELECT * FROM users");
        return rows;
    },
    //find one user
    findOne: async (id) => {
        const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
        return rows[0];
    },

    // Find by Email
    findByEmail: async (email) => {
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        return rows[0];
    }
};

module.exports = User;