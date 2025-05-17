import React, { useState } from 'react';
import './styles/Common.css';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import HowToRegister from './RegisterSteps';
import GeneralInformation from './GeneralInfo';
import Footer from '../Footer';

const Pethome = ({languageType}) => {
  // State for active service
 
  return (
    <div className="pet-app">
  
    <Hero languageType={languageType}/>
  {/* About Us Section */}
     {/* About Us Section */}
      <About languageType={languageType}/>
  <Services languageType={languageType}/>
      {/* How to Register Section */}
    <HowToRegister languageType={languageType} />

    

      {/* Information Section */}
      <GeneralInformation languageType={languageType}/>

    
    
    </div>
  );
};

export default Pethome;