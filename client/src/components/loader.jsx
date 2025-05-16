import React from 'react';
import gifIcon from './Puppy.gif';
export default function RunningDogAnimation() {
  return (
    <div className="loaderContainer" style={{ width: '100%', height: '100vh', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="main">
        <img src={gifIcon} alt="Running Dog Animation" />
      </div>
    </div>
  );
}