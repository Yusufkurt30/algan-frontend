import PropTypes from 'prop-types';
import React from 'react';

const Settings = ({
  settingsForm,
  setSettingsForm,
  updateProfile
}) => {
  return (
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
  );
};

Settings.propTypes = {
  settingsForm: PropTypes.any,
  setSettingsForm: PropTypes.any,
  updateProfile: PropTypes.any,
};

export default Settings;
