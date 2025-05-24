import React from 'react';
import jjLogo from '../assets/jj-removebg-preview.png';

const WelcomeScreen = () => {
  return (
    <div className="flex flex-1 min-h-0 flex-col items-center justify-center bg-gray-100 w-full h-full">
      <div className="mb-8 p-6 rounded-full bg-teal-500/10 flex items-center justify-center">
        <img src={jjLogo} alt="CloudMedi Logo" style={{ width: 100, height: 100, objectFit: 'contain' }} />
      </div>
      
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">CloudMedi for Windows</h1>
      
      <p className="text-center text-gray-500 max-w-md mb-2">
        Manage patient records efficiently without opening paper files.
      </p>
      
      <p className="text-center text-gray-500 max-w-md mb-8">
        Select a patient from the sidebar to view their complete medical record.
      </p>
      

    </div>
  );
};

export default WelcomeScreen;
