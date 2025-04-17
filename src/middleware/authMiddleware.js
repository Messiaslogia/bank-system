const { verifyToken } = require('../services/jwtService');

function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Acesso Negado');


    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ message: 'Token inválido' });


    req.user = payload;
    next();
}

module.exports = authenticate;