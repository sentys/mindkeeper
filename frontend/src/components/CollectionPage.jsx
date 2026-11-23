import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCollection, deleteCollection } from '../api';
import NoteCard from '../components/NoteCard';

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const data = await getCollection(id);
      setCollection(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить коллекцию и все заметки в ней?')) return;
    await deleteCollection(id);
    navigate('/');
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Удалить заметку?')) return;
    const { deleteNote } = await import('../api');
    await deleteNote(noteId);
    await load();
  };

  if (loading) return <div style={s.center}>Загрузка...</div>;
  if (!collection) return <div style={s.center}>Коллекция не найдена</div>;

  return (
    <div style={s.container}>
      <header style={s.header}>
        <Link to="/" style={s.back}>← Назад</Link>
        <button onClick={handleDelete} style={s.btnDanger}>🗑 Удалить коллекцию</button>
      </header>

      <main style={s.main}>
        <h1 style={s.title}>{collection.name}</h1>
        {collection.description && <p style={s.desc}>{collection.description}</p>}
        <div style={s.count}>Заметок: {collection.notes?.length || 0}</div>

        <div style={s.grid}>
          {(collection.notes || []).map(note => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))}
        </div>
        {collection.notes?.length === 0 && <div style={s.empty}>В этой коллекции пока нет заметок</div>}
      </main>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f5f5f7' },
  header: { background: '#fff', borderBottom: '1px solid #e5e5e7', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#06519c', textDecoration: 'none', fontWeight: 600 },
  btnDanger: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer' },
  main: { maxWidth: 900, margin: '32px auto', padding: '0 20px' },
  title: { fontSize: 28, marginBottom: 8 },
  desc: { color: '#6b7280', marginBottom: 16 },
  count: { color: '#86868b', fontSize: 14, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  empty: { textAlign: 'center', color: '#86868b', padding: 60 },
  center: { textAlign: 'center', padding: 60, color: '#86868b' },
};