/**
 * src/components/AccountSettings.jsx
 *
 * Tek sorumluluk: Mevcut kullanıcının profil/şifre güncelleme formu.
 */
import { useState } from 'react';
import { usersApi } from '../services/api';
import { tokenStorage } from '../services/api';

export default function AccountSettings({ currentUser, onUserUpdated }) {
  const [form, setForm] = useState({
    username: currentUser.username,
    password: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setMessage('');
    setError('');

    if (form.password && form.password !== form.confirm) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    const payload = { username: form.username };
    if (form.password) payload.password = form.password;

    try {
      const updated = await usersApi.update(currentUser.id, payload);
      // Güncel kullanıcıyı localStorage'a kaydet
      const newUser = { ...currentUser, ...updated };
      tokenStorage.setUser(newUser);
      onUserUpdated(newUser);
      setMessage('Profil başarıyla güncellendi.');
      setForm((prev) => ({ ...prev, password: '', confirm: '' }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page active">
      <h2>Hesap Ayarları</h2>
      <div style={{ background: 'white', padding: 30, borderRadius: 10, maxWidth: 500, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <label><b>Kullanıcı Adı</b></label>
        <input
          type="text"
          className="form-input"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Yeni kullanıcı adınız"
        />
        <small style={{ color: '#64748b', display: 'block', marginBottom: 15 }}>
          Kullanıcı adını değiştirirsen bir sonraki girişte yenisini kullanmalısın.
        </small>

        <label><b>Yeni Şifre</b></label>
        <input
          type="password"
          className="form-input"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Yeni şifreniz (en az 6 karakter)"
        />

        <label><b>Şifre Tekrar</b></label>
        <input
          type="password"
          className="form-input"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          placeholder="Şifrenizi doğrulayın"
        />

        {error && <p className="error-msg">{error}</p>}
        {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}

        <button className="btn-login" onClick={handleUpdate} style={{ marginTop: 20 }}>
          Güncelle ve Kaydet
        </button>
      </div>
    </div>
  );
}
