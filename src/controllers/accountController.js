const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AccountController {


    gerarNumeroConta() {
        return '1000' + Math.floor(100000 + Math.random() * 900000);
    }

    async criarConta(req, res) {
        const userId = req.user.id;

        const contaExistente = await prisma.account.findFirst({ where: { userId } })

        if (contaExistente) {
            return res.status(400).json({ message: 'Usuário já possui conta' });
        }

        const numero = this.gerarNumeroConta();

        const conta = await prisma.account.create({
            data: {
                number: numero,
                userId,
                balance: 0,
            },
        });
        return res.status(201).json({ message: 'Conta criada com sucesso', conta });
    }

    async verconta(req, res) {
        const userId = req.body.id;

        const conta = await prisma.user.findFirst({
            where: { userId },
            include: { transactions: true },
        });

        if (!conta) {
            return res.status(404).json({ message: 'Conta não encontrada' })
        }

        res.status(200).json({ conta });
    }
}

module.exports = new AccountController();
