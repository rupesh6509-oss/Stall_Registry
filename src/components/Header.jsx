import React, { useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { currentStall, logout } = useContext(StallContext);

  if (!currentStall) return null;

  return (
    <header className="app-header">
      <div className="header-brand">
        {currentStall.logo ? (
          <img 
            src={currentStall.logo} 
            alt={currentStall.stallName} 
            className="header-logo" 
          />
        ) : (
          <div className="header-logo-fallback">
            {currentStall.stallName ? currentStall.stallName.charAt(0).toUpperCase() : 'S'}
          </div>
        )}
        <span className="header-title">{currentStall.stallName || 'My Stall'}</span>
      </div>
      <div className="header-actions">
        <button className="logout-btn" onClick={logout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
