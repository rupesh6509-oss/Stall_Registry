import React from 'react';
import { Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div>© {new Date().getFullYear()} All Copy Rights Registered by Devendra Jain</div>
      <div className="footer-support">
        <span className="footer-separator">|</span>
        <a href="tel:+919829012345" className="support-link">
          <Phone size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          +91 98290 12345
        </a>
        <span className="footer-separator">|</span>
        <a href="mailto:devendrajain.support@gmail.com" className="support-link">
          <Mail size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          devendrajain.support@gmail.com
        </a>
        <span className="footer-separator">|</span>
      </div>
    </footer>
  );
};

export default Footer;
