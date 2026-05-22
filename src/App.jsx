import { useState, useEffect } from 'react';
import './App.css';

// API Service
import { authService, userService, workdayService, logService, aiService } from './services/api';

// Components
import Sidebar from './components/Sidebar';
import Modals from './components/Modals';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Summary from './pages/Summary';
import Logs from './pages/Logs';
import Members from './pages/Members';
import Permissions from './pages/Permissions';
import Settings from './pages/Settings';

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
  
  // --- YAPAY ZEKA STATES ---
  const [aiReport, setAiReport] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettingsForm({ username: currentUser.username, password: '', confirm: '' });
        
        // Admin bir şeyi değiştirirse anında yansıması için 5 saniyede bir kontrol et
        const interval = setInterval(fetchAllData, 5000);
        return () => clearInterval(interval);
    }
  }, [currentUser]);

  async function fetchAllData() {
    try {
      const [uRes, wRes, lRes] = await Promise.all([
        userService.getAll(),
        workdayService.getAll(),
        logService.getAll()
      ]);
      setUsers(uRes);
      setWorkDays(wRes.sort((a,b) => new Date(a.date) - new Date(b.date)));
      setLogs(lRes);
    } catch (error) { console.error("Veri hatası:", error); }
  }

  const changePage = (page) => {
      setActivePage(page);
      localStorage.setItem('algan_active_page', page);
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) { alert("Bilgileri giriniz."); return; }
    try {
      const loggedInUser = await authService.login(loginForm.username, loginForm.password);
      setCurrentUser(loggedInUser);
      localStorage.setItem('algan_user', JSON.stringify(loggedInUser));
      
      // Kullanıcı sisteme girince verileri çek
      fetchAllData();
      setSettingsForm({ username: loggedInUser.username, password: '', confirm: '' });
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Hatalı kullanıcı adı veya şifre!");
      } else {
        alert("Sunucu hatası veya backend henüz güncellenmedi. Lütfen biraz bekleyip tekrar deneyin.");
        console.error("Login hatası:", error);
      }
    }
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
    if(u.role === 'head') {
        if (u.unit === 'Aviyonik') return 2;
        if (u.unit === 'Yazılım') return 3;
        return 4;
    }
    if (u.unit === 'Aviyonik') return 6;
    if (u.unit === 'Yazılım') return 7;
    return 8;
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

  // --- GRAFİK MANTIĞI (23:59 DÜZELTMESİ İLE) ---
  const calculateDailyLog = (log, d, todayStr) => {
      let mins = 0, color = "#cbd5e1"; 
      if (!log) return { mins, color, attended: 0 };
      
      if(log.status === 'present') {
        color = "#3b82f6"; 
        let tOut = log.timeOut || (d.date !== todayStr ? "23:59" : null);
        if(log.timeIn && tOut) {
           mins = Math.max(0, (new Date(`2000-01-01T${tOut}`) - new Date(`2000-01-01T${log.timeIn}`)) / 60000);
        }
        return { mins, color, attended: 1 };
      } 
      if (log.status === 'absent') {
        color = "#ef4444"; 
      }
      return { mins, color, attended: 0 };
  };

  const getMemberStats = (user) => {
    const activeDays = getActiveWorkDays(); 
    activeDays.sort((a,b) => new Date(a.date) - new Date(b.date));
    
    let attended = 0, totalMins = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    
    const rawData = activeDays.map(d => {
      const log = logs.find(l => String(l.userId) === String(user.id) && l.date === d.date);
      const res = calculateDailyLog(log, d, todayStr);
      attended += res.attended;
      totalMins += res.mins;
      const hoursVal = Math.floor(res.mins / 60); 
      return { date: d.date, hoursVal, mins: res.mins, color: res.color, desc: d.description };
    });

    const maxVal = Math.max(...rawData.map(d => d.hoursVal), 1);
    const chartData = rawData.map(d => ({ ...d, heightPct: (d.hoursVal / maxVal) * 100 }));

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
          await logService.update(existing.id, payload);
      } else {
          await logService.add(payload);
      }
      
      const lRes = await logService.getAll();
      setLogs(lRes);
    } catch { alert("Hata oluştu."); }
  };
  
  const deleteLog = async (userId, date) => {
    const existing = logs.find(l => String(l.userId) === String(userId) && l.date === date);
    if(existing) { 
        await logService.delete(existing.id); 
        const lRes = await logService.getAll(); 
        setLogs(lRes); 
    }
  };

  // --- KİŞİSEL BUTONLAR (GİRİŞ/ÇIKIŞ) ---
  const handleStartWork = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    
    await saveLog(currentUser.id, today, 'present', now, null);
    alert(`Çalışma başlatıldı: ${now}`);
  };

  const handleEndWork = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    
    const myLog = logs.find(l => String(l.userId) === String(currentUser.id) && l.date === today);
    if(myLog) {
        await saveLog(currentUser.id, today, 'present', myLog.timeIn, now);
        alert(`Gün sonlandırıldı: ${now}. Eline sağlık!`);
    } else {
        alert("Henüz giriş yapmamışsın.");
    }
  };

  // --- GELMEYECEĞİM BUTONU ---
  const handleAbsentToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    if(confirm("Bugün çalışmaya katılamayacağını bildirmek istiyor musun?")) {
        await saveLog(currentUser.id, today, 'absent', null, null);
        alert("Bildirim yapıldı. Bugün 'GELMEDİ' olarak görüneceksin.");
    }
  };

  // --- YAPAY ZEKA TETİKLEYİCİSİ ---
  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiReport(null);
  
    try {
      const response = await aiService.analyze(logs);
      setAiReport(response.report);
    } catch (error) {
      console.error("Yapay zeka analiz hatası:", error);
      setAiReport("Analiz sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addMember = async () => {
    if(!formData.name || !formData.username) return alert("Eksik bilgi");
    await userService.add({ ...formData, password: '123', managedIds: [] });
    setModal(null); setFormData({}); fetchAllData(); alert("Üye eklendi. Şifre: 123");
  };
  const updateMember = async () => {
    if(!formData.name || !formData.username) return alert("Eksik bilgi");
    await userService.update(formData.id, formData);
    setModal(null); setFormData({}); fetchAllData(); alert("Bilgiler güncellendi.");
  };
  const deleteMember = async (id) => { 
      if(confirm("Silmek istediğine emin misin?")) { 
          await userService.delete(id); 
          fetchAllData(); 
      } 
  };
  
  const addWorkDayRange = async () => {
    if(!formData.startDate || !formData.endDate) return alert("Tarihleri seçiniz.");
    if(new Date(formData.startDate) > new Date(formData.endDate)) return alert("Tarih hatası.");
    const datesToAdd = [];
    let skippedCount = 0;
    let currentDate = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    while(currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const exists = workDays.some(wd => wd.date === dateStr);
        if (!exists) datesToAdd.push({ date: dateStr, description: formData.description || 'Genel Çalışma' });
        else skippedCount++;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    if (datesToAdd.length === 0) return alert("Bu tarihler zaten ekli!");
    try {
        await workdayService.addMultiple(datesToAdd);
        alert(`${datesToAdd.length} gün eklendi. (${skippedCount} atlandı)`);
    } catch { alert("Hata."); }
  };

  const addWorkDaySingle = async () => {
    if(!formData.date) return alert("Tarih seç"); 
    const exists = workDays.some(wd => wd.date === formData.date);
    if (exists) return alert("Bu tarih zaten ekli!");
    await workdayService.addSingle(formData); 
  };

  const addWorkDay = async () => { 
    if(isRangeMode) {
        await addWorkDayRange();
    } else {
        await addWorkDaySingle();
    }
    setModal(null); setFormData({}); setIsRangeMode(false); fetchAllData(); 
  };

  const deleteWorkDay = async (id) => { 
      if(confirm("Silmek istediğine emin misin?")) { 
          await workdayService.delete(id); 
          fetchAllData(); 
      } 
  };

  const openPermissionModal = (user) => { setPermTargetUser(user); setPermSelectedIds(user.managedIds || []); setModal('permission'); };
  const togglePermission = (id) => { 
      const strId = String(id);
      setPermSelectedIds(prev => {
          const prevStr = prev.map(String);
          return prevStr.includes(strId) ? prevStr.filter(p=>p!==strId) : [...prevStr, strId];
      }); 
  };
  const savePermissions = async () => { 
      if(!permTargetUser) return; 
      await userService.update(permTargetUser.id, { managedIds: permSelectedIds }); 
      setModal(null); 
      fetchAllData(); 
      alert("Yetkiler kaydedildi."); 
  };

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
        await userService.update(currentUser.id, { username: settingsForm.username, password: newPassword });
        const updatedUser = { ...currentUser, username: settingsForm.username, password: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('algan_user', JSON.stringify(updatedUser));
        alert("Profil güncellendi!");
    } catch { alert("Hata."); }
  };

  const showPicker = (id) => { const el = document.getElementById(id); if(el && el.showPicker) el.showPicker(); else if(el) el.focus(); };

  // --- UI RENDER ---
  if (!currentUser) {
    return <Login loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} />;
  }

  const myStats = getMemberStats(currentUser);
  const visibleMembers = getVisibleUsers();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const myTodayLog = logs.find(l => String(l.userId) === String(currentUser.id) && l.date === todayDate);

  let isCurrentlyWorking = false;
  if(myTodayLog && !myTodayLog.timeOut && myTodayLog.status === 'present') {
      isCurrentlyWorking = true;
  }

  let memberPageDesc = "Kaptan olarak tüm üyeleri yönetebilirsiniz.";
  if (currentUser.role === 'head') memberPageDesc = `Sayın Başkan, sadece ${currentUser.unit} birimindeki üyeleri yönetebilirsiniz.`;
  if (currentUser.role === 'member') memberPageDesc = `Yönetim yetkiniz olan üyeler:`;

  return (
    <div id="app-section">
      <Sidebar 
        currentUser={currentUser} 
        clock={clock} 
        activePage={activePage} 
        changePage={changePage} 
        handleLogout={handleLogout} 
      />

      <div className="main-content">
        
        {activePage === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            myTodayLog={myTodayLog}
            isCurrentlyWorking={isCurrentlyWorking}
            handleStartWork={handleStartWork}
            handleEndWork={handleEndWork}
            handleAbsentToday={handleAbsentToday}
            myStats={myStats}
            handleAiAnalysis={handleAiAnalysis}
            isAiLoading={isAiLoading}
            aiReport={aiReport}
            activeWorkDays={getActiveWorkDays()}
            logs={logs}
            todayDate={todayDate}
            workDays={workDays}
          />
        )}

        {activePage === 'calendar' && (
          <Calendar
            currentUser={currentUser}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            workDays={workDays}
            setIsRangeMode={setIsRangeMode}
            setFormData={setFormData}
            setModal={setModal}
            deleteWorkDay={deleteWorkDay}
            openAccordions={openAccordions}
            setOpenAccordions={setOpenAccordions}
            users={users}
            logs={logs}
            deleteLog={deleteLog}
            saveLog={saveLog}
            hasManagerPermission={hasManagerPermission}
          />
        )}

        {activePage === 'summary' && (
           <Summary
              summaryDate={summaryDate}
              setSummaryDate={setSummaryDate}
              activeWorkDays={getActiveWorkDays()}
              currentUser={currentUser}
              getSummaryUsers={getSummaryUsers}
              logs={logs}
              users={users}
              hasManagerPermission={hasManagerPermission}
              openAccordions={openAccordions}
              setOpenAccordions={setOpenAccordions}
           />
        )}

        {activePage === 'logs' && (
           <Logs
              currentUser={currentUser}
              openAccordions={openAccordions}
              setOpenAccordions={setOpenAccordions}
              users={users}
              getRank={getRank}
              getMemberStats={getMemberStats}
           />
        )}

        {activePage === 'members' && (
           <Members
              currentUser={currentUser}
              setFormData={setFormData}
              setModal={setModal}
              visibleMembers={visibleMembers}
              hasManagerPermission={hasManagerPermission}
              deleteMember={deleteMember}
              memberPageDesc={memberPageDesc}
           />
        )}

        {activePage === 'permissions' && (
          <Permissions
            currentUser={currentUser}
            users={users}
            getRank={getRank}
            openPermissionModal={openPermissionModal}
          />
        )}

        {activePage === 'settings' && (
            <Settings
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              updateProfile={updateProfile}
            />
        )}

      </div>

      <Modals
        modal={modal}
        setModal={setModal}
        formData={formData}
        setFormData={setFormData}
        addMember={addMember}
        updateMember={updateMember}
        isRangeMode={isRangeMode}
        setIsRangeMode={setIsRangeMode}
        showPicker={showPicker}
        addWorkDay={addWorkDay}
        permTargetUser={permTargetUser}
        users={users}
        currentUser={currentUser}
        getRank={getRank}
        permSelectedIds={permSelectedIds}
        togglePermission={togglePermission}
        savePermissions={savePermissions}
      />
    </div>
  );
}

export default App;