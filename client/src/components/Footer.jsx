import React from 'react';
import './styles/Footer.css';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            © 2025 Nagar Nigam Gorakhpur. - All rights reserved.
          </p>
          <p className="footer-text">
            Please feel free to contact our dedicated support team at <strong>9918000241</strong>.<br />
            Our support hours are <strong>Monday to Saturday, 10 AM – 6 PM</strong>.
          </p>
          
          <div className="footer-contact">
            <p className="footer-text-2">
              Stay connected with us
            </p>
            <div className="footer-social">
              <Facebook className="social-icon" size={20} />
              <Twitter className="social-icon" size={20} />
              <Instagram className="social-icon" size={20} />
              <Mail className="social-icon" size={20} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;