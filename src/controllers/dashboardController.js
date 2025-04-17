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

        if (!user) {
            return res.redirect('/');
        }

        res.render('dashboard', {
            nome: user.name,
            email: user.email,
            numeroConta: user?.number || 'N/A',
            saldo: user?.balance?.toFixed(2) || '0.00'
        });
    }
};

module.exports = new DashboardController();