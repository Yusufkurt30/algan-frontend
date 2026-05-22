import PropTypes from 'prop-types';
import React from 'react';

const Sidebar = ({ currentUser, clock, activePage, changePage, handleLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Algan Logo" />
        <div className="live-clock">{clock}</div>
      </div>
      <ul className="menu">
        <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('dashboard')} className={activePage === 'dashboard' ? 'active' : ''}><i className="fas fa-home"></i> Ana Durum</li>
        
        {(currentUser.role === 'admin' || currentUser.role === 'head' || (currentUser.managedIds && currentUser.managedIds.length > 0)) && (
           <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('calendar')} className={activePage === 'calendar' ? 'active' : ''}><i className="fas fa-calendar-alt"></i> Gün Yönetimi</li>
        )}

        <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('summary')} className={activePage === 'summary' ? 'active' : ''}><i className="fas fa-clipboard-list"></i> Günlük Özet</li>
        
        {(currentUser.role === 'admin' || currentUser.role === 'head') && (
           <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('logs')} className={activePage === 'logs' ? 'active' : ''}><i className="fas fa-chart-line"></i> Genel Performans</li>
        )}

        {(currentUser.role === 'admin' || currentUser.role === 'head') && (
           <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('members')} className={activePage === 'members' ? 'active' : ''}><i className="fas fa-users"></i> Üyeler & Rapor</li>
        )}

        {(currentUser.role === 'admin' || currentUser.role === 'head') && (
          <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('permissions')} className={activePage === 'permissions' ? 'active' : ''}><i className="fas fa-user-shield"></i> Yetkiler</li>
        )}
        
        <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={() => changePage('settings')} className={activePage === 'settings' ? 'active' : ''}><i className="fas fa-cog"></i> Ayarlar</li>
        <li role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.click()}} onClick={handleLogout} style={{color:'#f87171'}}><i className="fas fa-power-off"></i> Çıkış</li>
      </ul>
      <div className="sidebar-footer">
        <h4>{currentUser.name}</h4>
        <p>{currentUser.unit}</p>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  currentUser: PropTypes.any,
  clock: PropTypes.any,
  activePage: PropTypes.any,
  changePage: PropTypes.any,
  handleLogout: PropTypes.any,
};

export default Sidebar;
