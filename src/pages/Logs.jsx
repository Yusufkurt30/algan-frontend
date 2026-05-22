import PropTypes from 'prop-types';
import React from 'react';

const Logs = ({
  currentUser,
  openAccordions,
  setOpenAccordions,
  users,
  getRank,
  getMemberStats
}) => {
  return (
    <div className="page active">
      <h2>Genel Takım Performansı</h2>
      <div style={{background:'#e0f2fe', color:'#0369a1', padding:'15px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #bae6fd'}}>
        <i className="fas fa-info-circle"></i> Sadece işlem yapılan günler üzerinden hesaplanmaktadır.
      </div>
      {['Yönetim','Aviyonik','Yazılım','Mekanik'].map(unit => {
        if(currentUser.role !== 'admin' && currentUser.unit !== unit) return null;

        const isOpen = openAccordions[unit+'_perf'];
        return (
            <div key={unit} className="accordion-item">
              <div role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} className="accordion-header" onClick={()=>setOpenAccordions({...openAccordions, [unit+'_perf']:!isOpen})}>
                  <span>{unit} Birimi</span> <i className={`fas fa-chevron-${isOpen?'up':'down'}`}></i>
              </div>
              {isOpen && (
                  <div className="accordion-body open">
                    <table style={{width:'100%'}}>
                        <thead><tr><th>İsim</th><th>Katılım</th><th>Oran</th><th>Toplam Süre</th></tr></thead>
                        <tbody>
                          {users.filter(u => u.unit === unit).sort((a,b)=>getRank(a)-getRank(b)).map(u => {
                              const stats = getMemberStats(u);
                              let rateColor = 'black';
                              if (stats.ratio >= 80) rateColor = 'green';
                              else if (stats.ratio < 50) rateColor = 'red';
                              
                              return (
                                <tr key={u.id}>
                                  <td>{u.name}</td>
                                  <td>{stats.attended}</td>
                                  <td style={{color:rateColor, fontWeight:'bold'}}>%{stats.ratio}</td>
                                  <td>{stats.hours} Saat</td>
                                </tr>
                              );
                          })}
                        </tbody>
                    </table>
                  </div>
              )}
            </div>
        )
      })}
    </div>
  );
};

Logs.propTypes = {
  currentUser: PropTypes.any,
  openAccordions: PropTypes.any,
  setOpenAccordions: PropTypes.any,
  users: PropTypes.any,
  getRank: PropTypes.any,
  getMemberStats: PropTypes.any,
};

export default Logs;
