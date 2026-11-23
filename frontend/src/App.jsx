import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { getNotes, deleteNote, getCollections } from './api';
import { AuthProvider, useAuth } from './AuthContext';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import Login from './components/Login';
import Register from './components/Register';
import NoteDetail from './components/NoteDetail';
import CollectionPage from './components/CollectionPage';
import TagsPage from './components/TagsPage';
import TagNotesPage from './components/TagNotesPage';
import ProfilePage from './components/ProfilePage';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [notesData, collectionsData] = await Promise.all([getNotes(), getCollections()]);
      setNotes(notesData);
      setCollections(collectionsData);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
      else console.error('Ошибка загрузки:', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить заметку?')) return;
    await deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return n.content.toLowerCase().includes(q) ||
      n.source_title?.toLowerCase().includes(q) ||
      n.source_author?.toLowerCase().includes(q) ||
      n.tags?.some(t => t.name.toLowerCase().includes(q));
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.logo}>📚 MindKeeper</div>
            <p style={styles.tagline}>Сохраняй цитаты и идеи. Не теряй их.</p>
          </div>
          <nav style={styles.nav}>
            <Link to="/tags" style={styles.navLink}>🏷 Теги</Link>
            <Link to="/profile" style={styles.navLink}>👤 Профиль</Link>
            <span style={styles.userEmail}>{user?.email}</span>
            <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Выйти</button>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <NoteForm onCreated={loadData} collections={collections} onCollectionCreated={loadData} />
        <div style={styles.notesSection}>
          <div style={styles.notesHeader}>
            <h2 style={styles.notesTitle}>Мои записи <span style={styles.counter}>{notes.length}</span></h2>
            <input placeholder="🔍 Поиск по тексту, автору, тегам..." value={search}
              onChange={e => setSearch(e.target.value)} style={styles.search} />
          </div>
          {loading ? <div style={styles.empty}>Загрузка...</div> :
            filteredNotes.length === 0 ? <div style={styles.empty}>{search ? 'Ничего не найдено' : 'Пока нет записей. Добавь первую!'}</div> :
            <div style={styles.grid}>{filteredNotes.map(note => <NoteCard key={note.id} note={note} onDelete={handleDelete} />)}</div>}
        </div>
      </main>

      <footer style={styles.footer}>MindKeeper · {new Date().getFullYear()}</footer>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Загрузка...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/notes/:id" element={<Protected><NoteDetail /></Protected>} />
          <Route path="/collections/:id" element={<Protected><CollectionPage /></Protected>} />
          <Route path="/tags" element={<Protected><TagsPage /></Protected>} />
          <Route path="/tags/:id" element={<Protected><TagNotesPage /></Protected>} />
          <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { background: '#fff', borderBottom: '1px solid #e5e5e7', padding: '20px 32px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  logo: { fontSize: 24, fontWeight: 700 },
  tagline: { color: '#86868b', fontSize: 14, marginTop: 2 },
  nav: { display: 'flex', alignItems: 'center', gap: 16 },
  navLink: { color: '#06519c', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  userEmail: { fontSize: 14, color: '#6b7280' },
  logoutBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 20px', width: '100%' },
  notesSection: { marginTop: 8 },
  notesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' },
  notesTitle: { fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, margin: 0 },
  counter: { fontSize: 13, background: '#06519c', color: '#fff', padding: '2px 10px', borderRadius: 12, fontWeight: 600 },
  search: { maxWidth: 320, width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  empty: { textAlign: 'center', color: '#86868b', padding: 60, fontSize: 15 },
  footer: { textAlign: 'center', padding: 20, color: '#86868b', fontSize: 12, borderTop: '1px solid #e5e5e7', background: '#fff' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
};