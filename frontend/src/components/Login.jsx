import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Вход в MindKeeper</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          <button type="submit" style={styles.button}>Войти</button>
        </form>
        <p style={styles.footerText}>Нет аккаунта? <Link to="/register" style={styles.link}>Зарегистрироваться</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7' },
  card: { background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 400 },
  title: { textAlign: 'center', marginBottom: 24, fontSize: 24 },
  error: { background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  input: { padding: '12px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16 },
  button: { padding: '12px 16px', borderRadius: 8, border: 'none', background: '#06519c', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' },
  link: { color: '#06519c', textDecoration: 'none', fontWeight: 600 }
};