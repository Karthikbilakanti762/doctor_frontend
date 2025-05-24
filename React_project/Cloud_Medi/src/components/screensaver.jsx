// components/ScreenSaver.jsx
import React, { useEffect, useState } from 'react';
import './screensaver.css';
import logo from '../assets/hospital-logo.jpg';

const quotes = [
  "Healing hands. Caring hearts.",
  "Every life matters. Every second counts.",
  "Compassion is our best medicine.",
  "Strive for excellence. Serve with purpose.",
  "Where care meets innovation.",
];

const ScreenSaver = ({ visible, onHide }) => {
  const [time, setTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(quoteInterval);
    };
  }, [visible]);

  if (!visible) return null;

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="screensaver fixed inset-0 flex flex-col justify-center items-center text-white z-50 scale-95 animate-fade-scale-in"
      onClick={onHide}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(7, 11, 25, 0.8) 100%)',
        backgroundColor: '#0f172a', // Fallback solid background
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      {/* Medical cross patterns 
      <div className="absolute inset-0 overflow-hidden opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl text-white"
            style={{
              left: `${15 + (i % 4) * 25}%`,
              top: `${20 + Math.floor(i / 4) * 60}%`,
              transform: 'rotate(45deg)',
            }}
          >
            ✚
          </div>
        ))}
      </div>*/}

      {/* Subtle heartbeat line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-20 animate-pulse" />

      {/* Main content container with glass effect */}
      <div 
        className="relative z-10 p-12 rounded-3xl  mx-auto"
        style={{
          width: '800px',
          minHeight: '600px',
        }}
      >
        {/* Logo with enhanced styling */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Medical pulse ring animation */}
            <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full border-2 border-green-400 opacity-30 animate-ping" />
            <div className="absolute inset-2 w-36 h-36 mx-auto rounded-full border border-blue-400 opacity-40 animate-pulse" />
            
            <img
              src={logo}
              alt="Hospital Logo"
              className="w-40 h-40 mx-auto rounded-full shadow-2xl border-4 border-white border-opacity-30 transition-transform duration-300 hover:scale-105 relative z-10"
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
              }}
            />
          </div>
          
          
        </div>

        {/* Time and date section */}
        <div className="text-center space-y-6 mb-8">
          <h1 
            className="text-7xl font-light tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-300 animate-fade-in"
            style={{
              textShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {formattedTime}
          </h1>
          <p className="text-xl text-gray-200 font-light tracking-wide opacity-90">
            {formattedDate}
          </p>
        </div>

        {/* Quote section with enhanced styling */}
        <div className="text-center mb-8">
          <div 
            className="relative p-8 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <blockquote className="text-xl italic text-blue-200 leading-relaxed font-light text-center">
              <span className="text-blue-300 text-2xl">"</span>
              <span className="transition-all duration-500 ease-in-out">
                {quotes[quoteIndex]}
              </span>
              <span className="text-blue-300 text-2xl">"</span>
            </blockquote>
          </div>
          
          {/* Quote indicator dots */}
          <div className="flex justify-center mt-6 space-x-3">
            {quotes.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  index === quoteIndex 
                    ? 'w-8 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full' 
                    : 'w-2 h-2 bg-white opacity-30 rounded-full hover:opacity-50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Interactive hint with medical styling */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-sm text-gray-300 opacity-60 font-light tracking-wide">
              Touch to continue
            </p>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="text-xs text-gray-400 opacity-40">
            CloudMedi
          </div>
        </div>
      </div>

      {/* Decorative corner elements 
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white border-opacity-20 rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-white border-opacity-20 rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white border-opacity-20 rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white border-opacity-20 rounded-br-lg" />*/}
    </div>
  );
};

export default ScreenSaver;