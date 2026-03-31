const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async(req, res) => {

    try {
        const {fullName, email, password} = req.body;

        // validation
        if(!fullName || !email || !password) {
            return res.status(400).json({
                message: "all fields are required"
            });
        }

        // Check existing user
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await UserModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({
            id: result.insertId
        }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.status(201).json({
            message: "user registered successfully",
            user: {
                fullName,
                email,
            },
            token
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