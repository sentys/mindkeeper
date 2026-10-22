import { useEffect, useState } from 'react';
import { getNotes, deleteNote, getCollections } from './api';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const [notesData, collectionsData] = await Promise.all([
        getNotes(),
        getCollections(),
      ]);
      setNotes(notesData);
      setCollections(collectionsData);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить заметку?')) return;
    await deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      n.content.toLowerCase().includes(s) ||
      n.source_title?.toLowerCase().includes(s) ||
      n.source_author?.toLowerCase().includes(s) ||
      n.tags?.some(t => t.name.toLowerCase().includes(s))
    );
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>📚 MindKeeper</h1>
        <p style={styles.tagline}>Сохраняй цитаты и идеи. Не теряй их.</p>
      </header>

      <main style={styles.main}>
        <NoteForm onCreated={loadData} collections={collections} />

        <div style={styles.notesSection}>
          <div style={styles.notesHeader}>
            <h2 style={styles.notesTitle}>
              Мои записи <span style={styles.counter}>{notes.length}</span>
            </h2>
            <input
              placeholder="🔍 Поиск по тексту, автору, тегам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />
          </div>

          {loading ? (
            <div style={styles.empty}>Загрузка...</div>
          ) : filteredNotes.length === 0 ? (
            <div style={styles.empty}>
              {search ? 'Ничего не найдено' : 'Пока нет записей. Добавь первую!'}
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        MindKeeper · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e5e7',
    padding: '20px 32px',
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
  },
  tagline: {
    color: '#86868b',
    fontSize: 14,
    marginTop: 2,
  },
  main: {
    flex: 1,
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 20px',
    width: '100%',
  },
  notesSection: {
    marginTop: 8,
  },
  notesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  notesTitle: {
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  counter: {
    fontSize: 13,
    background: '#0071e3',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: 12,
    fontWeight: 600,
  },
  search: {
    maxWidth: 320,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#86868b',
    padding: 60,
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    padding: 20,
    color: '#86868b',
    fontSize: 12,
    borderTop: '1px solid #e5e5e7',
    background: '#fff',
  },
};