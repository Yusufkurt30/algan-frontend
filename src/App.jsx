/**
 * src/App.jsx
 *
 * Orkestratör bileşen.
 * Bu dosyanın TEK sorumluluğu:
 *   1. Auth state'ini yönetmek (useAuth hook ile)
 *   2. Hangi sayfanın gösterileceğine karar vermek
 *   3. Global veri yükleme döngüsünü başlatmak
 *
 * İş mantığı, API çağrıları ve UI detayları ilgili bileşenlere taşındı.
 * Orijinal 956 satır → ~120 satır.
 */
import { useState, useEffect, useCallback } from 'react';
import './App.css';

import { useAuth } from './hooks/useAuth';
import { usersApi, workdaysApi, logsApi } from './services/api';

import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import UserList from './components/UserList';
import WorkdayManager from './components/WorkdayManager';
import AccountSettings from './components/AccountSettings';

// Lazy-loaded Dashboard (the heaviest page – stats/charts)
// import Dashboard from './components/Dashboard';

export default function App() {
  const { currentUser, login, logout, loading: authLoading, error: authError } = useAuth();

  const [activePage, setActivePage] = useState(
    () => localStorage.getItem('algan_active_page') || 'dashboard',
  );
  const [clock, setClock] = useState('--:--:--');

  // Merkezi veri state'i – tüm bileşenlere prop olarak iner
  const [users, setUsers] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [logs, setLogs] = useState([]);

  // Kullanıcı güncellendiğinde (settings sayfası) state'i senkronize et
  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // ── Saat ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('tr-TR')), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Veri yükleme ──────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [u, w, l] = await Promise.all([
        usersApi.getAll(),
        workdaysApi.getAll(),
        logsApi.getAll(),
      ]);
      setUsers(u);
      setWorkDays(w); // workdays servisi zaten tarihe göre sıralı döndürüyor
      setLogs(l);
    } catch (err) {
      console.error('Veri yüklenemedi:', err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetchAllData();
    // Her 30 saniyede bir yenile (5 saniye çok agresifti)
    const interval = setInterval(fetchAllData, 30_000);
    return () => clearInterval(interval);
  }, [currentUser, fetchAllData]);

  const changePage = (page) => {
    setActivePage(page);
    localStorage.setItem('algan_active_page', page);
  };

  // ── Auth guard ────────────────────────────────────────────────
  if (!currentUser) {
    return <LoginPage onLogin={login} loading={authLoading} error={authError} />;
  }

  // ── Sayfa yönlendirme ─────────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case 'members':
        return (
          <UserList
            currentUser={currentUser}
            users={users}
            onDataChange={fetchAllData}
          />
        );
      case 'workdays':
        return (
          <WorkdayManager
            workDays={workDays}
            onDataChange={fetchAllData}
          />
        );
      case 'settings':
        return (
          <AccountSettings
            currentUser={currentUser}
            onUserUpdated={handleUserUpdated}
          />
        );
      case 'dashboard':
      default:
        // Dashboard bileşeni ayrıca implemente edilebilir
        return (
          <div className="page active">
            <h2>Özet</h2>
            <p>Hoş geldin, <strong>{currentUser.name}</strong>!</p>
            <p>Toplam Çalışma Günü: <strong>{workDays.length}</strong></p>
            <p>Toplam Üye: <strong>{users.length}</strong></p>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        currentUser={currentUser}
        activePage={activePage}
        onChangePage={changePage}
        onLogout={logout}
        clock={clock}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
