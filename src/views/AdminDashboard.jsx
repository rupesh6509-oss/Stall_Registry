import React, { useState, useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { Store, UserCheck, FileText, Trash2, Calendar, ShoppingBag, DollarSign, ArrowLeft } from 'lucide-react';

const AdminDashboard = ({ showToast }) => {
  const { 
    allStalls, 
    allVisitors, 
    allProducts, 
    allInvoices, 
    deleteStall 
  } = useContext(StallContext);

  const [activeAdminTab, setActiveAdminTab] = useState('stalls');
  const [selectedStallDetails, setSelectedStallDetails] = useState(null);

  const handleDeleteStall = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will permanently delete their account, products, visitors, and invoices.`)) {
      const res = await deleteStall(id);
      if (res.success) {
        showToast(`Stall "${name}" deleted successfully`, 'success');
        if (selectedStallDetails?.id === id) {
          setSelectedStallDetails(null);
        }
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const calculateTotalSales = () => {
    return allInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  };

  // Filter scoped data for a selected stall modal/view
  const getStallVisitors = (stallId) => allVisitors.filter(v => v.stall_id === stallId);
  const getStallProducts = (stallId) => allProducts.filter(p => p.stall_id === stallId);
  const getStallInvoices = (stallId) => allInvoices.filter(i => i.stall_id === stallId);

  // Render detail drill-down view
  if (selectedStallDetails) {
    const stallVisitors = getStallVisitors(selectedStallDetails.id);
    const stallProducts = getStallProducts(selectedStallDetails.id);
    const stallInvoices = getStallInvoices(selectedStallDetails.id);

    return (
      <div className="visitor-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button 
            className="action-icon-btn edit" 
            onClick={() => setSelectedStallDetails(null)}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="section-title" style={{ fontSize: '1.25rem' }}>{selectedStallDetails.stallName}</h1>
        </div>

        {/* Info card */}
        <div className="card" style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            {selectedStallDetails.logo ? (
              <img src={selectedStallDetails.logo} alt="Logo" className="header-logo" />
            ) : (
              <div className="header-logo-fallback">{selectedStallDetails.stallName.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{selectedStallDetails.contactName || 'No contact name'}</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{selectedStallDetails.contactMobile || 'No contact mobile'}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {selectedStallDetails.instagramId && <div>Instagram: @{selectedStallDetails.instagramId}</div>}
            {selectedStallDetails.whatsappLink && <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>WA Group: {selectedStallDetails.whatsappLink}</div>}
          </div>
        </div>

        {/* Tab metrics */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div className="card" style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1' }}>{stallProducts.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Products</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#06b6d4' }}>{stallVisitors.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Visitors</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{stallInvoices.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Invoices</div>
          </div>
        </div>

        {/* Drill down lists */}
        <div className="card" style={{ textAlign: 'left', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Products</h2>
          {stallProducts.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No products added.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stallProducts.map(p => (
                <li key={p.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                  <span>{p.name}</span>
                  <span style={{ color: '#06b6d4' }}>₹{p.rate}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Recent Sales</h2>
          {stallInvoices.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No sales recorded.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stallInvoices.map(i => (
                <li key={i.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{i.invoice_number}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(i.date).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>₹{i.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button 
          className="btn btn-danger" 
          onClick={() => handleDeleteStall(selectedStallDetails.id, selectedStallDetails.stallName)}
        >
          <Trash2 size={16} />
          Delete Stall Account
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'left', marginBottom: '16px' }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Consolidated view of all stores, visitors, and revenue</p>
      </div>

      {/* Admin Tab Header Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={() => setActiveAdminTab('stalls')}
          className={`btn ${activeAdminTab === 'stalls' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
        >
          <Store size={14} style={{ marginRight: '4px' }} />
          Stalls ({allStalls.filter(s => s.role !== 'admin').length})
        </button>
        <button 
          onClick={() => setActiveAdminTab('visitors')}
          className={`btn ${activeAdminTab === 'visitors' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
        >
          <UserCheck size={14} style={{ marginRight: '4px' }} />
          Visitors ({allVisitors.length})
        </button>
        <button 
          onClick={() => setActiveAdminTab('invoices')}
          className={`btn ${activeAdminTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
        >
          <FileText size={14} style={{ marginRight: '4px' }} />
          Sales ({allInvoices.length})
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. STALLS TAB */}
      {activeAdminTab === 'stalls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allStalls.filter(s => s.role !== 'admin').length === 0 ? (
            <div className="card empty-state">
              <Store size={36} />
              <p>No stores registered yet</p>
            </div>
          ) : (
            allStalls.filter(s => s.role !== 'admin').map(stall => (
              <div 
                key={stall.id} 
                className="product-item"
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                onClick={() => setSelectedStallDetails(stall)}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left' }}>
                  {stall.logo ? (
                    <img src={stall.logo} alt="Logo" className="header-logo" style={{ width: '36px', height: '36px' }} />
                  ) : (
                    <div className="header-logo-fallback" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                      {stall.stallName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{stall.stallName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      User: {stall.username} | Items: {getStallProducts(stall.id).length}
                    </div>
                  </div>
                </div>
                <button 
                  className="action-icon-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStall(stall.id, stall.stallName);
                  }}
                  title="Delete Stall"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. VISITORS TAB */}
      {activeAdminTab === 'visitors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allVisitors.length === 0 ? (
            <div className="card empty-state">
              <UserCheck size={36} />
              <p>No registered visitors across all stalls</p>
            </div>
          ) : (
            <div className="visitor-list" style={{ maxHeight: '450px' }}>
              {allVisitors.map(v => {
                const stall = allStalls.find(s => s.id === v.stall_id);
                return (
                  <div key={v.id} className="visitor-item">
                    <div className="visitor-info">
                      <span className="visitor-name">{v.name}</span>
                      <span className="visitor-phone">{v.mobile}</span>
                      <span className="visitor-time">
                        <Calendar size={10} style={{ marginRight: '4px', display: 'inline' }} />
                        {new Date(v.date).toLocaleDateString()} {new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                        color: '#6366f1',
                        border: '1px solid rgba(99,102,241,0.2)' 
                      }}
                    >
                      {stall ? stall.stallName : 'Stall'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. SALES/INVOICES TAB */}
      {activeAdminTab === 'invoices' && (
        <div>
          {/* Revenue Metric */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyAll: 'center', color: '#10b981', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CONSOLIDATED STALL REVENUE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>₹{calculateTotalSales().toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allInvoices.length === 0 ? (
              <div className="card empty-state">
                <FileText size={36} />
                <p>No invoices created yet</p>
              </div>
            ) : (
              <div className="history-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {allInvoices.map(inv => {
                  const stall = allStalls.find(s => s.id === inv.stall_id);
                  return (
                    <div key={inv.id} className="visitor-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>{inv.invoice_number}</span>
                        <span style={{ color: '#94a3b8' }}>{new Date(inv.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Stall: <strong>{stall ? stall.stallName : 'Unknown'}</strong></span>
                        <span>Total: <strong style={{ color: '#06b6d4' }}>₹{inv.total}</strong></span>
                      </div>

                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                        Items: {inv.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
