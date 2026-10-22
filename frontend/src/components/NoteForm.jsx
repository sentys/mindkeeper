import { useState } from 'react';
import { createNote } from '../api';

export default function NoteForm({ onCreated, collections }) {
  const [form, setForm] = useState({
    content: '',
    source_type: 'book',
    source_title: '',
    source_author: '',
    collection_id: '',
    tagsInput: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.content.trim()) {
      setError('Текст заметки не может быть пустым');
      return;
    }

    setLoading(true);
    try {
      const tags = form.tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const payload = {
        content: form.content,
        source_type: form.source_type,
        source_title: form.source_title || null,
        source_author: form.source_author || null,
        collection_id: form.collection_id || null,
        tags,
      };

      await createNote(payload);
      setForm({
        content: '',
        source_type: 'book',
        source_title: '',
        source_author: '',
        collection_id: '',
        tagsInput: '',
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>✏️ Новая заметка</h2>

      <textarea
        name="content"
        placeholder="Введите цитату или заметку..."
        value={form.content}
        onChange={handleChange}
        rows={4}
        required
      />

      <div style={styles.row}>
        <select name="source_type" value={form.source_type} onChange={handleChange}>
          <option value="book">📖 Книга</option>
          <option value="article">📰 Статья</option>
          <option value="video">🎬 Видео</option>
          <option value="other">💭 Другое</option>
        </select>

        <select name="collection_id" value={form.collection_id} onChange={handleChange}>
          <option value="">— Без коллекции —</option>
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.row}>
        <input
          name="source_title"
          placeholder="Название источника"
          value={form.source_title}
          onChange={handleChange}
        />
        <input
          name="source_author"
          placeholder="Автор"
          value={form.source_author}
          onChange={handleChange}
        />
      </div>

      <input
        name="tagsInput"
        placeholder="Теги через запятую: мотивация, лидерство"
        value={form.tagsInput}
        onChange={handleChange}
      />

      {error && <div style={styles.error}>⚠️ {error}</div>}

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? 'Сохраняем...' : '💾 Сохранить'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  submitBtn: {
    background: '#0071e3',
    color: '#fff',
    padding: '12px 24px',
    fontWeight: 600,
    marginTop: 4,
  },
  error: {
    background: '#fff3f3',
    color: '#c00',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
  },
};