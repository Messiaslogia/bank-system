require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const routes = require('./src/routes');

app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));