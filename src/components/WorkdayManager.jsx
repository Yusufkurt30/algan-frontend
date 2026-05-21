/**
 * src/components/WorkdayManager.jsx
 *
 * Tek sorumluluk: Çalışma günlerini listele, ekle (tekli/aralık), sil.
 */
import { useState } from 'react';
import { workdaysApi } from '../services/api';

export default function WorkdayManager({ workDays, onDataChange }) {
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    try {
      if (isRangeMode) {
        if (!formData.startDate || !formData.endDate || !formData.description) {
          setError('Tüm alanları doldurun');
          return;
        }
        await workdaysApi.createRange({
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description,
        });
      } else {
        if (!formData.date || !formData.description) {
          setError('Tüm alanları doldurun');
          return;
        }
        await workdaysApi.create({ date: formData.date, description: formData.description });
      }
      setShowModal(false);
      setFormData({});
      onDataChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu çalışma gününü silmek istediğinizden emin misiniz?')) return;
    try {
      await workdaysApi.delete(id);
      onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <h2>Çalışma Günleri</h2>
        <button className="btn-login" onClick={() => { setShowModal(true); setError(''); setFormData({}); }}>
          <i className="fas fa-plus" /> Gün Ekle
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Tarih</th><th>Açıklama</th><th>İşlem</th></tr>
        </thead>
        <tbody>
          {workDays.map((d) => (
            <tr key={d.id}>
              <td>{d.date}</td>
              <td>{d.description}</td>
              <td>
                <button className="btn btn-del" onClick={() => handleDelete(d.id)}>
                  <i className="fas fa-trash" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-box">
            <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
            <h3>Yeni Çalışma Günü</h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0', cursor: 'pointer', fontWeight: 'bold' }}>
              <input
                type="checkbox"
                checked={isRangeMode}
                onChange={(e) => setIsRangeMode(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              Tarih Aralığı Ekle (Toplu)
            </label>

            {isRangeMode ? (
              <>
                <label>Başlangıç Tarihi</label>
                <input type="date" className="form-input" onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <label>Bitiş Tarihi</label>
                <input type="date" className="form-input" onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </>
            ) : (
              <>
                <label>Tarih</label>
                <input type="date" className="form-input" onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </>
            )}

            <label>Açıklama</label>
            <input
              type="text"
              className="form-input"
              placeholder={isRangeMode ? 'Örn: Yarıyıl Tatili' : 'Örn: Ara Tatil 1. Gün'}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {error && <p className="error-msg">{error}</p>}

            <button className="btn-login" onClick={handleAdd} style={{ marginTop: 15 }}>
              {isRangeMode ? 'Aralığı Ekle' : 'Takvime Ekle'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
