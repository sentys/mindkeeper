import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNotesByTag } from '../api';
import NoteCard from './NoteCard';

export default function TagNotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotesByTag(id).then(data => {
      setNotes(data);
      if (data[0]?.tags?.[0]) setTagName(data[0].tags[0].name);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Удалить заметку?')) return;
    const { deleteNote } = await import('../api');
    await deleteNote(noteId);
    setNotes(notes.filter(n => n.id !== noteId));
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <Link to="/tags" style={s.back}>← К тегам</Link>
        <h1 style={s.title}>🏷 {tagName}</h1>
      </header>

      <main style={s.main}>
        {loading ? <div style={s.center}>Загрузка...</div> : notes.length === 0 ? (
          <div style={s.center}>Заметок с этим тегом нет</div>
        ) : (
          <div style={s.grid}>
            {notes.map(note => <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />)}
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f5f5f7' },
  header: { background: '#fff', borderBottom: '1px solid #e5e5e7', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 20 },
  back: { color: '#06519c', textDecoration: 'none', fontWeight: 600 },
  title: { fontSize: 24, margin: 0 },
  main: { maxWidth: 900, margin: '32px auto', padding: '0 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  center: { textAlign: 'center', padding: 60, color: '#86868b' },
};