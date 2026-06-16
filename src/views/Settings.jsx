import React, { useState, useContext, useEffect } from 'react';
import { StallContext } from '../contexts/StallContext';
import { Settings, Save, Upload, RefreshCw, Link, User, Phone, CheckCircle } from 'lucide-react';

const InstagramIcon = ({ size = 24, className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const SettingsView = ({ showToast }) => {
  const { currentStall, updateSettings } = useContext(StallContext);
  
  const [stallName, setStallName] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [logo, setLogo] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Sync state with context
  useEffect(() => {
    if (currentStall) {
      setStallName(currentStall.stallName || '');
      setInstagramId(currentStall.instagramId || '');
      setWhatsappLink(currentStall.whatsappLink || '');
      setContactName(currentStall.contactName || '');
      setContactMobile(currentStall.contactMobile || '');
      setLogo(currentStall.logo || '');
      setStoreAddress(currentStall.storeAddress || '');
    }
  }, [currentStall]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      showToast('Logo uploaded. Click Save to apply.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!stallName.trim()) {
      showToast('Stall Name is required', 'error');
      return;
    }

    const updated = await updateSettings({
      stallName,
      instagramId,
      whatsappLink,
      contactName,
      contactMobile,
      logo,
      storeAddress
    });

    if (updated.success) {
      showToast('Settings saved successfully!', 'success');
    } else {
      showToast('Error saving settings', 'error');
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset to Devendra\'s Demo Settings?')) {
      setStallName('Jain Creations');
      setInstagramId('jain_creations_official');
      setWhatsappLink('https://chat.whatsapp.com/demo_group_link');
      setContactName('Devendra Jain');
      setContactMobile('+919876543210');
      setLogo('');
      setStoreAddress('G2, Tapasya Apartment, Bhayandar West, Near Madhu Maternity Hospital, 401101');
      
      await updateSettings({
        stallName: 'Jain Creations',
        instagramId: 'jain_creations_official',
        whatsappLink: 'https://chat.whatsapp.com/demo_group_link',
        contactName: 'Devendra Jain',
        contactMobile: '+919876543210',
        logo: '',
        storeAddress: 'G2, Tapasya Apartment, Bhayandar West, Near Madhu Maternity Hospital, 401101'
      });
      showToast('Settings reset to Demo!', 'success');
    }
  };

  return (
    <div className="settings-card">
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h1 className="section-title">Stall Settings</h1>
        <p className="section-subtitle">Configure your brand identity and contact points</p>
      </div>

      <div className="card">
        <form onSubmit={handleSave}>
          {/* Logo Upload Section */}
          <div className="logo-upload-container">
            {logo ? (
              <div style={{ position: 'relative' }}>
                <img src={logo} alt="Stall Logo Preview" className="logo-preview-large" />
                <button
                  type="button"
                  className="action-icon-btn delete"
                  style={{ position: 'absolute', right: '-8px', bottom: '-8px', backgroundColor: '#0f1624', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => { setLogo(''); showToast('Logo cleared. Click Save to apply.', 'success'); }}
                  title="Remove Logo"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            ) : (
              <label htmlFor="logo-input" className="logo-preview-placeholder">
                <Upload size={24} />
                <span style={{ fontSize: '0.75rem', marginTop: '6px' }}>Upload Logo</span>
              </label>
            )}
            <input
              type="file"
              id="logo-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <label htmlFor="logo-input" className="upload-input-label">
              Choose Brand Image
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="stallNameInput">Stall Name</label>
            <input
              type="text"
              id="stallNameInput"
              className="form-input"
              placeholder="e.g. Jain Creations"
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="instaInput">
              <InstagramIcon size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Instagram ID
            </label>
            <input
              type="text"
              id="instaInput"
              className="form-input"
              placeholder="e.g. jain_creations (without @)"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
            />
          </div>


          <div className="form-group">
            <label className="form-label" htmlFor="waLinkInput">
              <Link size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              WhatsApp Group Link
            </label>
            <input
              type="url"
              id="waLinkInput"
              className="form-input"
              placeholder="e.g. https://chat.whatsapp.com/..."
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="addressInput">Physical Store Address</label>
            <textarea
              id="addressInput"
              className="form-textarea"
              rows="3"
              placeholder="e.g. G2, Tapasya Apartment, Bhayandar West..."
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="contactNameInput">
                <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Contact Person
              </label>
              <input
                type="text"
                id="contactNameInput"
                className="form-input"
                placeholder="Devendra Jain"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="contactMobileInput">
                <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Contact Mobile
              </label>
              <input
                type="tel"
                id="contactMobileInput"
                className="form-input"
                placeholder="e.g. 9829012345"
                value={contactMobile}
                onChange={(e) => setContactMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="settings-btn-group">
            <button type="button" className="btn btn-secondary" onClick={handleResetDemo}>
              <RefreshCw size={16} />
              Reset Demo
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
