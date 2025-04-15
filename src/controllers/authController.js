const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateToken } = require('../services/jwtService');

class AuthController {
    async register(req, res) {
        const { name, email, password } = req.body;

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'E-mail já cadastrados' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        res.status(200).json({ message: 'Usuário Criado' })
    }

    async login(req, res) {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

        const valid = bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Senha incorreta' });

        const token = generateToken({ id: user.id, email: user.email });

        res.status(200).json({ token })

    }
}

module.exports = new AuthController();