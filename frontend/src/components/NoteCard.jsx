export default function NoteCard({ note, onDelete }) {
  const sourceLabels = {
    book: '📖',
    article: '📰',
    video: '🎬',
    other: '💭',
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.sourceIcon}>
          {sourceLabels[note.source_type] || '💭'}
        </span>
        <div style={styles.sourceInfo}>
          {note.source_title && <div style={styles.sourceTitle}>{note.source_title}</div>}
          {note.source_author && <div style={styles.author}>{note.source_author}</div>}
        </div>
        <button onClick={() => onDelete(note.id)} style={styles.deleteBtn} title="Удалить">
          🗑
        </button>
      </div>

      <div style={styles.content}>{note.content}</div>

      <div style={styles.footer}>
        {note.collection_name && (
          <span style={styles.collection}>📁 {note.collection_name}</span>
        )}
        {note.tags?.map(tag => (
          <span key={tag.id} style={styles.tag}>#{tag.name}</span>
        ))}
      </div>

      <div style={styles.date}>
        {new Date(note.created_at).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sourceIcon: {
    fontSize: 24,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    fontWeight: 600,
    fontSize: 14,
  },
  author: {
    fontSize: 12,
    color: '#86868b',
  },
  deleteBtn: {
    background: 'transparent',
    color: '#86868b',
    padding: 4,
    fontSize: 16,
  },
  content: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#1d1d1f',
    whiteSpace: 'pre-wrap',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  collection: {
    fontSize: 12,
    background: '#f0f0f5',
    padding: '3px 10px',
    borderRadius: 12,
    color: '#515154',
  },
  tag: {
    fontSize: 12,
    background: '#e8f2ff',
    color: '#0071e3',
    padding: '3px 10px',
    borderRadius: 12,
  },
  date: {
    fontSize: 11,
    color: '#86868b',
    marginTop: 4,
  },
};