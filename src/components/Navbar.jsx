/**
 * src/components/Navbar.jsx
 *
 * Tek sorumluluk: üst gezinme çubuğunu göster.
 */
export default function Navbar({ currentUser, activePage, onChangePage, onLogout, clock }) {
  const isAdmin = currentUser?.role === 'admin';
  const isHead = currentUser?.role === 'head';

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Logo" />
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{currentUser?.name?.charAt(0)}</div>
        <div>
          <div className="user-name">{currentUser?.name}</div>
          <div className="user-role">{currentUser?.unit}</div>
        </div>
      </div>

      <div className="clock">{clock}</div>

      <ul className="nav-list">
        <li
          className={activePage === 'dashboard' ? 'active' : ''}
          onClick={() => onChangePage('dashboard')}
        >
          <i className="fas fa-tachometer-alt" /> Özet
        </li>
        <li
          className={activePage === 'members' ? 'active' : ''}
          onClick={() => onChangePage('members')}
        >
          <i className="fas fa-users" /> Üyeler
        </li>
        <li
          className={activePage === 'attendance' ? 'active' : ''}
          onClick={() => onChangePage('attendance')}
        >
          <i className="fas fa-calendar-check" /> Yoklama
        </li>

        {(isAdmin || isHead) && (
          <li
            className={activePage === 'workdays' ? 'active' : ''}
            onClick={() => onChangePage('workdays')}
          >
            <i className="fas fa-calendar-alt" /> Çalışma Günleri
          </li>
        )}

        {(isAdmin || isHead) && (
          <li
            className={activePage === 'permissions' ? 'active' : ''}
            onClick={() => onChangePage('permissions')}
          >
            <i className="fas fa-user-check" /> Yetkiler
          </li>
        )}

        <li
          className={activePage === 'settings' ? 'active' : ''}
          onClick={() => onChangePage('settings')}
        >
          <i className="fas fa-cog" /> Ayarlar
        </li>
      </ul>

      <button className="btn-logout" onClick={onLogout}>
        <i className="fas fa-sign-out-alt" /> Çıkış
      </button>
    </nav>
  );
}
