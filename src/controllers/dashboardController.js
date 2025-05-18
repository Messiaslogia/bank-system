const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardController {
    async mostrarPainel(req, res) {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: true
            }
        });

        if (!user) return res.redirect('/');

        const conta = await prisma.account.findFirst({
            where: { userId },
            include: {
                Debt: {
                    where: { status: 'PENDENTE' }
                }
            }
        });

        res.render('dashboard', {
            nome: user.name,
            email: user.email,
            numeroConta: conta?.number || 'N/A',
            saldo: conta?.balance.toFixed(2) || '0.00',
        });
    }

    async recuperarTodas(req, res) {
        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const conta = await prisma.account.findFirst({
            where: { userId },
        });

        if (!conta) return res.status(404).json({ message: "Conta não encontrada." });

        const [dividas, total] = await Promise.all([
            prisma.debt.findMany({
                where: { accountId: conta.id },
                skip,
                take: limit,
                orderBy: { dueDate: 'asc' },
            }),
            prisma.debt.count({
                where: { accountId: conta.id }
            })
        ]);

        res.json({
            dividas,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    }

};

module.exports = new DashboardController();