/**
 * src/components/LoginPage.jsx
 *
 * Tek sorumluluk: Giriş formunu göster ve onAuth callback'ini çağır.
 * Auth mantığı → useAuth hook'unda.
 * API çağrısı → api.js'de.
 */
import { useState } from 'react';

export default function LoginPage({ onLogin, loading, error }) {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      alert('Kullanıcı adı ve şifre gereklidir.');
      return;
    }
    onLogin(form.username, form.password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Algan Logo" className="login-logo" />
        <h2>Algan Devam Takip</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            className="form-input"
            placeholder="Kullanıcı Adı"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
