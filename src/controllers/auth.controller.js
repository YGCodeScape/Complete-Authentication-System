const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');

const register = async(req, res) => {
    try {
        const {username, email, password} = req.body;

        // validation
        if(!username || !email || !password) {
            return res.status(400).json({
                message: "all fields are required"
            });
        }

        // check existing user
        // Check existing user
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await UserModel.create({
            fullName,
            email,
            password: hashedPassword
        });

    }
    catch (error) {
        console.error("Register Error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = {
    register
}