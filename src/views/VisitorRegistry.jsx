import React, { useState, useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { UserPlus, Send, Calendar, UserCheck } from 'lucide-react';

const VisitorRegistry = ({ showToast }) => {
  const { currentStall, visitors, addVisitor } = useContext(StallContext);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const formatMobileForWhatsApp = (num) => {
    // Remove all non-numeric characters
    const cleaned = num.replace(/\D/g, '');
    
    // If it's a 10-digit number, prepend 91 (default India country code)
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      showToast('Please enter customer name and mobile number', 'error');
      return;
    }

    if (mobile.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid mobile number', 'error');
      return;
    }

    // Save to local storage
    await addVisitor({ name, mobile });
    showToast('Visitor registered successfully!', 'success');

    // WhatsApp Integration
    const stallName = currentStall.stallName || 'our stall';
    const instagramId = currentStall.instagramId ? `@${currentStall.instagramId.replace('@', '')}` : '';
    const instaLink = instagramId ? `https://instagram.com/${instagramId.replace('@', '')}` : '';
    const waGroupLink = currentStall.whatsappLink || '';

    // Create the message
    let message = `Hello ${name}, thank you for visiting us at ${stallName}! 🌟\n\n`;
    
    if (instaLink) {
      message += `Follow us on Instagram for latest collections:\n${instaLink}\n\n`;
    }
    
    if (waGroupLink) {
      message += `Join our WhatsApp Group for regular updates:\n${waGroupLink}\n\n`;
    }
    
    message += `Have a wonderful day!`;

    // Format mobile
    const formattedMobile = formatMobileForWhatsApp(mobile);
    const whatsappUrl = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Reset Form
    setName('');
    setMobile('');
  };

  const triggerWhatsAppAgain = (visitor) => {
    const stallName = currentStall.stallName || 'our stall';
    const instagramId = currentStall.instagramId ? `@${currentStall.instagramId.replace('@', '')}` : '';
    const instaLink = instagramId ? `https://instagram.com/${instagramId.replace('@', '')}` : '';
    const waGroupLink = currentStall.whatsappLink || '';

    let message = `Hello ${visitor.name}, thank you for visiting us at ${stallName}! 🌟\n\n`;
    
    if (instaLink) {
      message += `Follow us on Instagram for latest collections:\n${instaLink}\n\n`;
    }
    
    if (waGroupLink) {
      message += `Join our WhatsApp Group for regular updates:\n${waGroupLink}\n\n`;
    }
    
    message += `Have a wonderful day!`;

    const formattedMobile = formatMobileForWhatsApp(visitor.mobile);
    const whatsappUrl = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="visitor-card">
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h1 className="section-title">Visitor Registry</h1>
        <p className="section-subtitle">Quickly capture customer details to send welcoming links</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="custName">Customer Name</label>
            <input
              type="text"
              id="custName"
              className="form-input"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="custMobile">Mobile Number</label>
            <input
              type="tel"
              id="custMobile"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <UserPlus size={18} />
            Register & WhatsApp Greeting
          </button>
        </form>
      </div>

      {/* Recent Visitors List */}
      <div>
        <h2 style={{ fontSize: '1.1rem', textAlign: 'left', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={18} style={{ color: '#06b6d4' }} />
          Recent Visitors ({visitors.length})
        </h2>
        {visitors.length === 0 ? (
          <div className="card empty-state">
            <UserPlus size={36} />
            <p>No visitors registered yet today</p>
          </div>
        ) : (
          <div className="visitor-list">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="visitor-item">
                <div className="visitor-info">
                  <span className="visitor-name">{visitor.name}</span>
                  <span className="visitor-phone">{visitor.mobile}</span>
                  <span className="visitor-time">
                    <Calendar size={10} style={{ marginRight: '4px', display: 'inline' }} />
                    {new Date(visitor.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button 
                  className="visitor-action" 
                  onClick={() => triggerWhatsAppAgain(visitor)}
                  title="Resend WhatsApp Message"
                >
                  <Send size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorRegistry;
