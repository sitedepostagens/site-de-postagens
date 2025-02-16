const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Conexão com o PostgreSQL
const client = new Client({
  host: 'grumpily-studious-steenbok.data-1.use1.tembo.io',
  port: 5432,
  user: 'postgres',
  password: 'hbFT6OloF6MqRw0A',
  database: 'postgres',
});

client.connect()
  .then(() => console.log('Conectado ao banco de dados PostgreSQL'))
  .catch(err => console.error('Erro de conexão:', err.stack));

// Middleware para parsear o corpo das requisições
app.use(bodyParser.json());

// Rota para obter as postagens
app.get('/postagens', (req, res) => {
  client.query('SELECT * FROM postagens', (err, result) => {
    if (err) {
      res.status(500).send('Erro ao recuperar postagens');
    } else {
      res.json(result.rows); // Envia as postagens como resposta JSON
    }
  });
});

// Rota para criar uma nova postagem
app.post('/postagens', (req, res) => {
  const { titulo, conteudo } = req.body; // Recebe título e conteúdo da postagem

  const query = 'INSERT INTO postagens (titulo, conteudo) VALUES ($1, $2)';
  client.query(query, [titulo, conteudo], (err, result) => {
    if (err) {
      res.status(500).send('Erro ao salvar postagem');
    } else {
      res.status(201).send('Postagem salva com sucesso');
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em postgresql://postgres:hbFT6OloF6MqRw0A@grumpily-studious-steenbok.data-1.use1.tembo.io:5432/postgres`);
});
