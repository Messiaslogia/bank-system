const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateToken } = require('../services/jwtService');
const { gerarNumeroConta } = require('../controllers/accountController');

class AuthController {
    async register(req, res) {
        const { name, email, password } = req.body;

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'E-mail já cadastrados' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        const numero = gerarNumeroConta();

        await prisma.account.create({
            data: {
                number: numero,
                userId: user.id,
                balance: 0,
            },
        });

        res.status(200).json({ message: 'Usuário e conta criados com sucesso' })
    }

    async login(req, res) {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

        const valid = bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Senha incorreta' });

        const token = generateToken({ id: user.id, email: user.email });

        res.status(200).json(user.id)


    }
}

module.exports = new AuthController();