const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const accountController = require('../controllers/accountController');

router.post('/criar', authenticate, accountController.criarConta);
router.get('/minha', authenticate, accountController.verconta);

module.exports = router;