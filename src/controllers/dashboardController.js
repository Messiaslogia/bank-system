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
            dividas: conta?.Debt || []
        });
    }

    async recuperarTodas(params) {
        const userId = req.user.id;

        const conta = await prisma.account.findFirst({
            where: { userId },
            include: {
                Debt: true
            }
        });

        res.json(conta?.Debt || []);

    };
};

module.exports = new DashboardController();