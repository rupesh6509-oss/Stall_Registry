import React, { useState, useContext } from 'react';
import { StallProvider, StallContext } from './contexts/StallContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Views
import Login from './views/Login';
import VisitorRegistry from './views/VisitorRegistry';
import InvoiceCreator from './views/InvoiceCreator';
import InvoiceHistory from './views/InvoiceHistory';
import ProductList from './views/ProductList';
import SettingsView from './views/Settings';

const AppContent = () => {
  const { currentStall } = useContext(StallContext);
  const [activeTab, setActiveTab] = useState('registry');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'registry':
        return <VisitorRegistry showToast={showToast} />;
      case 'invoice':
        return <InvoiceCreator showToast={showToast} />;
      case 'history':
        return <InvoiceHistory showToast={showToast} />;
      case 'products':
        return <ProductList showToast={showToast} />;
      case 'settings':
        return <SettingsView showToast={showToast} />;
      default:
        return <VisitorRegistry showToast={showToast} />;
    }
  };

  if (!currentStall) {
    return (
      <div className="phone-wrapper">
        <Login showToast={showToast} />
        {toast && (
          <div className="toast-container">
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="phone-wrapper">
      <Header />
      
      <main className="main-content">
        {renderActiveView()}
        <Footer />
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {toast && (
        <div className="toast-container">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <StallProvider>
      <div className="app-container">
        <AppContent />
      </div>
    </StallProvider>
  );
}

export default App;
