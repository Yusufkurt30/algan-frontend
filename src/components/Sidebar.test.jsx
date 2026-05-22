import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  it('renders user information correctly', () => {
    const mockUser = { name: 'John Doe', unit: 'Aviyonik', role: 'member' };
    render(
      <Sidebar 
        currentUser={mockUser} 
        clock="12:00:00" 
        activePage="dashboard" 
        changePage={() => {}} 
        handleLogout={() => {}} 
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Aviyonik')).toBeInTheDocument();
    expect(screen.getByText('12:00:00')).toBeInTheDocument();
  });

  it('calls handleLogout when logout button is clicked', () => {
    const mockUser = { name: 'John Doe', unit: 'Aviyonik', role: 'member' };
    const mockLogout = vi.fn();
    render(
      <Sidebar 
        currentUser={mockUser} 
        clock="12:00:00" 
        activePage="dashboard" 
        changePage={() => {}} 
        handleLogout={mockLogout} 
      />
    );
    const logoutBtn = screen.getByText('Çıkış');
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
