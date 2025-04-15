const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.post('/deposito', authenticate, transactionController.depositar);
router.post('/saque', authenticate, transactionController.sacar);
router.post('/transferencia', authenticate, transactionController.transferir);


module.exports = router;
