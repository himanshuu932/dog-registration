import React, { useState } from 'react';
import './styles/Feedback.css';

const QueryFeedback = ({ languageType = 'en' }) => { // Added languageType prop
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Language content
  const textContent = {
    en: {
      title: 'Queries & Feedback',
      successMessage: 'Thank you! Your feedback has been received.',
      nameLabel: 'Name',
      emailLabel: 'Email',
      messageLabel: 'Your Query / Feedback',
      submitButton: 'Submit'
    },
    hi: {
      title: 'प्रश्न और प्रतिक्रिया',
      successMessage: 'धन्यवाद! आपकी प्रतिक्रिया प्राप्त हो गई है।',
      nameLabel: 'नाम',
      emailLabel: 'ईमेल',
      messageLabel: 'आपका प्रश्न / प्रतिक्रिया',
      submitButton: 'जमा करें'
    }
  };

  const currentText = textContent[languageType] || textContent.en; // Default to English

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Assuming the backend endpoint is correct and handles the data
    fetch('/api/query-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => setSubmitted(true))
      .catch(error => {
        console.error("Error submitting feedback:", error);
        // Optionally, handle and display an error message to the user
      });
  };

  return (
    <main className="qf-container">
      <h1 className="qf-title">{currentText.title}</h1> {/* Dynamic title */}

      {submitted ? (
        <p className="qf-success">{currentText.successMessage}</p> 
      ) : (
        <form onSubmit={handleSubmit} className="qf-form" noValidate>
          <label htmlFor="name" className="qf-label">{currentText.nameLabel}</label> {/* Dynamic label */}
          <input
            id="name"
            name="name"
            type="text"
            className="qf-input"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email" className="qf-label">{currentText.emailLabel}</label> {/* Dynamic label */}
          <input
            id="email"
            name="email"
            type="email"
            className="qf-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="message" className="qf-label">{currentText.messageLabel}</label> {/* Dynamic label */}
          <textarea
            id="message"
            name="message"
            className="qf-textarea"
            value={formData.message}
            onChange={handleChange}
            required
            rows="6"
          />

          <button type="submit" className="qf-button">{currentText.submitButton}</button> {/* Dynamic button text */}
        </form>
      )}
    </main>
  );
};

export default QueryFeedback;
