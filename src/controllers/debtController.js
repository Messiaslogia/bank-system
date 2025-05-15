const { PrismaClient } = require('@prisma/client');
const { gerarCobrancaPix } = require('../services/pix/pixService');
const prisma = new PrismaClient();

// Função para gerar o txid no formato correto
function gerarTxid() {
    const prefixo = "ypmdofu8dva";
    const data = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14); // "20250411142888"
    const sufixo = "ABCC"; // Exemplo de sufixo fixo

    return `${prefixo}${data}${sufixo}`;
}

class DebtController {

    async criarDivida(req, res) {
        try {
            const { numeroConta, valor, descricao, vencimento } = req.body;

            const conta = await prisma.account.findUnique({
                where: { number: numeroConta },
                include: { user: true }
            });

            if (!conta) return res.status(404).json({ message: 'Conta não encontrada' });

            // Gera o txid no formato correto
            const txid = gerarTxid();

            // Cria a dívida no banco de dados
            const novaDivida = await prisma.debt.create({
                data: {
                    description: descricao,
                    amount: parseFloat(valor),
                    status: 'pendente',
                    dueDate: new Date(vencimento),
                    accountId: conta.id
                }
            });

            // Gera a cobrança Pix usando a função que você já possui
            const pixInfo = await gerarCobrancaPix({
                txid, valor: parseFloat(valor), descricao
            });

            // Atualiza a dívida com o txid e o payload Pix
            await prisma.debt.update({
                where: { id: novaDivida.id },
                data: {
                    pixTxId: txid,
                    pixPayload: pixInfo.payload
                }
            });

            // Retorna a resposta com sucesso
            return res.status(201).json({
                message: 'Divida gerada com sucesso',
                debtId: novaDivida.id,
                copiaECola: pixInfo.payload
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao criar divída' });
        }
    }

    async recuperarTodas(req, res) {
        const userId = req.user.id;

        const conta = await prisma.account.findFirst({
            where: { userId },
            include: {
                Debt: true
            }
        });

        res.json({
            status: 'ok',
            dividas: conta?.Debt || []
        });

    };
}

module.exports = new DebtController();
