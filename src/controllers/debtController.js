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
        try {
            const userId = req.user.id;

            // Pega os parâmetros page e limit da query string, com valores padrão
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const conta = await prisma.account.findFirst({
                where: { userId }
            });

            if (!conta) return res.status(404).json({ message: 'Conta não encontrada!' });

            const totalDividas = await prisma.debt.count({
                where: {
                    accountId: conta.id,
                    status: 'pendente'
                }
            });

            // Busca as dívidas pendentes paginadas
            const dividas = await prisma.debt.findMany({
                where: {
                    accountId: conta.id,
                },
                skip,
                take: limit,
                orderBy: { dueDate: 'asc' }
            });


            // Calcula total de páginas
            const totalPages = Math.ceil(totalDividas / limit);

            // Retorna resposta com dados da paginação
            res.json({
                status: 'ok',
                page,
                limit,
                totalDividas,
                totalPages,
                dividas
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao recuperar dívidas pendentes' });
        }

    };

    async recuperarPendentes(req, res) {
        try {
            const userId = req.user.id;

            // Pega os parâmetros page e limit da query string, com valores padrão
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Verifica se o usuário existe e tem conta
            const conta = await prisma.account.findFirst({
                where: { userId }
            });

            if (!conta) return res.status(404).json({ message: 'Conta não encontrada!' });

            // Busca o total de dívidas pendentes para paginação
            const totalDividas = await prisma.debt.count({
                where: {
                    accountId: conta.id,
                    status: 'pendente'
                }
            });

            // Busca as dívidas pendentes paginadas
            const dividas = await prisma.debt.findMany({
                where: {
                    accountId: conta.id,
                    status: 'pendente'
                },
                skip,
                take: limit,
                orderBy: { dueDate: 'asc' }
            });

            // Calcula total de páginas
            const totalPages = Math.ceil(totalDividas / limit);

            // Retorna resposta com dados da paginação
            res.json({
                status: 'ok',
                page,
                limit,
                totalDividas,
                totalPages,
                dividas
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao recuperar dívidas pendentes' });
        }
    }

}

module.exports = new DebtController();
