import React, { useState } from 'react';
import './styles/Feedback.css';

const QueryFeedback = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch('/api/query-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => setSubmitted(true));
  };

  return (
    <main className="qf-container">
      <h1 className="qf-title">Queries &amp; Feedback</h1>

      {submitted ? (
        <p className="qf-success">Thank you! Your feedback has been received.</p>
      ) : (
        <form onSubmit={handleSubmit} className="qf-form" noValidate>
          <label htmlFor="name" className="qf-label">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="qf-input"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email" className="qf-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="qf-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="message" className="qf-label">Your Query / Feedback</label>
          <textarea
            id="message"
            name="message"
            className="qf-textarea"
            value={formData.message}
            onChange={handleChange}
            required
            rows="6"
          />

          <button type="submit" className="qf-button">Submit</button>
        </form>
      )}
    </main>
  );
};

export default QueryFeedback;
