import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getNotes, deleteNote, getCollections } from './api';
import { useAuth, AuthProvider } from './AuthContext';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import Login from './components/Login';
import Register from './components/Register';

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
      console.error('Ошибка загрузки:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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
        <div style={styles.headerTop}>
          <div style={styles.logo}>📚 MindKeeper</div>
          <div style={styles.userInfo}>
            <span>{user?.email}</span>
            <button onClick={logout} style={styles.logoutBtn}>Выйти</button>
          </div>
        </div>
        <p style={styles.tagline}>Сохраняй цитаты и идеи. Не теряй их.</p>
      </header>

      <main style={styles.main}>
        <NoteForm onCreated={loadData} collections={collections} />
        <div style={styles.notesSection}>
          <div style={styles.notesHeader}>
            <h2 style={styles.notesTitle}>Мои записи <span style={styles.counter}>{notes.length}</span></h2>
            <input placeholder="🔍 Поиск по тексту, автору, тегам..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.search} />
          </div>

          {loading ? (
            <div style={styles.empty}>Загрузка...</div>
          ) : filteredNotes.length === 0 ? (
            <div style={styles.empty}>{search ? 'Ничего не найдено' : 'Пока нет записей. Добавь первую!'}</div>
          ) : (
            <div style={styles.grid}>
              {filteredNotes.map(note => (<NoteCard key={note.id} note={note} onDelete={handleDelete} />))}
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>MindKeeper · {new Date().getFullYear()}</footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { background: '#fff', borderBottom: '1px solid #e5e5e7', padding: '20px 32px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: 700, margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#6b7280' },
  logoutBtn: { padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 },
  tagline: { color: '#86868b', fontSize: 14, marginTop: 2 },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 20px', width: '100%' },
  notesSection: { marginTop: 8 },
  notesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' },
  notesTitle: { fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, margin: 0 },
  counter: { fontSize: 13, background: '#06519c', color: '#fff', padding: '2px 10px', borderRadius: 12, fontWeight: 600 },
  search: { maxWidth: 320, padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  empty: { textAlign: 'center', color: '#86868b', padding: 60, fontSize: 15 },
  footer: { textAlign: 'center', padding: 20, color: '#86868b', fontSize: 12, borderTop: '1px solid #e5e5e7', background: '#fff' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#6b7280' }
};