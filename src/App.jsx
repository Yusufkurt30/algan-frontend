import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// const API_URL = "http://localhost:3000"; // Eskisi
const API_URL = "https://algan-backend.onrender.com"; // Render Linkin

function App() {
  // --- STATE TANIMLARI ---
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('algan_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('algan_active_page') || 'dashboard';
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [clock, setClock] = useState('--:--:--');
  
  const [users, setUsers] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [logs, setLogs] = useState([]);

  // UI States
  const [modal, setModal] = useState(null); 
  const [selectedDay, setSelectedDay] = useState(null); 
  const [openAccordions, setOpenAccordions] = useState({});
  const [summaryDate, setSummaryDate] = useState("");
  const [formData, setFormData] = useState({});
  const [settingsForm, setSettingsForm] = useState({ username: '', password: '', confirm: '' });
  
  // --- MODLAR ---
  const [isRangeMode, setIsRangeMode] = useState(false);

  // Yetki State
  const [permTargetUser, setPermTargetUser] = useState(null);
  const [permSelectedIds, setPermSelectedIds] = useState([]);

  // --- SAAT ve VERİ ÇEKME ---
  useEffect(() => {
    const timer = setInterval(() => { setClock(new Date().toLocaleTimeString('tr-TR')); }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
        fetchAllData();
        setSettingsForm({ username: currentUser.username, password: '', confirm: '' });
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    try {
      const [uRes, wRes, lRes] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/workdays`),
        axios.get(`${API_URL}/logs`)
      ]);
      setUsers(uRes.data);
      setWorkDays(wRes.data.sort((a,b) => new Date(a.date) - new Date(b.date)));
      setLogs(lRes.data);
    } catch (error) { console.error("Veri hatası:", error); }
  };

  const changePage = (page) => {
      setActivePage(page);
      localStorage.setItem('algan_active_page', page);
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) { alert("Bilgileri giriniz."); return; }
    try {
      const res = await axios.get(`${API_URL}/users`);
      const allUsers = res.data;
      const found = allUsers.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (found) {
        setCurrentUser(found);
        localStorage.setItem('algan_user', JSON.stringify(found));
        setUsers(allUsers);
        setSettingsForm({ username: found.username, password: '', confirm: '' });
        fetchAllData();
      } else { alert("Hatalı kullanıcı adı veya şifre!"); }
    } catch (e) { alert("Sunucu hatası!"); }
  };

  const handleLogout = () => { 
      setCurrentUser(null); 
      localStorage.removeItem('algan_user');
      localStorage.removeItem('algan_active_page');
      setLoginForm({username:'', password:''}); 
      setActivePage('dashboard'); 
  };

  // --- YARDIMCI FONKSİYONLAR ---
  const getRank = (u) => {
    if(u.role === 'admin') return 1;
    if(u.role === 'head') return u.unit === 'Aviyonik' ? 2 : u.unit === 'Yazılım' ? 3 : 4;
    return u.unit === 'Aviyonik' ? 6 : u.unit === 'Yazılım' ? 7 : 8;
  };

  const getActiveWorkDays = () => {
    return workDays.filter(day => logs.some(l => l.date === day.date));
  };

  const hasManagerPermission = (manager, targetUserId) => {
      if (!manager.managedIds) return false;
      return manager.managedIds.some(id => String(id) === String(targetUserId));
  };

  const getVisibleUsers = () => {
    if (!currentUser) return [];
    let list = users;
    if (currentUser.role === 'head') {
      list = users.filter(u => u.unit === currentUser.unit);
    } else if (currentUser.role === 'member') {
        if(currentUser.managedIds && currentUser.managedIds.length > 0) {
            return users.filter(u => hasManagerPermission(currentUser, u.id));
        }
        return [];
    }
    return list.sort((a, b) => getRank(a) - getRank(b));
  };

  const getSummaryUsers = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return users;
    if (currentUser.role === 'head') return users.filter(u => u.unit === currentUser.unit);
    return users.filter(u => u.id === currentUser.id);
  };

  // --- GRAFİK MANTIĞI ---
  const getMemberStats = (user) => {
    const activeDays = getActiveWorkDays(); 
    activeDays.sort((a,b) => new Date(a.date) - new Date(b.date));
    
    let attended = 0, totalMins = 0;
    
    const rawData = activeDays.map(d => {
      const log = logs.find(l => l.userId === user.id && l.date === d.date);
      let mins = 0, color = "#cbd5e1"; 
      let status = 'none';

      if(log) {
        status = log.status;
        if(log.status === 'present') {
          color = "#3b82f6"; 
          attended++;
          if(log.timeIn && log.timeOut) {
             mins = (new Date(`2000-01-01T${log.timeOut}`) - new Date(`2000-01-01T${log.timeIn}`)) / 60000;
             totalMins += mins;
          }
        } else if (log.status === 'absent') {
             color = "#ef4444"; 
        }
      }
      
      const hoursVal = Math.floor(mins / 60); 
      
      return { date: d.date, hoursVal, mins, color, desc: d.description };
    });

    const maxVal = Math.max(...rawData.map(d => d.hoursVal), 1);

    const chartData = rawData.map(d => ({
        ...d,
        heightPct: (d.hoursVal / maxVal) * 100 
    }));

    return { 
        attended: `${attended}/${activeDays.length}`, 
        ratio: activeDays.length ? Math.round((attended/activeDays.length)*100) : 0, 
        hours: Math.floor(totalMins/60), 
        chartData 
    };
  };

  // --- CRUD İŞLEMLERİ ---
  const saveLog = async (userId, date, status, timeIn, timeOut) => {
    try {
      const existing = logs.find(l => String(l.userId) === String(userId) && l.date === date);
      const payload = { userId, date, status, timeIn: timeIn||null, timeOut: timeOut||null };
      
      if (existing) {
          await axios.patch(`${API_URL}/logs/${existing.id}`, payload);
      } else {
          await axios.post(`${API_URL}/logs`, payload);
      }
      
      const lRes = await axios.get(`${API_URL}/logs`);
      setLogs(lRes.data);
    } catch (e) { alert("Hata oluştu."); }
  };
  
  const deleteLog = async (userId, date) => {
    const existing = logs.find(l => String(l.userId) === String(userId) && l.date === date);
    if(existing) { 
        await axios.delete(`${API_URL}/logs/${existing.id}`); 
        const lRes = await axios.get(`${API_URL}/logs`); 
        setLogs(lRes.data); 
    }
  };

  // --- KİŞİSEL BUTONLAR (GİRİŞ/ÇIKIŞ) ---
  const handleStartWork = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    
    // Sadece currentUser.id gönderiyoruz, başkasını etkilemez.
    await saveLog(currentUser.id, today, 'present', now, null);
    alert(`Çalışma başlatıldı: ${now}`);
  };

  const handleEndWork = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    
    const myLog = logs.find(l => l.userId === currentUser.id && l.date === today);
    if(myLog) {
        await saveLog(currentUser.id, today, 'present', myLog.timeIn, now);
        alert(`Gün sonlandırıldı: ${now}. Eline sağlık!`);
    } else {
        alert("Henüz giriş yapmamışsın.");
    }
  };

  // --- YENİ: GELMEYECEĞİM BUTONU ---
  const handleAbsentToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    if(confirm("Bugün çalışmaya katılamayacağını bildirmek istiyor musun?")) {
        await saveLog(currentUser.id, today, 'absent', null, null);
        alert("Bildirim yapıldı. Bugün 'GELMEDİ' olarak görüneceksin.");
    }
  };

  const addMember = async () => {
    if(!formData.name || !formData.username) return alert("Eksik bilgi");
    await axios.post(`${API_URL}/users`, { ...formData, password: '123', managedIds: [] });
    setModal(null); setFormData({}); fetchAllData(); alert("Üye eklendi. Şifre: 123");
  };
  const updateMember = async () => {
    if(!formData.name || !formData.username) return alert("Eksik bilgi");
    await axios.patch(`${API_URL}/users/${formData.id}`, formData);
    setModal(null); setFormData({}); fetchAllData(); alert("Bilgiler güncellendi.");
  };
  const deleteMember = async (id) => { if(confirm("Silmek istediğine emin misin?")) { await axios.delete(`${API_URL}/users/${id}`); fetchAllData(); } };
  
  const addWorkDay = async () => { 
    if(isRangeMode) {
        if(!formData.startDate || !formData.endDate) return alert("Tarihleri seçiniz.");
        if(new Date(formData.startDate) > new Date(formData.endDate)) return alert("Tarih hatası.");
        const datesToAdd = [];
        let skippedCount = 0;
        let currentDate = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        while(currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const exists = workDays.some(wd => wd.date === dateStr);
            if (!exists) {
                datesToAdd.push({ date: dateStr, description: formData.description || 'Genel Çalışma' });
            } else { skippedCount++; }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        if (datesToAdd.length === 0) return alert("Bu tarihler zaten ekli!");
        try {
            await axios.post(`${API_URL}/workdays`, datesToAdd);
            alert(`${datesToAdd.length} gün eklendi. (${skippedCount} atlandı)`);
        } catch (error) { alert("Hata."); }
    } else {
        if(!formData.date) return alert("Tarih seç"); 
        const exists = workDays.some(wd => wd.date === formData.date);
        if (exists) return alert("Bu tarih zaten ekli!");
        await axios.post(`${API_URL}/workdays`, formData); 
    }
    setModal(null); setFormData({}); setIsRangeMode(false); fetchAllData(); 
  };

  const deleteWorkDay = async (id) => { if(confirm("Silmek istediğine emin misin?")) { await axios.delete(`${API_URL}/workdays/${id}`); fetchAllData(); } };

  const openPermissionModal = (user) => { setPermTargetUser(user); setPermSelectedIds(user.managedIds || []); setModal('permission'); };
  const togglePermission = (id) => { 
      const strId = String(id);
      setPermSelectedIds(prev => {
          const prevStr = prev.map(String);
          return prevStr.includes(strId) ? prevStr.filter(p=>p!==strId) : [...prevStr, strId];
      }); 
  };
  const savePermissions = async () => { if(!permTargetUser) return; await axios.patch(`${API_URL}/users/${permTargetUser.id}`, { managedIds: permSelectedIds }); setModal(null); fetchAllData(); alert("Yetkiler kaydedildi."); };

  const updateProfile = async () => {
    if(!settingsForm.username) return alert("Kullanıcı adı boş olamaz.");
    const exists = users.find(u => u.username === settingsForm.username && u.id !== currentUser.id);
    if(exists) return alert("Kullanıcı adı dolu.");
    let newPassword = currentUser.password;
    if(settingsForm.password) {
        if(settingsForm.password !== settingsForm.confirm) return alert("Şifreler uyuşmuyor.");
        newPassword = settingsForm.password;
    }
    try {
        await axios.patch(`${API_URL}/users/${currentUser.id}`, { username: settingsForm.username, password: newPassword });
        const updatedUser = { ...currentUser, username: settingsForm.username, password: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('algan_user', JSON.stringify(updatedUser));
        alert("Profil güncellendi!");
    } catch (e) { alert("Hata."); }
  };

  const showPicker = (id) => { const el = document.getElementById(id); if(el && el.showPicker) el.showPicker(); else if(el) el.focus(); };

  // --- UI RENDER ---
  if (!currentUser) {
    return (
      <div id="login-section">
        <div className="login-card">
          <img src="/logo.png" alt="Algan Logo" className="login-logo" />
          <h3>ALGAN TEAM</h3>
          <input type="text" className="form-input" placeholder="Kullanıcı Adı" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})} />
          <input type="password" className="form-input" placeholder="Şifre" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} />
          <button className="btn-login" onClick={handleLogin}>Sisteme Gir</button>
        </div>
      </div>
    );
  }

  const myStats = getMemberStats(currentUser);
  const visibleMembers = getVisibleUsers();
  const summaryUsers = getSummaryUsers();
  const activeWorkDays = getActiveWorkDays(); 
  
  const todayDate = new Date().toISOString().split('T')[0];
  const myTodayLog = logs.find(l => l.userId === currentUser.id && l.date === todayDate);

  let memberPageDesc = "Kaptan olarak tüm üyeleri yönetebilirsiniz.";
  if (currentUser.role === 'head') memberPageDesc = `Sayın Başkan, sadece ${currentUser.unit} birimindeki üyeleri yönetebilirsiniz.`;
  if (currentUser.role === 'member') memberPageDesc = `Yönetim yetkiniz olan üyeler:`;

  return (
    <div id="app-section">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Algan Logo" />
          <div className="live-clock">{clock}</div>
        </div>
        <ul className="menu">
          <li onClick={()=>changePage('dashboard')} className={activePage==='dashboard'?'active':''}><i className="fas fa-home"></i> Ana Durum</li>
          
          {(currentUser.role === 'admin' || currentUser.role === 'head' || (currentUser.managedIds && currentUser.managedIds.length > 0)) && (
             <li onClick={()=>changePage('calendar')} className={activePage==='calendar'?'active':''}><i className="fas fa-calendar-alt"></i> Gün Yönetimi</li>
          )}

          <li onClick={()=>changePage('summary')} className={activePage==='summary'?'active':''}><i className="fas fa-clipboard-list"></i> Günlük Özet</li>
          
          {(currentUser.role === 'admin' || currentUser.role === 'head') && (
             <li onClick={()=>changePage('logs')} className={activePage==='logs'?'active':''}><i className="fas fa-chart-line"></i> Genel Performans</li>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'head') && (
             <li onClick={()=>changePage('members')} className={activePage==='members'?'active':''}><i className="fas fa-users"></i> Üyeler & Rapor</li>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'head') && (
            <li onClick={()=>changePage('permissions')} className={activePage==='permissions'?'active':''}><i className="fas fa-user-shield"></i> Yetkiler</li>
          )}
          
          <li onClick={()=>changePage('settings')} className={activePage==='settings'?'active':''}><i className="fas fa-cog"></i> Ayarlar</li>
          <li onClick={handleLogout} style={{color:'#f87171'}}><i className="fas fa-power-off"></i> Çıkış</li>
        </ul>
        <div className="sidebar-footer">
          <h4>{currentUser.name}</h4>
          <p>{currentUser.unit}</p>
        </div>
      </div>

      <div className="main-content">
        
        {/* DASHBOARD */}
        {activePage === 'dashboard' && (
          <div className="page active">
            <h2>Hoşgeldin, <span>{currentUser.name}</span></h2>
            
            {/* KİŞİSEL GİRİŞ/ÇIKIŞ BUTONLARI */}
            <div style={{background:'white', padding:'20px', borderRadius:'10px', marginBottom:'20px', display:'flex', gap:'15px', alignItems:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <div style={{flex:1}}>
                    <h3 style={{margin:'0 0 5px 0'}}>Hızlı İşlem</h3>
                    <p style={{margin:0, color:'#64748b'}}>Atölyeye geldiğinde başlat, çıkarken bitir.</p>
                </div>
                
                {myTodayLog?.status === 'absent' ? (
                    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                        <span style={{color:'#ef4444', fontWeight:'bold', marginBottom:'5px'}}>BUGÜN GELMEYECEĞİNİ BİLDİRDİN</span>
                        <button className="btn-login" style={{width:'auto', padding:'12px 25px', background:'#22c55e'}} onClick={handleStartWork}>
                            <i className="fas fa-play"></i> Fikrini Değiştir ve Başlat
                        </button>
                    </div>
                ) : (myTodayLog && !myTodayLog.timeOut) ? (
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <span style={{color:'#22c55e', fontWeight:'bold'}}>
                            <i className="fas fa-clock"></i> Giriş: {myTodayLog.timeIn}
                        </span>
                        <button className="btn-login" style={{width:'auto', padding:'12px 25px', background:'#ef4444'}} onClick={handleEndWork}>
                            <i className="fas fa-stop"></i> Günü Bitir
                        </button>
                    </div>
                ) : (
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        {myTodayLog && (
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
                )}
            </div>

            <div className="stats-grid">
               <div className="stat-card"> <div className="stat-icon"><i className="fas fa-calendar-check"></i></div> <div><h4>Katılım Durumu</h4><p>{myStats.attended} Gün</p></div> </div>
               <div className="stat-card"> <div className="stat-icon" style={{background:'#e0f2fe',color:'#3b82f6'}}><i className="fas fa-chart-pie"></i></div> <div><h4>Katılım Oranı</h4><p>%{myStats.ratio}</p></div> </div>
               <div className="stat-card"> <div className="stat-icon" style={{background:'#dcfce7',color:'#16a34a'}}><i className="fas fa-clock"></i></div> <div><h4>Toplam Süre</h4><p>{myStats.hours} Saat</p></div> </div>
            </div>
            
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
                        {/* --- DÜZELTME BURADA: SADECE BUGÜNÜ SAY --- */}
                        <div><h4>Şu An İçeride</h4><p>{logs.filter(l => l.date === todayDate && l.status === 'present' && !l.timeOut).length} Kişi</p></div> 
                    </div>
                    <div className="stat-card" style={{background:'#f8fafc'}}> 
                         <div className="stat-icon" style={{background:'#dcfce7', color:'#16a34a'}}><i className="fas fa-calendar-check"></i></div> 
                         <div><h4>Tanımlı İş Günü</h4><p>{workDays.length} Gün</p></div> 
                    </div>
                </div>
            )}
          </div>
        )}

        {/* CALENDAR */}
        {activePage === 'calendar' && (
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

                                      const log = logs.find(l => l.userId === u.id && l.date === selectedDay.date);
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
        )}

        {/* SUMMARY */}
        {activePage === 'summary' && (
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
                                    const log = logs.find(l => l.userId === u.id && l.date === summaryDate);
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
                                    <div className="accordion-header" onClick={()=>setOpenAccordions({...openAccordions, ['sum_'+unit]: !isOpen})}>
                                        <span>{unit}</span> <i className={`fas fa-chevron-${isOpen?'up':'down'}`}></i>
                                    </div>
                                    {isOpen && (
                                        <div className="accordion-body open">
                                            <table style={{width:'100%'}}>
                                                <thead><tr><th>İsim</th><th>Durum</th><th>Süre</th></tr></thead>
                                                <tbody>
                                                    {unitUsers.map(u => {
                                                        const log = logs.find(l => l.userId === u.id && l.date === summaryDate);
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
        )}

        {/* LOGS */}
        {activePage === 'logs' && (
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
                      <div className="accordion-header" onClick={()=>setOpenAccordions({...openAccordions, [unit+'_perf']:!isOpen})}>
                         <span>{unit} Birimi</span> <i className={`fas fa-chevron-${isOpen?'up':'down'}`}></i>
                      </div>
                      {isOpen && (
                         <div className="accordion-body open">
                            <table style={{width:'100%'}}>
                               <thead><tr><th>İsim</th><th>Katılım</th><th>Oran</th><th>Toplam Süre</th></tr></thead>
                               <tbody>
                                  {users.filter(u => u.unit === unit).sort((a,b)=>getRank(a)-getRank(b)).map(u => {
                                      const stats = getMemberStats(u);
                                      let rateColor = stats.ratio >= 80 ? 'green' : (stats.ratio < 50 ? 'red' : 'black');
                                      return <tr key={u.id}><td>{u.name}</td><td>{stats.attended}</td><td style={{color:rateColor, fontWeight:'bold'}}>%{stats.ratio}</td><td>{stats.hours} Saat</td></tr>
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

        {/* MEMBERS */}
        {activePage === 'members' && (
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
                        
                        return (
                           <tr key={u.id}>
                              <td>{u.name}</td>
                              <td>{u.username}</td>
                              <td>{showPass ? u.password : '***'}</td>
                              <td>{u.unit}</td>
                              <td>{u.role === 'head' ? 'Birim Başkanı' : (u.role === 'admin' ? 'Kaptan' : 'Üye')}</td>
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
        )}

        {/* PERMISSIONS (YETKİLER) */}
        {activePage === 'permissions' && (
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
        )}

        {/* SETTINGS */}
        {activePage === 'settings' && (
            <div className="page active">
                <h2>Hesap Ayarları</h2>
                <div style={{background:'white', padding:'30px', borderRadius:'10px', maxWidth:'500px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                    <label><b>Kullanıcı Adı</b></label>
                    <input type="text" className="form-input" 
                        value={settingsForm.username} 
                        onChange={e => setSettingsForm({...settingsForm, username: e.target.value})} 
                        placeholder="Yeni kullanıcı adınız"
                    />
                    <small style={{color:'#64748b', display:'block', marginBottom:'15px'}}>
                        Kullanıcı adını değiştirirsen bir sonraki girişte yenisini kullanmalısın.
                    </small>
                    
                    <label><b>Yeni Şifre</b></label>
                    <input type="password" className="form-input" 
                        value={settingsForm.password} 
                        onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} 
                        placeholder="Yeni şifreniz"
                    />
                    
                    <label><b>Şifre Tekrar</b></label>
                    <input type="password" className="form-input" 
                        value={settingsForm.confirm} 
                        onChange={e => setSettingsForm({...settingsForm, confirm: e.target.value})} 
                        placeholder="Şifrenizi doğrulayın"
                    />
                    
                    <button className="btn-login" onClick={updateProfile} style={{marginTop:'20px'}}>Güncelle ve Kaydet</button>
                </div>
            </div>
        )}

      </div>

      {/* --- MODALLAR --- */}
      {modal === 'member' && (
         <div className="modal-overlay" style={{display:'flex'}}>
            <div className="modal-box">
               <span className="close-modal" onClick={()=>setModal(null)}>&times;</span>
               <h3>Yeni Üye Ekle</h3>
               <label>Ad Soyad</label> <input type="text" className="form-input" onChange={e=>setFormData({...formData, name:e.target.value})} />
               <label>Kullanıcı Adı</label> <input type="text" className="form-input" onChange={e=>setFormData({...formData, username:e.target.value})} />
               <label>Birim</label> 
               <select className="form-input" onChange={e=>setFormData({...formData, unit:e.target.value})} defaultValue="Aviyonik">
                  <option value="Aviyonik">Aviyonik</option><option value="Yazılım">Yazılım</option><option value="Mekanik">Mekanik</option><option value="Yönetim">Yönetim</option>
               </select>
               <label>Rol</label>
               <select className="form-input" onChange={e=>setFormData({...formData, role:e.target.value})} defaultValue="member">
                  <option value="member">Üye</option><option value="head">Birim Başkanı</option><option value="admin">Kaptan</option>
               </select>
               <button className="btn-login" onClick={addMember} style={{marginTop:'15px'}}>Üyeyi Kaydet</button>
            </div>
         </div>
      )}

      {modal === 'edit-member' && (
         <div className="modal-overlay" style={{display:'flex'}}>
            <div className="modal-box">
               <span className="close-modal" onClick={()=>setModal(null)}>&times;</span>
               <h3>Üye Düzenle</h3>
               <label>Ad Soyad</label> <input type="text" className="form-input" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} />
               <label>Kullanıcı Adı</label> <input type="text" className="form-input" value={formData.username || ''} onChange={e=>setFormData({...formData, username:e.target.value})} />
               <label>Birim</label> 
               <select className="form-input" value={formData.unit || 'Aviyonik'} onChange={e=>setFormData({...formData, unit:e.target.value})}>
                  <option value="Aviyonik">Aviyonik</option><option value="Yazılım">Yazılım</option><option value="Mekanik">Mekanik</option><option value="Yönetim">Yönetim</option>
               </select>
               <label>Rol</label>
               <select className="form-input" value={formData.role || 'member'} onChange={e=>setFormData({...formData, role:e.target.value})}>
                  <option value="member">Üye</option><option value="head">Birim Başkanı</option><option value="admin">Kaptan</option>
               </select>
               <button className="btn-login" onClick={updateMember} style={{marginTop:'15px', background:'#f59e0b'}}>Güncelle</button>
            </div>
         </div>
      )}

      {modal === 'workday' && (
         <div className="modal-overlay" style={{display:'flex'}}>
            <div className="modal-box">
               <span className="close-modal" onClick={()=>setModal(null)}>&times;</span>
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
            <span className="close-modal" onClick={()=>setModal(null)}>&times;</span>
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
    </div>
  );
}

export default App;