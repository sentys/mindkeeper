import { useState } from 'react';
import { createNote, createCollection } from '../api';

export default function NoteForm({ onCreated, collections, onCollectionCreated }) {
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('Книга');
  const [collectionId, setCollectionId] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceAuthor, setSourceAuthor] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [error, setError] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) return setError('Введите текст заметки');

    try {
      const tags = tagsStr
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await createNote({
        content,
        source_type: sourceType,
        collection_id: collectionId || null,
        source_title: sourceTitle || null,
        source_author: sourceAuthor || null,
        tags,
      });

      setContent('');
      setSourceTitle('');
      setSourceAuthor('');
      setTagsStr('');
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // 👇 Теперь это обычный обработчик клика, а не submit формы
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      await createCollection({ name: newCollectionName, description: newCollectionDesc || null });
      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowNewCollection(false);
      onCollectionCreated();
    } catch (err) {
      setError('Ошибка создания коллекции: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>✏️ Новая заметка</h2>
      {error && <div style={styles.error}>{error}</div>}

      <textarea
        placeholder="Введите цитату или заметку..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        style={styles.textarea}
      />

      <div style={styles.row}>
        <select value={sourceType} onChange={e => setSourceType(e.target.value)} style={styles.select}>
          <option>Книга</option>
          <option>Статья</option>
          <option>Видео</option>
          <option>Подкаст</option>
          <option>Лекция</option>
          <option>Другое</option>
        </select>

        <div style={styles.collectionWrapper}>
          <select value={collectionId} onChange={e => setCollectionId(e.target.value)} style={styles.select}>
            <option value="">— Без коллекции —</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => setShowNewCollection(!showNewCollection)} style={styles.addCollectionBtn}>
            {showNewCollection ? '✕' : '＋'}
          </button>
        </div>
      </div>

      {showNewCollection && (
        <div style={styles.newCollectionForm}>
          <input
            placeholder="Название коллекции"
            value={newCollectionName}
            onChange={e => setNewCollectionName(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Описание (необязательно)"
            value={newCollectionDesc}
            onChange={e => setNewCollectionDesc(e.target.value)}
            style={styles.input}
          />
          {/* 👇 type="button" — чтобы не триггерить внешний form onSubmit */}
          <button type="button" onClick={handleCreateCollection} style={styles.smallBtn}>Создать</button>
        </div>
      )}

      <div style={styles.row}>
        <input
          placeholder="Название источника"
          value={sourceTitle}
          onChange={e => setSourceTitle(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Автор"
          value={sourceAuthor}
          onChange={e => setSourceAuthor(e.target.value)}
          style={styles.input}
        />
      </div>

      <input
        placeholder="Теги через запятую: мотивация, лидерство"
        value={tagsStr}
        onChange={e => setTagsStr(e.target.value)}
        style={styles.input}
      />

      <button type="submit" style={styles.btn}>💾 Сохранить</button>
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
  },
  title: { fontSize: 20, margin: 0 },
  error: { background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, fontSize: 14 },
  textarea: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 15,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  row: { display: 'flex', gap: 12 },
  select: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    background: '#fff',
  },}
