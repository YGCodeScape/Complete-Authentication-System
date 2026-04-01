const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// register user with JWT
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

        const accessToken = jwt.sign({  // generate access token
            id: result.insertId
        }, process.env.JWT_SECRET, {
            expiresIn: "15m"   // expiry time for access token
        });

        const refreshToken = jwt.sign({  // generate refresh token
            id: result.insertId
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 1000 // after 7 days cookies will clean
        }) 

        res.status(201).json({  // access token response body
            message: "user registered successfully",
            user: {
                fullName,
                email,
            },
            accessToken
        });

    }
    catch (error) {
        console.error("Register Error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
}

// identifying user from request
const getMe = async(req, res) => {
    const token = req.headers.authorization?.split(" ")[ 1 ];

    if(!token) {
        return res.status(401).json({
            message: "token not found"
        })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded); // get the users id, initialized at and expiry

    const user = await UserModel.findById(decoded.id);
    res.status(200).json({
        message: "user fetched successfully",
        user: {
            fullName: user.fullName,
            email: user.email
        }
    })
}

module.exports = {
    register,
    getMe
}