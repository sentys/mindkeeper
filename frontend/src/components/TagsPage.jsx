import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTags } from '../api';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTags().then(setTags).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.container}>
      <header style={s.header}>
        <Link to="/" style={s.back}>← Назад</Link>
        <h1 style={s.title}>🏷 Мои теги</h1>
      </header>

      <main style={s.main}>
        {loading ? <div style={s.center}>Загрузка...</div> : tags.length === 0 ? (
          <div style={s.center}>Теги пока не созданы</div>
        ) : (
          <div style={s.cloud}>
            {tags.map(t => (
              <Link key={t.id} to={`/tags/${t.id}`} style={s.tag}>
                {t.name}
                <span style={s.count}>{t.count}</span>
              </Link>
            ))}
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
  cloud: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  tag: { padding: '10px 20px', borderRadius: 20, background: '#fff', border: '1px solid #d1d5db', color: '#06519c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' },
  count: { background: '#06519c', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 },
  center: { textAlign: 'center', padding: 60, color: '#86868b' },
};