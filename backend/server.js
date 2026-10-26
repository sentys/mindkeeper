const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// -------- Health check --------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindKeeper API работает' });
});

// Запрет на индексирование api

app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// -------- GET all notes (с тегами и коллекцией) --------
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        n.id,
        n.content,
        n.source_type,
        n.source_title,
        n.source_author,
        n.created_at,
        c.name AS collection_name,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name))
           FROM note_tags nt
           JOIN tags t ON t.id = nt.tag_id
           WHERE nt.note_id = n.id),
          '[]'
        ) AS tags
      FROM notes n
      LEFT JOIN collections c ON c.id = n.collection_id
      ORDER BY n.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------- POST create note --------
app.post('/api/notes', async (req, res) => {
  const { content, source_type, source_title, source_author, collection_id, tags } = req.body;

  if (!content || !source_type) {
    return res.status(400).json({ error: 'content и source_type обязательны' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Берём первого юзера (пока нет авторизации)
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0].id;

    const noteRes = await client.query(
      `INSERT INTO notes (user_id, collection_id, content, source_type, source_title, source_author)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, collection_id || null, content, source_type, source_title || null, source_author || null]
    );
    const note = noteRes.rows[0];

    // Обработка тегов
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Upsert тега
        const tagRes = await client.query(
          `INSERT INTO tags (user_id, name) VALUES ($1, $2)
           ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [userId, tagName]
        );
        const tagId = tagRes.rows[0].id;

        await client.query(
          `INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [note.id, tagId]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(note);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// -------- GET collections --------
app.get('/api/collections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collections ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- POST create collection --------
app.post('/api/collections', async (req, res) => {
  const { name, description } = req.body;
  try {
    const userRes = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0].id;

    const result = await pool.query(
      `INSERT INTO collections (user_id, name, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- DELETE note --------
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- Запуск --------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});