const path = require('path');

module.exports = {
    client_id: process.env.INTER_CLIENT_ID,
    client_secret: process.env.INTER_CLIENT_SECRET,
    cert_path: path.join(__dirname, 'certs/Sandbox_InterAPI_Certificado.crt'),
    key_path: path.join(__dirname, 'certs/Sandbox_InterAPI_Chave.key'),
    base_url: 'https://cdpj-sandbox.partners.uatinter.co' // sandbox
};
