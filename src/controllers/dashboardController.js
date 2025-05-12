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

        console.log(user.accounts[0].number);


        if (!user) {
            return res.redirect('/');
        }

        res.render('dashboard', {
            nome: user.name,
            email: user.email,
            numeroConta: user.accounts[0].number || 'N/A',
            saldo: user.accounts[0].balance.toFixed(2) || '1.00'
        });
    }
};

module.exports = new DashboardController();