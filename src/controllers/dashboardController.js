const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardController {
    async mostrarPainel(req, res) {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { account: true }
        });

        if (!user || !user.account) {
            return res.redirect('/conta/criar');
        }

        res.render('dashboard', {
            nome: user.name,
            numeroConta: user.account.number,
            saldo: user.account.balance.toFixed(2)
        });
    }
};

module.exports = new DashboardController();