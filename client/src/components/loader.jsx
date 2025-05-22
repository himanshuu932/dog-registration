import React from 'react';
export default function RunningDogAnimation() {
  return (
    <div className="loaderContainer" style={{ width: '100%', height: '100vh', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="main">
        <img src='/Puppy.gif' alt="Running Dog Animation" />
      </div>
    </div>
  );
}