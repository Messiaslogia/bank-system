const express = require('express');
const router = express.Router();
const DebtController = require('../controllers/debtController.js');

router.post('/', DebtController.criarDivida);

module.exports = router;