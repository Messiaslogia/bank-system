const fs = require('fs');
const axios = require('axios');
const qs = require('querystring');
const config = require('./inter.config');

async function getAccessToken() {
    const cert = fs.readFileSync(config.cert_path);
    const key = fs.readFileSync(config.key_path);

    const tokenUrl = `${config.base_url}/oauth/v2/token`;
    const data = qs.stringify({
        grant_type: 'client_credentials',
        client_id: config.client_id,
        client_secret: config.client_secret,
        scope: 'extrato.read boleto-cobranca.read boleto-cobranca.write pagamento-boleto.write pagamento-boleto.read pagamento-darf.write cob.write cob.read cobv.write cobv.read pix.write pix.read webhook.read webhook.write payloadlocation.write payloadlocation.read pagamento-pix.write pagamento-pix.read webhook-banking.write webhook-banking.read pagamento-lote.write pagamento-lote.read lotecobv.read lotecobv.write'
    });

    const response = await axios.post(tokenUrl, data, {
        httpsAgent: new (require('https').Agent)({ cert, key }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });


    return response.data.access_token;
}

async function gerarCobrancaPix({ txid, valor, descricao }) {
    const cert = fs.readFileSync(config.cert_path);
    const key = fs.readFileSync(config.key_path);
    const accessToken = await getAccessToken();


    const url = `${config.base_url}/pix/v2/cob/${txid}`;
    const body = {
        calendario: { expiracao: 3600 },
        devedor: {
            cnpj: "12345678000195",
            nome: "Empresa de Serviços SA"
        },
        valor: {
            original: valor.toFixed(2),
            modalidadeAlteracao: 1
        },
        chave: '7d9f0335-8dcc-4054-9bf9-0dbd61d36906',
        solicitacaoPagador: descricao || 'Serviço realizado.',
        infoAdicionais: [
            {
                nome: "Campo 1",
                valor: "Informação Adicional1 do PSP-Recebedor"
            },
            {
                nome: "Campo 2",
                valor: "Informação Adicional2 do PSP-Recebedor"
            }
        ]
    };

    const response = await axios.put(url, body, {
        httpsAgent: new (require('https').Agent)({ cert, key }),
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });


    return response.data;
}



module.exports = { gerarCobrancaPix };