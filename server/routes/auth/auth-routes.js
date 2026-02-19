// server/routes/auth/auth-routes.js
const express = require('express');
const { registerUser, loginUser, logoutUser, authMiddleware } = require('../../controllers/auth/auth-controller');


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-auth', authMiddleware, (req, res) => {
    const user = req.user; // Extracted from the token by authMiddleware
    res.status(200).json({
        success: true,
        message: 'User is authenticated',
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
});

module.exports = router;