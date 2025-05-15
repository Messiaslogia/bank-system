const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const accountRoutes = require('./accountRoutes');
const transactionRoutes = require('./transactionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const debtRoutes = require('./debtRoutes');
const authenticate = require('../middleware/authMiddleware');

router.get('/', (req, res) => { res.render('index'); })

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', authenticate, AuthController.logout);

router.post('/conta', accountRoutes);
router.post('/transacao', transactionRoutes);
router.use('/dashboard', dashboardRoutes);

router.use('/dividas', debtRoutes);

module.exports = router;