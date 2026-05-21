/**
 * src/components/UserList.jsx
 *
 * Tek sorumluluk: Kullanıcı listesi, ekleme, düzenleme, silme.
 */
import { useState } from 'react';
import { usersApi } from '../services/api';

const UNITS = ['Aviyonik', 'Yazılım', 'Mekanik', 'Yönetim'];
const ROLES = [
  { value: 'member', label: 'Üye' },
  { value: 'head', label: 'Birim Başkanı' },
  { value: 'admin', label: 'Kaptan' },
];

const getRank = (u) => {
  if (u.role === 'admin') return 1;
  if (u.role === 'head')
    return u.unit === 'Aviyonik' ? 2 : u.unit === 'Yazılım' ? 3 : 4;
  return u.unit === 'Aviyonik' ? 6 : u.unit === 'Yazılım' ? 7 : 8;
};

export default function UserList({ currentUser, users, onDataChange }) {
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const canEdit = (target) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'head' && target.unit === currentUser.unit) return true;
    return false;
  };

  const visibleUsers = () => {
    if (currentUser.role === 'admin') return users;
    if (currentUser.role === 'head')
      return users.filter((u) => u.unit === currentUser.unit);
    if (currentUser.managedIds?.length > 0)
      return users.filter((u) =>
        currentUser.managedIds.some((id) => String(id) === String(u.id)),
      );
    return [];
  };

  const openAdd = () => {
    setFormData({ unit: 'Aviyonik', role: 'member' });
    setError('');
    setModal('add');
  };

  const openEdit = (user) => {
    setFormData({ ...user });
    setError('');
    setModal('edit');
  };

  const handleSave = async () => {
    try {
      if (modal === 'add') {
        if (!formData.password) {
          setError('Şifre zorunludur');
          return;
        }
        await usersApi.create(formData);
      } else {
        // Şifre boşsa güncelleme payload'ından çıkar
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await usersApi.update(formData.id, payload);
      }
      setModal(null);
      onDataChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) return;
    try {
      await usersApi.delete(id);
      onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  const sorted = visibleUsers().sort((a, b) => getRank(a) - getRank(b));

  return (
    <div className="page active">
      <div className="page-header">
        <h2>Üye Yönetimi</h2>
        {(currentUser.role === 'admin' || currentUser.role === 'head') && (
          <button className="btn-login" onClick={openAdd}>
            <i className="fas fa-user-plus" /> Yeni Üye
          </button>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>Kullanıcı Adı</th>
            <th>Birim</th>
            <th>Rol</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.username}</td>
              <td>{u.unit}</td>
              <td>{u.role}</td>
              <td>
                {canEdit(u) ? (
                  <>
                    <button className="btn btn-edit" onClick={() => openEdit(u)}>
                      <i className="fas fa-edit" />
                    </button>
                    <button className="btn btn-del" onClick={() => handleDelete(u.id)}>
                      <i className="fas fa-trash" />
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#ccc' }}>Yetki Yok</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-box">
            <span className="close-modal" onClick={() => setModal(null)}>
              &times;
            </span>
            <h3>{modal === 'add' ? 'Yeni Üye Ekle' : 'Üye Düzenle'}</h3>

            <label>Ad Soyad</label>
            <input
              type="text"
              className="form-input"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <label>Kullanıcı Adı</label>
            <input
              type="text"
              className="form-input"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <label>Şifre {modal === 'edit' && '(Değiştirmek için doldurun)'}</label>
            <input
              type="password"
              className="form-input"
              placeholder={modal === 'edit' ? 'Değiştirmek için giriniz' : 'En az 6 karakter'}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <label>Birim</label>
            <select
              className="form-input"
              value={formData.unit || 'Aviyonik'}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>

            <label>Rol</label>
            <select
              className="form-input"
              value={formData.role || 'member'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            {error && <p className="error-msg">{error}</p>}

            <button
              className="btn-login"
              onClick={handleSave}
              style={{ marginTop: 15, background: modal === 'edit' ? '#f59e0b' : undefined }}
            >
              {modal === 'add' ? 'Kaydet' : 'Güncelle'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
