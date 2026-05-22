import PropTypes from 'prop-types';
import React from 'react';

const Login = ({ loginForm, setLoginForm, handleLogin }) => {
  return (
    <div id="login-section">
      <div className="login-card">
        <img src="/logo.png" alt="Algan Logo" className="login-logo" />
        <h3>ALGAN TEAM</h3>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Kullanıcı Adı" 
          value={loginForm.username} 
          onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
        />
        <input 
          type="password" 
          className="form-input" 
          placeholder="Şifre" 
          value={loginForm.password} 
          onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
        />
        <button className="btn-login" onClick={handleLogin}>Sisteme Gir</button>
      </div>
    </div>
  );
};

Login.propTypes = {
  loginForm: PropTypes.any,
  setLoginForm: PropTypes.any,
  handleLogin: PropTypes.any,
};

export default Login;
