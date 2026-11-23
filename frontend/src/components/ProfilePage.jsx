import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (newPassword.length < 6) return setError('Минимум 6 символов');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return setError(error.message);
    setMsg('✅ Пароль изменён');
    setNewPassword('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <Link to="/" style={s.back}>← Назад</Link>
        <h1 style={s.title}>👤 Профиль</h1>
      </header>

      <main style={s.main}>
        <div style={s.card}>
          <h2 style={s.subtitle}>Информация</h2>
          <div style={s.row}><strong>Email:</strong> {user?.email}</div>
          <div style={s.row}><strong>ID:</strong> <code style={s.code}>{user?.id}</code></div>
          <div style={s.row}><strong>Зарегистрирован:</strong> {new Date(user?.created_at).toLocaleString('ru-RU')}</div>
        </div>

        <div style={s.card}>
          <h2 style={s.subtitle}>Смена пароля</h2>
          {error && <div style={s.error}>{error}</div>}
          {msg && <div style={s.success}>{msg}</div>}
          <form onSubmit={handleChangePassword} style={s.form}>
            <input type="password" placeholder="Новый пароль (мин. 6 символов)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} style={s.input} />
            <button type="submit" style={s.btn}>Изменить пароль</button>
          </form>
        </div>

        <div style={s.card}>
          <button onClick={handleLogout} style={s.btnDanger}>🚪 Выйти из аккаунта</button>
        </div>
      </main>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f5f5f7' },
  header: { background: '#fff', borderBottom: '1px solid #e5e5e7', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 20 },
  back: { color: '#06519c', textDecoration: 'none', fontWeight: 600 },
  title: { fontSize: 24, margin: 0 },
  main: { maxWidth: 600, margin: '32px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#fff', padding: 24, borderRadius: 12 },
  subtitle: { fontSize: 18, marginBottom: 16 },
  row: { marginBottom: 12, fontSize: 15 },
  code: { background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, fontSize: 13 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 },
  btn: { padding: '12px', borderRadius: 8, border: 'none', background: '#06519c', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  btnDanger: { padding: '12px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 14 },
  success: { background: '#dcfce7', color: '#166534', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 14 },
};