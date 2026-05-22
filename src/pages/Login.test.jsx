import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

describe('Login Component', () => {
  it('renders login inputs correctly', () => {
    const mockLoginForm = { username: '', password: '' };
    render(<Login loginForm={mockLoginForm} setLoginForm={() => {}} handleLogin={() => {}} />);
    
    expect(screen.getByPlaceholderText('Kullanıcı Adı')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Şifre')).toBeInTheDocument();
    expect(screen.getByText('Sisteme Gir')).toBeInTheDocument();
  });

  it('calls handleLogin on button click', () => {
    const mockLoginForm = { username: 'testuser', password: 'password123' };
    const mockHandleLogin = vi.fn();
    render(<Login loginForm={mockLoginForm} setLoginForm={() => {}} handleLogin={mockHandleLogin} />);
    
    const loginBtn = screen.getByText('Sisteme Gir');
    fireEvent.click(loginBtn);
    expect(mockHandleLogin).toHaveBeenCalledTimes(1);
  });
});
