import PropTypes from 'prop-types';
import React from 'react';

const Dashboard = ({
  currentUser,
  myTodayLog,
  isCurrentlyWorking,
  handleStartWork,
  handleEndWork,
  handleAbsentToday,
  myStats,
  handleAiAnalysis,
  isAiLoading,
  aiReport,
  activeWorkDays,
  logs,
  todayDate,
  workDays
}) => {
  return (
    <div className="page active">
      <h2>Hoşgeldin, <span>{currentUser.name}</span></h2>
      
      {/* KİŞİSEL GİRİŞ/ÇIKIŞ BUTONLARI */}
      <div style={{background:'white', padding:'20px', borderRadius:'10px', marginBottom:'20px', display:'flex', gap:'15px', alignItems:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          <div style={{flex:1}}>
              <h3 style={{margin:'0 0 5px 0'}}>Hızlı İşlem</h3>
              <p style={{margin:0, color:'#64748b'}}>Atölyeye geldiğinde başlat, çıkarken bitir.</p>
          </div>
          
          {(() => {
              if (myTodayLog?.status === 'absent') {
                  return (
                      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                          <span style={{color:'#ef4444', fontWeight:'bold', marginBottom:'5px'}}>BUGÜN GELMEYECEĞİNİ BİLDİRDİN</span>
                          <button className="btn-login" style={{width:'auto', padding:'12px 25px', background:'#22c55e'}} onClick={handleStartWork}>
                              <i className="fas fa-play"></i> Fikrini Değiştir ve Başlat
                          </button>
                      </div>
                  );
              } else if (isCurrentlyWorking) {
                  return (
                      <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                          <span style={{color:'#22c55e', fontWeight:'bold'}}>
                              <i className="fas fa-clock"></i> Giriş: {myTodayLog.timeIn}
                          </span>
                          <button className="btn-login" style={{width:'auto', padding:'12px 25px', background:'#ef4444'}} onClick={handleEndWork}>
                              <i className="fas fa-stop"></i> Günü Bitir
                          </button>
                      </div>
                  );
              } else {
                  return (
                      <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                          {myTodayLog && myTodayLog.timeOut && (
                              <small style={{color:'#64748b', fontSize:'0.8rem', textAlign:'right'}}>
                                  <i className="fas fa-info-circle"></i> Tekrar başlatırsan<br/>önceki silinir.
                              </small>
                          )}
                          <button className="btn-login" style={{width:'auto', padding:'12px 25px', background:'#22c55e'}} onClick={handleStartWork}>
                              <i className="fas fa-play"></i> {myTodayLog ? 'Tekrar Başlat' : 'Çalışmayı Başlat'}
                          </button>
                          
                          <button className="btn-login" style={{width:'auto', padding:'12px 25px', background:'#94a3b8'}} onClick={handleAbsentToday}>
                              <i className="fas fa-user-times"></i> Gelmeyeceğim
                          </button>
                      </div>
                  );
              }
          })()}
      </div>

      <div className="stats-grid">
          <div className="stat-card"> <div className="stat-icon"><i className="fas fa-calendar-check"></i></div> <div><h4>Katılım Durumu</h4><p>{myStats.attended} Gün</p></div> </div>
          <div className="stat-card"> <div className="stat-icon" style={{background:'#e0f2fe',color:'#3b82f6'}}><i className="fas fa-chart-pie"></i></div> <div><h4>Katılım Oranı</h4><p>%{myStats.ratio}</p></div> </div>
          <div className="stat-card"> <div className="stat-icon" style={{background:'#dcfce7',color:'#16a34a'}}><i className="fas fa-clock"></i></div> <div><h4>Toplam Süre</h4><p>{myStats.hours} Saat</p></div> </div>
      </div>

      {/* AI Butonu ve Raporu (Sadece Yönetici ve Liderler) */}
      {(currentUser.role === 'admin' || currentUser.role === 'head') && (
        <>
          <div style={{ margin: '30px 0', textAlign: 'center' }}>
            <button 
              onClick={handleAiAnalysis} 
              disabled={isAiLoading}
              style={{
                backgroundColor: '#1a365d',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '8px',
                cursor: isAiLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {isAiLoading ? '⏳ Yapay Zeka Verileri Analiz Ediyor...' : '🤖 AI Performans Analizi Çıkar'}
            </button>
          </div>

          {aiReport && (
            <div style={{
              backgroundColor: '#f7fafc',
              borderLeft: '5px solid #2b6cb0',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#2d3748', marginTop: 0 }}>📊 Yönetimsel AI Raporu</h3>
              <p style={{ whiteSpace: 'pre-wrap', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                {aiReport}
              </p>
            </div>
          )}
        </>
      )}
      
      <div className="chart-wrapper">
          <h3 style={{marginTop:0, marginBottom:'20px', paddingLeft:'10px'}}>Bireysel Çalışma Grafiği ({activeWorkDays.length} Aktif Gün)</h3>
          <div className="simple-chart">
            {myStats.chartData.length === 0 && <p style={{color:'#999', width:'100%', textAlign:'center', paddingTop:'50px'}}>Henüz veri yok.</p>}
            {myStats.chartData.map((d,i) => (
              <div key={i} className="chart-bar-container">
                  <div className="chart-val">{d.hoursVal}s</div>
                  <div className="chart-bar" style={{height:`${Math.max(2, d.heightPct)}%`, background:d.color}} title={d.desc}></div>
                  <div className="chart-label">{new Date(d.date).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</div>
              </div>
            ))}
          </div>
      </div>

      {(currentUser.role === 'admin' || currentUser.role === 'head') && (
          <div className="stats-grid" style={{marginTop:'30px'}}>
              <div className="stat-card" style={{background:'#f8fafc'}}> 
                  <div className="stat-icon"><i className="fas fa-user-check"></i></div> 
                  <div><h4>Şu An İçeride</h4><p>{logs.filter(l => l.date === todayDate && l.status === 'present' && !l.timeOut).length} Kişi</p></div> 
              </div>
              <div className="stat-card" style={{background:'#f8fafc'}}> 
                    <div className="stat-icon" style={{background:'#dcfce7', color:'#16a34a'}}><i className="fas fa-calendar-check"></i></div> 
                    <div><h4>Tanımlı İş Günü</h4><p>{workDays.length} Gün</p></div> 
              </div>
          </div>
      )}
    </div>
  );
};

Dashboard.propTypes = {
  currentUser: PropTypes.any,
  myTodayLog: PropTypes.any,
  isCurrentlyWorking: PropTypes.any,
  handleStartWork: PropTypes.any,
  handleEndWork: PropTypes.any,
  handleAbsentToday: PropTypes.any,
  myStats: PropTypes.any,
  handleAiAnalysis: PropTypes.any,
  isAiLoading: PropTypes.any,
  aiReport: PropTypes.any,
  activeWorkDays: PropTypes.any,
  logs: PropTypes.any,
  todayDate: PropTypes.any,
  workDays: PropTypes.any,
};

export default Dashboard;
