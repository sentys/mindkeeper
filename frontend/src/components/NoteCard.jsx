import { Link } from 'react-router-dom';

export default function NoteCard({ note, onDelete }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.badge}>{note.source_type}</span>
        {note.collection_name && (
          <Link to={`/collections/${note.collection_id}`} style={styles.collectionLink}>
            {note.collection_name}
          </Link>
        )}
      </div>
      <Link to={`/notes/${note.id}`} style={styles.contentLink}>
        <div style={styles.content}>{note.content}</div>
      </Link>
      <div style={styles.source}>
        {note.source_title && <div>{note.source_title}</div>}
        {note.source_author && <div style={styles.author}>{note.source_author}</div>}
      </div>
      <div style={styles.tags}>
        {(note.tags || []).map(t => (
          <Link key={t.id} to={`/tags/${t.id}`} style={styles.tag}>{t.name}</Link>
        ))}
      </div>
      <button onClick={() => onDelete(note.id)} style={styles.deleteBtn}>🗑 Удалить</button>
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 12,
    background: '#e0e7ff',
    color: '#06519c',
    fontSize: 12,
    fontWeight: 600,
  },
  collectionLink: {
    color: '#06519c',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
  },
  contentLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  content: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#1f2937',
    maxHeight: 120,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 5,
    WebkitBoxOrient: 'vertical',
  },
  source: {
    fontSize: 12,
    color: '#6b7280',
  },
  author: {
    fontStyle: 'italic',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    padding: '3px 10px',
    borderRadius: 12,
    background: '#f3f4f6',
    color: '#06519c',
    textDecoration: 'none',
    fontSize: 11,
  },
  deleteBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #fca5a5',
    background: '#fff',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
};