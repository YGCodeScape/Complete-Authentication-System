const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/auth.controller')

// declare api end points for authentication
authRouter.post("/register", authController.register); 

//user login 
authRouter.post("/login", authController.login),

// get me end point
authRouter.get("/get-me", authController.getMe);

// end point for refresh token client call this api for new access token
authRouter.get("/refresh-token", authController.refreshToken);

//log out user from current devices
authRouter.get("/logout", authController.logout);

//logout from all devices
authRouter.get("/logoutAll", authController.logoutAll);



module.exports = authRouter;