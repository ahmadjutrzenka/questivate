const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/google", AuthController.googleOAuth);
router.get("/google/callback", AuthController.googleOAuthCallback);

module.exports = router;
