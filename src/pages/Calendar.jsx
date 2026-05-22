import PropTypes from 'prop-types';
import React from 'react';

const Calendar = ({
  currentUser,
  selectedDay,
  setSelectedDay,
  workDays,
  setIsRangeMode,
  setFormData,
  setModal,
  deleteWorkDay,
  openAccordions,
  setOpenAccordions,
  users,
  logs,
  deleteLog,
  saveLog,
  hasManagerPermission
}) => {
  return (
    <div className="page active">
      {!selectedDay ? (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2>Resmi Çalışma Günleri</h2>
              {(currentUser.role === 'admin' || currentUser.role === 'head') && (
                  <button className="btn btn-add" onClick={()=>{ setIsRangeMode(false); setFormData({}); setModal('workday'); }}>+ Yeni Gün Ekle</button>
              )}
            </div>
            <p style={{color:'#64748b', marginTop:'10px'}}>Giriş/Çıkış veya yoklama girmek için <b>YÖNET</b> butonuna bas.</p>
            <table style={{width:'100%'}}>
              <thead><tr><th>Tarih</th><th>Açıklama</th><th>Durum</th><th>İşlem</th></tr></thead>
              <tbody>
                {workDays.map(d => (
                  <tr key={d.id}>
                    <td><b>{d.date}</b></td><td>{d.description}</td><td>Aktif</td>
                    <td>
                      <button className="btn btn-manage" onClick={()=>setSelectedDay(d)}><i className="fas fa-cog"></i> YÖNET</button>
                      {(currentUser.role === 'admin' || currentUser.role === 'head') && (
                          <button className="btn btn-del" onClick={()=>deleteWorkDay(d.id)}><i className="fas fa-trash"></i></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      ) : (
          <div>
            <button className="btn" style={{background:'#64748b',marginBottom:'20px'}} onClick={()=>setSelectedDay(null)}><i className="fas fa-arrow-left"></i> Listeye Dön</button>
            <h2>Gün Detayı: {selectedDay.date}</h2>
            <p style={{marginBottom:'20px'}}>Üyelerin saatlerini girip <b>Check</b> butonuna, gelmediyse <b>GELMEDİ</b> butonuna bas.</p>
            
            {['Aviyonik','Yazılım','Mekanik','Yönetim'].map(unit => {
                let showAccordion = false;
                if (currentUser.role === 'admin') showAccordion = true;
                else if (currentUser.role === 'head' && currentUser.unit === unit) showAccordion = true;
                else if (currentUser.managedIds && currentUser.managedIds.length > 0) {
                    const managedInUnit = users.filter(u => hasManagerPermission(currentUser, u.id) && u.unit === unit);
                    if (managedInUnit.length > 0) showAccordion = true;
                }

                if (!showAccordion) return null;
                
                const isOpen = openAccordions[unit];
                return (
                  <div key={unit} className="accordion-item">
                    <div className="accordion-header" onClick={()=>setOpenAccordions({...openAccordions, [unit]: !isOpen})}>
                        <span>{unit} Ekibi</span> <i className={`fas fa-chevron-${isOpen?'up':'down'}`}></i>
                    </div>
                    {isOpen && (
                      <div className="accordion-body open">
                          <table style={{width:'100%'}}>
                            <thead><tr><th>Üye</th><th>Giriş</th><th>Çıkış</th><th>İşlem</th></tr></thead>
                            <tbody>
                              {users.filter(u => u.unit === unit).map(u => {
                                  if (currentUser.role === 'member') {
                                      if(!hasManagerPermission(currentUser, u.id)) return null;
                                  }
                                  if (currentUser.role === 'head') {
                                      if (u.unit !== currentUser.unit && !hasManagerPermission(currentUser, u.id)) return null;
                                  }

                                  const log = logs.find(l => String(l.userId) === String(u.id) && l.date === selectedDay.date);
                                  const isAbsent = log?.status === 'absent';
                                  
                                  return (
                                    <tr key={u.id}>
                                      <td>{u.name}</td>
                                      {isAbsent ? (
                                          <td colSpan="2">
                                              <div style={{background:'#fef2f2', color:'#ef4444', padding:'8px', borderRadius:'6px', textAlign:'center', fontWeight:'bold', border:'1px solid #fee2e2'}}>
                                                  GELMEDİ
                                              </div>
                                              <input type="hidden" id={`in-${u.id}`} />
                                              <input type="hidden" id={`out-${u.id}`} />
                                          </td>
                                      ) : (
                                          <>
                                              <td>
                                                  <input type="time" id={`in-${u.id}`} 
                                                    defaultValue={log?.timeIn||""} 
                                                    className="form-input"
                                                    style={{width:'auto', padding:'5px'}} 
                                                  />
                                              </td>
                                              <td>
                                                  <input type="time" id={`out-${u.id}`} 
                                                    defaultValue={log?.timeOut||""} 
                                                    className="form-input"
                                                    style={{width:'auto', padding:'5px'}} 
                                                  />
                                              </td>
                                          </>
                                      )}
                                      
                                      <td>
                                          {!isAbsent && (
                                              <button className="btn btn-save-sm" onClick={() => {
                                                  const tIn = document.getElementById(`in-${u.id}`).value;
                                                  const tOut = document.getElementById(`out-${u.id}`).value;
                                                  
                                                  if (!tIn && !tOut) {
                                                      deleteLog(u.id, selectedDay.date);
                                                  } else {
                                                      saveLog(u.id, selectedDay.date, 'present', tIn, tOut);
                                                  }
                                              }}><i className="fas fa-check"></i></button>
                                          )}
                                          
                                          <button className={`btn btn-absent ${isAbsent?'active':''}`} onClick={() => {
                                              if(isAbsent) deleteLog(u.id, selectedDay.date);
                                              else saveLog(u.id, selectedDay.date, 'absent', null, null); 
                                          }}>
                                              {isAbsent ? <i className="fas fa-undo"></i> : <i className="fas fa-user-times"></i>}
                                              {isAbsent ? ' İPTAL' : ' GELMEDİ'}
                                          </button>
                                      </td>
                                    </tr>
                                  )
                              })}
                            </tbody>
                          </table>
                      </div>
                    )}
                  </div>
                )
            })}
          </div>
      )}
    </div>
  );
};

Calendar.propTypes = {
  currentUser: PropTypes.any,
  selectedDay: PropTypes.any,
  setSelectedDay: PropTypes.any,
  workDays: PropTypes.any,
  setIsRangeMode: PropTypes.any,
  setFormData: PropTypes.any,
  setModal: PropTypes.any,
  deleteWorkDay: PropTypes.any,
  openAccordions: PropTypes.any,
  setOpenAccordions: PropTypes.any,
  users: PropTypes.any,
  logs: PropTypes.any,
  deleteLog: PropTypes.any,
  saveLog: PropTypes.any,
  hasManagerPermission: PropTypes.any,
};

export default Calendar;
