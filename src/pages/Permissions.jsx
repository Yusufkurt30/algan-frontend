import PropTypes from 'prop-types';
import React from 'react';

const Permissions = ({
  currentUser,
  users,
  getRank,
  openPermissionModal
}) => {
  return (
    <div className="page active">
      <h2>Yetki Delegasyonu</h2>
      <p style={{color:'#64748b'}}>Buradan biriminizdeki üyelere, belirli kişilerin saatlerini girme yetkisi verebilirsiniz.</p>
      <table style={{width:'100%', marginTop:'20px'}}>
        <thead><tr><th>İsim</th><th>Birim</th><th>Yönettiği Kişiler</th><th>Yetki Ata</th></tr></thead>
        <tbody>
          {users.filter(u => (currentUser.role === 'admin' || u.unit === currentUser.unit))
            .sort((a,b)=>getRank(a)-getRank(b))
            .map(u => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.unit}</td><td>{u.managedIds ? u.managedIds.length : 0} Kişi</td>
                <td>
                  <button className="btn btn-auth" onClick={()=>openPermissionModal(u)}>
                    <i className="fas fa-user-check"></i> Bağlı Üyeleri Seç
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

Permissions.propTypes = {
  currentUser: PropTypes.any,
  users: PropTypes.any,
  getRank: PropTypes.any,
  openPermissionModal: PropTypes.any,
};

export default Permissions;
