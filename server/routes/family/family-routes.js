// server/routes/family/family-routes.js
const express = require('express');
const router = express.Router();
const { getFamily, addFamilyMember, deleteFamilyMember } = require('../../controllers/family/family-controller');
const { authMiddleware } = require('../../controllers/auth/auth-controller');

router.get('/', authMiddleware, getFamily);
router.post('/', authMiddleware, addFamilyMember);
router.delete('/:id', authMiddleware, deleteFamilyMember);

module.exports = router;
