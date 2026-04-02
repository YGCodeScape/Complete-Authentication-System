const UserModel = require('../models/user.model');
const sessionModel = require("../models/session.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// helper: generate tokens
const generateTokens = (userId, sessionId) => {
    const accessToken = jwt.sign(
        { id: userId, sessionId },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ 
          id: userId,
          sessionId: sessionId 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// ---------------- REGISTER ----------------
const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await UserModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        const userId = result.insertId;

        // ✅ STEP 1: Create session FIRST
        const session = await sessionModel.create({
            user_id: userId,
            refreshTokenHash: "", // temporary (will update below)
            user_agent: req.get("user-agent"),
            ip: req.ip,
            revoked: false,
            created_at: new Date(),
            updated_at: new Date()
        });

        const sessionId = session.insertId;

        // ✅ STEP 2: Generate tokens with sessionId
        const accessToken = jwt.sign(
            { id: userId, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: userId, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ STEP 3: Hash refresh token
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // ✅ STEP 4: Update session with hashed token
        await sessionModel.update(sessionId, {
            refreshTokenHash
        });

        // ✅ STEP 5: Set cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "User registered successfully",
            accessToken
        });

    } catch (error) {
        console.error("Register Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- LOGIN ----------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ STEP 1: Create session FIRST
        const session = await sessionModel.create({
            user_id: user.id,
            refreshTokenHash: "", // temporary
            user_agent: req.get("user-agent"),
            ip: req.ip,
            revoked: false,
            created_at: new Date(),
            updated_at: new Date()
        });

        const sessionId = session.insertId;

        // ✅ STEP 2: Generate tokens with sessionId
        const accessToken = jwt.sign(
            { id: user.id, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user.id, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ STEP 3: Hash refresh token
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // ✅ STEP 4: Update session
        await sessionModel.update(sessionId, {
            refreshTokenHash
        });

        // ✅ STEP 5: Set cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            accessToken
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- GET ME ----------------
const getMe = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const session = await sessionModel.findById(decoded.sessionId);
        if (!session) {
            return res.status(401).json({ message: "Session expired" });
        }

        const user = await UserModel.findById(decoded.id);

        res.status(200).json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
// ---------------- REFRESH TOKEN ----------------
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: "No refresh token"
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //  Directly get session using sessionId (NO LOOP)
        const sessionData = await sessionModel.findById(decoded.sessionId);

        if (!sessionData) {
            return res.status(401).json({
                message: "Session expired or invalid"
            });
        }

        // Compare token with stored hash
        const isValid = await bcrypt.compare(token, sessionData.refreshTokenHash);

        if (!isValid) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        // ✅ Generate new access token
        const newAccessToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: sessionData.id
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // ✅ Generate new refresh token (with sessionId)
        const newRefreshToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: sessionData.id
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Hash new refresh token
        const newHash = await bcrypt.hash(newRefreshToken, 10);

        // ✅ Update session with new hash (rotation)
        await sessionModel.update(sessionData.id, {
            refreshTokenHash: newHash
        });

        // ✅ Set new cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // ✅ Send new access token
        res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh Token Error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};

// ---------------- LOGOUT ----------------
const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(400).json({ message: "No token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const sessions = await sessionModel.findByUserId(decoded.id);

        for (const s of sessions) {
            const match = await bcrypt.compare(token, s.refreshTokenHash);
            if (match) {
                await sessionModel.revokeById(s.id);
                break;
            }
        }

        res.clearCookie("refreshToken");

        res.status(200).json({ message: "Logged out" });

    } catch (error) {
        res.status(500).json({ message: "Error logging out" });
    }
};

// ---------------- LOGOUT ALL ----------------
const logoutAll = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await sessionModel.revokeByUserId(decoded.id);

        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out from all devices"
        });

    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

module.exports = {
    register,
    login,
    getMe,
    refreshToken,
    logout,
    logoutAll
};