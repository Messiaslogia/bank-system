const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const DebtController = require('../controllers/debtController.js');

router.post('/', DebtController.criarDivida);
router.get('/todas', authenticate, DebtController.recuperarTodas);

module.exports = router;