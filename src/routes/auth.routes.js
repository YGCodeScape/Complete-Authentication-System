const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/auth.controller')

// declare api end points for authentication
authRouter.post("/register", authController.register); 

// get me end point
authRouter.get("/get-me", authController.getMe);


module.exports = authRouter;