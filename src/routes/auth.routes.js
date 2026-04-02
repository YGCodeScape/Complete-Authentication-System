const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/auth.controller')

// declare api end points for authentication
authRouter.post("/register", authController.register); 

// get me end point
authRouter.get("/get-me", authController.getMe);

// end point for refresh token client call this api for new access token
authRouter.get("/refresh-token", authController.refreshToken);

module.exports = authRouter;