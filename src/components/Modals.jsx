import PropTypes from 'prop-types';
import React from 'react';

const Modals = ({
  modal,
  setModal,
  formData,
  setFormData,
  addMember,
  updateMember,
  isRangeMode,
  setIsRangeMode,
  showPicker,
  addWorkDay,
  permTargetUser,
  users,
  currentUser,
  getRank,
  permSelectedIds,
  togglePermission,
  savePermissions
}) => {
  return (
    <>
      {modal === 'member' && (
         <div className="modal-overlay" style={{display:'flex'}}>
            <div className="modal-box">
               <span role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} className="close-modal" onClick={()=>setModal(null)}>&times;</span>
               <h3>Yeni Üye Ekle</h3>
               <label>Ad Soyad <input type="text" className="form-input" onChange={e=>setFormData({...formData, name:e.target.value})} /></label>
               <label>Kullanıcı Adı <input type="text" className="form-input" onChange={e=>setFormData({...formData, username:e.target.value})} /></label>
               <label>Birim
               <select className="form-input" onChange={e=>setFormData({...formData, unit:e.target.value})} defaultValue="Aviyonik">
                  <option value="Aviyonik">Aviyonik</option><option value="Yazılım">Yazılım</option><option value="Mekanik">Mekanik</option><option value="Yönetim">Yönetim</option>
               </select></label>
               <label>Rol
               <select className="form-input" onChange={e=>setFormData({...formData, role:e.target.value})} defaultValue="member">
                  <option value="member">Üye</option><option value="head">Birim Başkanı</option><option value="admin">Kaptan</option>
               </select></label>
               <button className="btn-login" onClick={addMember} style={{marginTop:'15px'}}>Üyeyi Kaydet</button>
            </div>
         </div>
      )}

      {modal === 'edit-member' && (
         <div className="modal-overlay" style={{display:'flex'}}>
            <div className="modal-box">
               <span role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} className="close-modal" onClick={()=>setModal(null)}>&times;</span>
               <h3>Üye Düzenle</h3>
               <label>Ad Soyad <input type="text" className="form-input" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} /></label>
               <label>Kullanıcı Adı <input type="text" className="form-input" value={formData.username || ''} onChange={e=>setFormData({...formData, username:e.target.value})} /></label>
               <label>Birim 
               <select className="form-input" value={formData.unit || 'Aviyonik'} onChange={e=>setFormData({...formData, unit:e.target.value})}>
                  <option value="Aviyonik">Aviyonik</option><option value="Yazılım">Yazılım</option><option value="Mekanik">Mekanik</option><option value="Yönetim">Yönetim</option>
               </select></label>
               <label>Rol
               <select className="form-input" value={formData.role || 'member'} onChange={e=>setFormData({...formData, role:e.target.value})}>
                  <option value="member">Üye</option><option value="head">Birim Başkanı</option><option value="admin">Kaptan</option>
               </select></label>
               <button className="btn-login" onClick={updateMember} style={{marginTop:'15px', background:'#f59e0b'}}>Güncelle</button>
            </div>
         </div>
      )}

      {modal === 'workday' && (
         <div className="modal-overlay" style={{display:'flex'}}>
            <div className="modal-box">
               <span role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} className="close-modal" onClick={()=>setModal(null)}>&times;</span>
               <h3>Yeni Çalışma Günü</h3>
               
               <label style={{display:'flex', alignItems:'center', gap:'10px', margin:'10px 0', cursor:'pointer', fontWeight:'bold', color:'var(--accent)'}}>
                   <input type="checkbox" checked={isRangeMode} onChange={(e)=>setIsRangeMode(e.target.checked)} style={{transform:'scale(1.2)'}} />
                   Tarih Aralığı Ekle (Toplu)
               </label>

               {isRangeMode ? (
                   <>
                       <label>Başlangıç Tarihi</label> 
                       <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                           <input type="date" id="range-start" className="form-input" onChange={e=>setFormData({...formData, startDate:e.target.value})} />
                           <button className="btn btn-manage" style={{height:'45px', margin:'0'}} onClick={()=>showPicker('range-start')}>
                                <i className="fas fa-calendar-alt"></i>
                           </button>
                       </div>
                       
                       <label>Bitiş Tarihi</label> 
                       <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                           <input type="date" id="range-end" className="form-input" onChange={e=>setFormData({...formData, endDate:e.target.value})} />
                           <button className="btn btn-manage" style={{height:'45px', margin:'0'}} onClick={()=>showPicker('range-end')}>
                                <i className="fas fa-calendar-alt"></i>
                           </button>
                       </div>
                   </>
               ) : (
                   <>
                       <label>Tarih Seç</label> 
                       <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                           <input type="date" id="single-date" className="form-input" onChange={e=>setFormData({...formData, date:e.target.value})} />
                           <button className="btn btn-manage" style={{height:'45px', margin:'0'}} onClick={()=>showPicker('single-date')}>
                                <i className="fas fa-calendar-alt"></i>
                           </button>
                       </div>
                   </>
               )}

               <label>Açıklama</label> 
               <input type="text" className="form-input" placeholder={isRangeMode ? "Örn: Yarıyıl Tatili (Tüm günler için)" : "Örn: Ara Tatil 1. Gün"} onChange={e=>setFormData({...formData, description:e.target.value})} />
               
               <button className="btn-login" onClick={addWorkDay} style={{marginTop:'15px'}}>
                   {isRangeMode ? 'Aralığı Takvime Ekle' : 'Takvime Ekle'}
               </button>
            </div>
         </div>
      )}

      {modal === 'permission' && permTargetUser && (
        <div className="modal-overlay" style={{display:'flex'}}>
          <div className="modal-box" style={{width:'500px'}}>
            <span role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} className="close-modal" onClick={()=>setModal(null)}>&times;</span>
            <h3>{permTargetUser.name} için Yetki Tanımla</h3>
            <p style={{fontSize:'0.9em', color:'#666'}}>Seçilen kişileri bu üye yönetebilecek.</p>
            <div style={{maxHeight:'350px', overflowY:'auto', border:'1px solid #eee', padding:'10px', marginTop:'15px', borderRadius:'8px'}}>
              {users.filter(u => u.id !== currentUser.id && (currentUser.role === 'admin' || u.unit === currentUser.unit))
                .sort((a,b)=>getRank(a)-getRank(b))
                .map(sub => (
                  <div key={sub.id} style={{padding:'8px', borderBottom:'1px solid #f0f0f0'}}>
                    <label style={{cursor:'pointer', display:'flex', alignItems:'center'}}>
                      <input type="checkbox" checked={permSelectedIds.includes(String(sub.id))} onChange={()=>togglePermission(sub.id)} style={{marginRight:'10px', transform:'scale(1.2)'}} />
                      <span>{sub.name} <small style={{color:'#999'}}>({sub.unit})</small></span>
                    </label>
                  </div>
                ))}
              {users.filter(u => u.id !== currentUser.id && (currentUser.role === 'admin' || u.unit === currentUser.unit)).length === 0 && (
                  <p style={{color:'#999'}}>Atanabilecek üye bulunamadı.</p>
              )}
            </div>
            <button className="btn-login" onClick={savePermissions} style={{marginTop:'15px'}}>Yetkileri Kaydet</button>
          </div>
        </div>
      )}
    </>
  );
};

Modals.propTypes = {
  modal: PropTypes.any,
  setModal: PropTypes.any,
  formData: PropTypes.any,
  setFormData: PropTypes.any,
  addMember: PropTypes.any,
  updateMember: PropTypes.any,
  isRangeMode: PropTypes.any,
  setIsRangeMode: PropTypes.any,
  showPicker: PropTypes.any,
  addWorkDay: PropTypes.any,
  permTargetUser: PropTypes.any,
  users: PropTypes.any,
  currentUser: PropTypes.any,
  getRank: PropTypes.any,
  permSelectedIds: PropTypes.any,
  togglePermission: PropTypes.any,
  savePermissions: PropTypes.any,
};

export default Modals;
