const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class transactionController {

    async depositar(req, res) {
        const userId = req.user.id;
        const { valor } = req.body;

        if (valor <= 0) return res.status(400).json({ message: 'Valor inválido' });

        const conta = await prisma.account.findFirst({ where: { userId } });
        if (!conta) return res.status(400).json({ message: 'Conta não encontrada' })

        await prisma.account.update({
            where: { id: conta.id },
            data: { balance: conta.balance + parseFloat(valor) },
        });

        await prisma.transaction.create({
            data: {
                type: 'deposit',
                amount: parseFloat(valor),
                toAccountId: conta.id,
            }
        });

        res.status(200).json({ message: 'Deposito realizado com sucesso' });
    }

    async sacar(req, res) {
        const userId = req.user.id;
        const { valor } = req.body;

        if (valor <= 0) return res.status(400).json({ message: 'Valor inválido' });

        const conta = await prisma.account.findFirst({ where: { userId } });
        if (!conta) return res.status(404).json({ message: 'Conta não encontrada' });

        if (conta.balance < valor) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        await prisma.account.update({
            where: { id: conta.id },
            data: { balance: conta.balance - parseFloat(valor) },
        });

        await prisma.transaction.create({
            data: {
                type: 'withdrawal',
                amount: parseFloat(valor),
                fromAccountId: conta.id,
            }
        });

        res.status(200).json({ message: 'Saque realizado com sucesso' });
    }

    async transferir(req, res) {
        const userId = req.user.id;
        const { numeroContaDestino, valor } = req.body;

        if (valor <= 0) return res.status(400).json({ message: 'Valor inválido' });

        const contaOrigem = await prisma.account.findFirst({ where: { userId } });
        if (!contaOrigem) return res.status(404).json({ message: 'Sua conta não foi encontrada' });

        const contaDestino = await prisma.account.findFirst({ where: { number: numeroContaDestino } })
        if (!contaDestino) return res.status(404).json({ message: 'Conta de destino não encontrada' });

        if (contaOrigem.id === contaDestino.id) {
            return res.status(400).json({ message: "Não é possivel transferir para si mesmo" })
        }

        if (contaOrigem.balance < valor) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        const transfer = await prisma.$transaction(async (tx) => {
            await tx.account.update({
                where: { id: contaOrigem.id },
                data: { balance: contaOrigem.balance - parseFloat(valor) }
            })

            await tx.account.update({
                where: { id: contaDestino.id },
                data: { balance: contaDestino.balance + parseFloat(valor) }
            });

            return tx.transaction.create({
                data: {
                    type: 'transfer',
                    amount: parseFloat(valor),
                    fromAccountId: contaOrigem.id,
                    toAccountId: contaDestino.id
                }
            });
        });

        res.status(200).json({ message: 'Transferência realizada com sucesso', transferencia: transfer });
    }


}

module.exports = new transactionController();