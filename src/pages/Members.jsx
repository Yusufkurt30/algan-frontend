import React from 'react';

const Members = ({
  currentUser,
  setFormData,
  setModal,
  visibleMembers,
  hasManagerPermission,
  deleteMember,
  memberPageDesc
}) => {
  return (
    <div className="page active">
      <div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
        <h2>Üye Yönetimi</h2>
        <button className="btn btn-add" onClick={()=>{setFormData({unit:'Aviyonik', role:'member'}); setModal('member')}}>+ Yeni Üye Ekle</button>
      </div>
      <p style={{color:'#64748b', marginTop:'5px'}}>{memberPageDesc}</p>
      
      <table style={{width:'100%', marginTop:'20px'}}>
          <thead><tr><th>İsim</th><th>Kullanıcı Adı</th><th>Şifre</th><th>Birim</th><th>Rol</th><th>Yönet</th></tr></thead>
          <tbody>
            {visibleMembers.map(u => {
                let canEdit = (currentUser.role === 'admin') || (currentUser.role === 'head' && u.unit === currentUser.unit && u.role === 'member');
                let showPass = (currentUser.role === 'admin') || (currentUser.id === u.id) || (currentUser.role === 'head' && u.unit === currentUser.unit) || (currentUser.managedIds && hasManagerPermission(currentUser, u.id));
                
                let roleName = 'Üye';
                if (u.role === 'head') roleName = 'Birim Başkanı';
                else if (u.role === 'admin') roleName = 'Kaptan';

                return (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.username}</td>
                      <td>{showPass ? u.password : '***'}</td>
                      <td>{u.unit}</td>
                      <td>{roleName}</td>
                      <td>
                          {canEdit ? (
                            <>
                                <button className="btn btn-edit" onClick={()=>{setFormData(u); setModal('edit-member');}}><i className="fas fa-edit"></i></button>
                                <button className="btn btn-del" onClick={()=>deleteMember(u.id)}><i className="fas fa-trash"></i></button>
                            </>
                          ) : (
                            <span style={{color:'#ccc'}}>Yetki Yok</span>
                          )}
                      </td>
                    </tr>
                );
            })}
          </tbody>
      </table>
    </div>
  );
};

export default Members;
