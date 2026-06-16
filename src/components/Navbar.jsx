import React, { useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { UserPlus, FileText, History, Package, Settings } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentStall } = useContext(StallContext);

  if (!currentStall) return null;

  const tabs = [
    { id: 'registry', label: 'Registry', icon: <UserPlus size={20} /> },
    { id: 'invoice', label: 'Invoice', icon: <FileText size={20} /> },
    { id: 'history', label: 'History', icon: <History size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
