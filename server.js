// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuração do Pool de Conexão com PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,       // 'postgres'
  host: process.env.DB_HOST,       // 'grumpily-studious-steenbok.data-1.use1.tembo.io'
  database: process.env.DB_NAME,   // 'postgres'
  password: process.env.DB_PASSWORD, // 'hbFTEoIGFMrRpv0A'
  port: process.env.DB_PORT,       // 5432
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// -----------------------
// Endpoints de Usuários
// -------------------------

// Cadastro de usuário: POST /api/users
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, bio, profile_picture, following) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, password, '', '', '[]']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Login de usuário: POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length > 0) {
      // Em um cenário real, gere um token JWT aqui
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

// Obter dados do usuário: GET /api/users/:username
app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      let user = result.rows[0];
      // Converte o campo following, armazenado como string JSON, para um array
      user.following = JSON.parse(user.following);
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter dados do usuário' });
  }
});

// Atualizar perfil do usuário: PUT /api/users/:username
app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  const { bio, profilePicture, following } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET bio = $1, profile_picture = $2, following = $3 WHERE username = $4 RETURNING *',
      [bio, profilePicture, JSON.stringify(following), username]
    );
    let user = result.rows[0];
    user.following = JSON.parse(user.following);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Pesquisa de usuários: GET /api/users/search?query=...
app.get('/api/users/search', async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username ILIKE $1',
      [`%${query}%`]
    );
    const usersResult = result.rows.map(user => {
      user.following = JSON.parse(user.following);
      return user;
    });
    res.json(usersResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro na pesquisa de usuários' });
  }
});

// -----------------------
// Endpoints de Posts
// -------------------------

// Obter posts: GET /api/posts (filtra opcionalmente por username)
app.get('/api/posts', async (req, res) => {
  const { username } = req.query;
  try {
    let result;
    if (username) {
      result = await pool.query('SELECT * FROM posts WHERE username = $1 ORDER BY timestamp DESC', [username]);
    } else {
      result = await pool.query('SELECT * FROM posts ORDER BY timestamp DESC');
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter posts' });
  }
});

// Criar post: POST /api/posts
app.post('/api/posts', async (req, res) => {
  const { username, title, text, media, link, timestamp } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (username, title, text, media, link, timestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username, title, text, media, link, timestamp]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

// Excluir post: DELETE /api/posts/:id
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir post' });
  }
});

// -----------------------
// Endpoints de Stories
// -------------------------

// Obter stories: GET /api/stories
app.get('/api/stories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stories ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter stories' });
  }
});

// Criar story: POST /api/stories
app.post('/api/stories', async (req, res) => {
  const { username, media, timestamp } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stories (username, media, timestamp) VALUES ($1, $2, $3) RETURNING *',
      [username, media, timestamp]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar story' });
  }
});

// -----------------------
// Endpoints de Chats
// -------------------------

// Obter chats do usuário: GET /api/chats?username=...
app.get('/api/chats', async (req, res) => {
  const { username } = req.query;
  try {
    const result = await pool.query('SELECT * FROM chats WHERE $1 = ANY(participants)', [username]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter chats' });
  }
});

// Obter um chat específico: GET /api/chats/:id
app.get('/api/chats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM chats WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Chat não encontrado" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter chat" });
  }
});

// Criar chat: POST /api/chats
app.post('/api/chats', async (req, res) => {
  const { participants, messages } = req.body; // Espera um array de usernames e mensagens (array)
  try {
    const result = await pool.query(
      'INSERT INTO chats (participants, messages) VALUES ($1, $2) RETURNING *',
      [JSON.stringify(participants), JSON.stringify(messages || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar chat" });
  }
});

// Atualizar chat (ex: adicionar mensagem): PUT /api/chats/:id
app.put('/api/chats/:id', async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;
  try {
    const result = await pool.query(
      'UPDATE chats SET messages = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(messages), id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar chat" });
  }
});

// Verificar existência de chat: GET /api/chats/exist?username1=...&username2=...
app.get('/api/chats/exist', async (req, res) => {
  const { username1, username2 } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM chats WHERE participants @> $1::jsonb AND participants @> $2::jsonb AND array_length(participants, 1) = 2',
      [JSON.stringify([username1]), JSON.stringify([username2])]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao verificar existência de chat" });
  }
});

// -----------------------
// Endpoints de Interações (Seguir, Curtir, Comentar)
// -------------------------

// Seguir um usuário: POST /api/follow
app.post('/api/follow', async (req, res) => {
  const { userId, followerId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO followers (user_id, follower_id) VALUES ($1, $2) RETURNING *',
      [userId, followerId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao seguir usuário' });
  }
});

// Deixar de seguir um usuário: DELETE /api/follow
app.delete('/api/follow', async (req, res) => {
  const { userId, followerId } = req.body;
  try {
    await pool.query(
      'DELETE FROM followers WHERE user_id = $1 AND follower_id = $2',
      [userId, followerId]
    );
    res.json({ message: 'Desseguido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deixar de seguir usuário' });
  }
});

// Curtir post: POST /api/likes
app.post('/api/likes', async (req, res) => {
  const { postId, userId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *',
      [postId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao curtir post' });
  }
});

// Remover curtida: DELETE /api/likes
app.delete('/api/likes', async (req, res) => {
  const { postId, userId } = req.body;
  try {
    await pool.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    res.json({ message: 'Curtida removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover curtida' });
  }
});

// Comentar em post: POST /api/comments
app.post('/api/comments', async (req, res) => {
  const { postId, userId, commentText } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, commentText]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao comentar no post' });
  }
});

// Excluir comentário: DELETE /api/comments/:id
app.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Comentário excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir comentário' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
