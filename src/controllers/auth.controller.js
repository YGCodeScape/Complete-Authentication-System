const UserModel = require('../models/user.model');
const sessionModel = require("../models/session.model")
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

        // generate refresh token
        const refreshToken = jwt.sign({  
            id: result.insertId
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

        const session = await sessionModel.create({
            user_id: result.insertId,
            refreshTokenHash,
            user_agent: req.get("user-agent"),
            ip: req.ip,
            revoked: false,
            created_at: new Date(),
            updated_at: new Date()
        })

        // generate access token
        const accessToken = jwt.sign({ 
            id: result.insertId,
            sessionId: session.id
        }, process.env.JWT_SECRET, {
            expiresIn: "15m"   // expiry time for access token
        });
        
        // store refresh token in cookie
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

// new access token and refresh token generated 
const refreshToken = async(req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if(!token) {
            return res.status(401).json({
                message: "refresh token not found"
            });
        }

        // Verify the token first
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find session by token hash - compare using bcrypt
        // Get all sessions for this user and check which one matches
        const userSessions = await sessionModel.findByUserId(decoded.id);
        let sessionData = null;
        
        for (const sess of userSessions) {
            const isMatchingToken = await bcrypt.compare(token, sess.refreshTokenHash);
            if (isMatchingToken) {
                sessionData = sess;
                break;
            }
        }

        if(!sessionData) {
            return res.status(401).json({
                message: "Invalid refresh token or session expired"
            })
        }

        // Create new access token
        const accessToken = jwt.sign({
            id: decoded.id,
            sessionId: sessionData.id
        }, process.env.JWT_SECRET, {
            expiresIn: "15m"
        });

        // Create new refresh token
        const newRefreshToken = jwt.sign({
            id: decoded.id
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        // Hash the new refresh token
        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

        // Update session with new token hash
        await sessionModel.update(sessionData.id, {
            refreshTokenHash: newRefreshTokenHash,
            updated_at: new Date()
        });

        // Set new refresh token in cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });
    } catch (error) {
        console.error("Refresh Token Error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
}

// Logout user (revoke session)
const logout = async(req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if(!token) {
            return res.status(401).json({
                message: "Refresh token was not found"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find matching session using bcrypt comparison
        const userSessions = await sessionModel.findByUserId(decoded.id);
        let sessionData = null;

        for (const sess of userSessions) {
            const isMatchingToken = await bcrypt.compare(token, sess.refreshTokenHash);
            if (isMatchingToken) {
                sessionData = sess;
                break;
            }
        }

        if(!sessionData) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        // Revoke the session
        await sessionModel.revokeById(sessionData.id);

        // Clear the refresh token cookie
        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
}

const logoutAll = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;

        if(!refreshToken) {
            return res.status(401).json({
                message: "Refresh token was not found"
            });
        }
    
    const decode = jwt.verify(refreshToken, process.env.JWT_SECRET)

    await sessionModel.update({
        user: decode.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "Logged out from all devices successfully"
    })

    
}

module.exports = {
    register,
    getMe,
    refreshToken,
    logout,
    logoutAll
}