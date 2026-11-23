import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getNote, updateNote, deleteNote } from '../api';

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const data = await getNote(id);
      setNote(data);
      setForm(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await updateNote(id, form);
      setNote(updated);
      setEditing(false);
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить заметку?')) return;
    await deleteNote(id);
    navigate('/');
  };

  if (loading) return <div style={s.center}>Загрузка...</div>;
  if (!note) return <div style={s.center}>Заметка не найдена</div>;

  return (
    <div style={s.container}>
      <header style={s.header}>
        <Link to="/" style={s.back}>← Назад</Link>
        <div style={s.actions}>
          {editing ? (
            <>
              <button onClick={handleSave} style={s.btnPrimary}>💾 Сохранить</button>
              <button onClick={() => { setEditing(false); setForm(note); }} style={s.btnSecondary}>Отмена</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} style={s.btnPrimary}>✏️ Редактировать</button>
              <button onClick={handleDelete} style={s.btnDanger}>🗑 Удалить</button>
            </>
          )}
        </div>
      </header>

      <main style={s.main}>
        <div style={s.meta}>
          <span style={s.badge}>{note.source_type}</span>
          {note.collection_name && <Link to={`/collections/${note.collection_id}`} style={s.link}>{note.collection_name}</Link>}
          <span style={s.date}>{new Date(note.created_at).toLocaleString('ru-RU')}</span>
        </div>

        {editing ? (
          <textarea
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            style={s.textarea}
            rows={10}
          />
        ) : (
          <div style={s.content}>{note.content}</div>
        )}

        <div style={s.source}>
          {editing ? (
            <>
              <input value={form.source_title || ''} onChange={e => setForm({ ...form, source_title: e.target.value })} placeholder="Название источника" style={s.input} />
              <input value={form.source_author || ''} onChange={e => setForm({ ...form, source_author: e.target.value })} placeholder="Автор" style={s.input} />
            </>
          ) : (
            <>
              {note.source_title && <div><strong>Источник:</strong> {note.source_title}</div>}
              {note.source_author && <div><strong>Автор:</strong> {note.source_author}</div>}
            </>
          )}
        </div>

        <div style={s.tags}>
          {(note.tags || []).map(t => (
            <Link key={t.id} to={`/tags/${t.id}`} style={s.tag}>{t.name}</Link>
          ))}
        </div>
      </main>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f5f5f7' },
  header: { background: '#fff', borderBottom: '1px solid #e5e5e7', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#06519c', textDecoration: 'none', fontWeight: 600 },
  actions: { display: 'flex', gap: 8 },
  btnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#06519c', color: '#fff', cursor: 'pointer' },
  btnSecondary: { padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer' },
  main: { maxWidth: 800, margin: '32px auto', padding: '0 20px' },
  meta: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  badge: { padding: '4px 12px', borderRadius: 12, background: '#e0e7ff', color: '#06519c', fontSize: 13, fontWeight: 600 },
  link: { color: '#06519c', textDecoration: 'none', fontSize: 14 },
  date: { color: '#86868b', fontSize: 13 },
  content: { background: '#fff', padding: 24, borderRadius: 12, fontSize: 16, lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' },
  textarea: { width: '100%', padding: 16, borderRadius: 12, border: '1px solid #d1d5db', fontSize: 16, fontFamily: 'inherit', resize: 'vertical', marginBottom: 20 },
  source: { background: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 },
  tags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tag: { padding: '6px 14px', borderRadius: 16, background: '#fff', border: '1px solid #d1d5db', color: '#06519c', textDecoration: 'none', fontSize: 13 },
  center: { textAlign: 'center', padding: 60, color: '#86868b' },
};