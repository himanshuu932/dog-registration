import React from 'react';
import './styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            © 2020 PCS Management Consultancy Pvt. Ltd. - All rights reserved.
          </p>
          <p className="footer-text">
            Please feel free to contact our dedicated support team at <strong>9918000241</strong>.<br />
            Our support hours are <strong>Monday to Saturday, 10 AM – 6 PM</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
