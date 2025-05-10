// src/components/LoginPage.jsx
import React from 'react';

function LoginPage({ onLogin }) {
  return (
    <div style={styles.container}>
      <h2>Welcome to Sewa Bharti Goraksh</h2>
      <p>Please log in to continue.</p>
      <button style={styles.button} onClick={onLogin}>Login</button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '10%',
    fontFamily: 'Segoe UI, sans-serif',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#005ea5',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default LoginPage;
