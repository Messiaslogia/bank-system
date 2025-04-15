const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const accountRoutes = require('./accountRoutes');
const transactionRoutes = require('./transactionRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.get('/', (req, res) => { res.render('index'); })

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

router.post('/conta', accountRoutes);
router.post('/transacao', transactionRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;