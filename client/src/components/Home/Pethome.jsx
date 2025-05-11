import React, { useState } from 'react';
import './styles/Common.css';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import HowToRegister from './RegisterSteps';
import GeneralInformation from './GeneralInfo';
import Footer from '../Footer';

const Pethome = () => {
  // State for active service
 
  return (
    <div className="pet-app">
  
    <Hero />
  {/* About Us Section */}
     {/* About Us Section */}
      <About />
  <Services/>
      {/* How to Register Section */}
    <HowToRegister />

    

      {/* Information Section */}
      <GeneralInformation />

    
    
    </div>
  );
};

export default Pethome;