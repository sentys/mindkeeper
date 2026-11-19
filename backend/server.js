const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const supabase = require('./db');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет токена авторизации' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Неверный токен' });

  req.user = user;
  // 👇 клиент с токеном пользователя — RLS теперь видит auth.uid()
  req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  next();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindKeeper API работает' });
});

app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.get('/api/notes', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('notes')
      .select(`
        id, content, source_type, source_title, source_author, created_at,
        collections (name),
        note_tags ( tags (id, name) )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const notes = (data || []).map(({ collections, note_tags, ...n }) => ({
      ...n,
      collection_name: collections?.name ?? null,
      tags: (note_tags || []).map(nt => nt.tags).filter(Boolean),
    }));
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', authenticate, async (req, res) => {
  const { content, source_type, source_title, source_author, collection_id, tags } = req.body;
  if (!content || !source_type) {
    return res.status(400).json({ error: 'content и source_type обязательны' });
  }
  try {
    const { data: note, error } = await req.supabase
      .from('notes')
      .insert({ user_id: req.user.id, collection_id: collection_id || null, content, source_type, source_title: source_title || null, source_author: source_author || null })
      .select().single();
    if (error) throw error;

    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const { data: tag, error: tagErr } = await req.supabase
          .from('tags')
          .upsert({ user_id: req.user.id, name: tagName }, { onConflict: 'user_id,name' })
          .select('id').single();
        if (tagErr) throw tagErr;
        await req.supabase.from('note_tags').insert({ note_id: note.id, tag_id: tag.id });
      }
    }
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/collections', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('collections').select('*')
      .eq('user_id', req.user.id).order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', authenticate, async (req, res) => {
  const { name, description } = req.body;
  try {
    const { data, error } = await req.supabase
      .from('collections')
      .insert({ user_id: req.user.id, name, description: description || null })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notes/:id', authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('notes').delete()
      .eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен: http://localhost:${PORT}`));