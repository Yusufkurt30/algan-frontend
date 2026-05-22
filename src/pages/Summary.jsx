import PropTypes from 'prop-types';
import React from 'react';

const Summary = ({
  summaryDate,
  setSummaryDate,
  activeWorkDays,
  currentUser,
  getSummaryUsers,
  logs,
  users,
  hasManagerPermission,
  openAccordions,
  setOpenAccordions
}) => {
  return (
    <div className="page active">
      <h2>Günlük Yoklama Özeti</h2>
      <div style={{background:'white', padding:'15px', borderRadius:'8px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px'}}>
          <label><b>Tarih Seç:</b></label>
          <select className="form-input" onChange={(e)=>setSummaryDate(e.target.value)} value={summaryDate} style={{width:'auto', margin:0}}>
            <option value="">İşlem yapılan bir gün seçin...</option>
            {activeWorkDays.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(d => (
                <option key={d.id} value={d.date}>{new Date(d.date).toLocaleDateString('tr-TR')} - {d.description}</option>
            ))}
          </select>
      </div>
      
      {summaryDate && (
          <div>
            {currentUser.role === 'member' ? (
                  <table style={{width:'100%'}}>
                      <thead><tr><th>İsim</th><th>Durum</th><th>Süre</th></tr></thead>
                      <tbody>
                        {getSummaryUsers().map(u => {
                            const log = logs.find(l => String(l.userId) === String(u.id) && l.date === summaryDate);
                            let status = <span style={{color:'#ccc'}}>Veri Yok</span>, dur = "-";
                            if(log) {
                                if(log.status === 'absent') status = <span className="status-absent">GELMEDİ</span>;
                                else {
                                    status = <span className="status-came">GELDİ</span>;
                                    if(log.timeIn && log.timeOut) {
                                        const diff = (new Date(`2000-01-01T${log.timeOut}`) - new Date(`2000-01-01T${log.timeIn}`))/60000;
                                        dur = `${Math.floor(diff/60)}s ${diff%60}dk`;
                                    } else dur = "İçeride";
                                }
                            }
                            return <tr key={u.id}><td>{u.name}</td><td>{status}</td><td>{dur}</td></tr>
                        })}
                      </tbody>
                  </table>
            ) : (
                ['Aviyonik','Yazılım','Mekanik','Yönetim'].map(unit => {
                    if(currentUser.role === 'head' && currentUser.unit !== unit && !users.some(u=> u.unit === unit && hasManagerPermission(currentUser, u.id))) return null;

                    const unitUsers = users.filter(u => u.unit === unit);
                    if(unitUsers.length === 0) return null;

                    const isOpen = openAccordions['sum_'+unit];
                    return (
                        <div key={unit} className="accordion-item">
                            <div role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} className="accordion-header" onClick={()=>setOpenAccordions({...openAccordions, ['sum_'+unit]: !isOpen})}>
                                <span>{unit}</span> <i className={`fas fa-chevron-${isOpen?'up':'down'}`}></i>
                            </div>
                            {isOpen && (
                                <div className="accordion-body open">
                                    <table style={{width:'100%'}}>
                                        <thead><tr><th>İsim</th><th>Durum</th><th>Süre</th></tr></thead>
                                        <tbody>
                                            {unitUsers.map(u => {
                                                const log = logs.find(l => String(l.userId) === String(u.id) && l.date === summaryDate);
                                                let status = <span style={{color:'#ccc'}}>Veri Yok</span>, dur = "-";
                                                if(log) {
                                                    if(log.status === 'absent') status = <span className="status-absent">GELMEDİ</span>;
                                                    else {
                                                        status = <span className="status-came">GELDİ</span>;
                                                        if(log.timeIn && log.timeOut) {
                                                            const diff = (new Date(`2000-01-01T${log.timeOut}`) - new Date(`2000-01-01T${log.timeIn}`))/60000;
                                                            dur = `${Math.floor(diff/60)}s ${diff%60}dk`;
                                                        } else dur = "İçeride";
                                                    }
                                                }
                                                return <tr key={u.id}><td>{u.name}</td><td>{status}</td><td>{dur}</td></tr>
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )
                })
            )}
          </div>
      )}
    </div>
  );
};

Summary.propTypes = {
  summaryDate: PropTypes.any,
  setSummaryDate: PropTypes.any,
  activeWorkDays: PropTypes.any,
  currentUser: PropTypes.any,
  getSummaryUsers: PropTypes.any,
  logs: PropTypes.any,
  users: PropTypes.any,
  hasManagerPermission: PropTypes.any,
  openAccordions: PropTypes.any,
  setOpenAccordions: PropTypes.any,
};

export default Summary;
