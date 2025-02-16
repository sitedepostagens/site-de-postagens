const { Client } = require('pg');

const client = new Client({
  host: 'grumpily-studious-steenbok.data-1.use1.tembo.io',
  port: 5432,
  user: 'postgres',
  password: 'hbFT6OloF6MqRw0A',
  database: 'postgres',
  ssl: { rejectUnauthorized: false } // Evita erro de certificado SSL
});

client.connect()
  .then(() => {
    console.log('✅ Conectado ao banco de dados PostgreSQL');
    return client.query('SELECT NOW()'); // Executa um teste no banco
  })
  .then(res => {
    console.log('📅 Data atual no banco:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco:', err.stack);
  });
