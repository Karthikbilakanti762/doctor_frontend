import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import PatientDetails from './components/PatientRecord'; 
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import AllPatients from './components/allpatients';
import { Toaster } from "react-hot-toast";

import Screensaver from './components/screensaver';



function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Create a layout component to manage sidebar state
function DashboardLayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen">

      <div className="h-px bg-gray-200" />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)]">
        {/* Sidebar - Variable width based on expansion state */}
        <div className={`transition-all duration-300 h-full overflow-hidden border-r border-gray-200 shadow-sm ${isSidebarExpanded ? 'w-80' : 'w-16'}`} style={{ height: '100%' }}>
          <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        </div>
        {/* Main content - Flexible width */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Create a full page layout without sidebar
function FullPageLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen">
      <div className="h-px bg-gray-200" />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)]">
        {/* Main content - Full width */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

export default function App() {
  const [isIdle, setIsIdle] = useState(false);
  const idleTime = 300* 1000; // 5 mins
  let timeout;

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => setIsIdle(true), idleTime);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top - centre" reverseOrder={false} toastOptions={{
        style: {
          marginTop: '50px',
          marginLeft: '600px'
        },
      }} />

      <Screensaver visible={isIdle} onHide={() => setIsIdle(false)} /> 

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <WelcomeScreen />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <div className="p-6">
                  <PatientDetails />
                </div>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/allpatients"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <div className="p-6">
                  <AllPatients />
                </div>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        {/* Full page routes without sidebar */}
        <Route
          path="/fullpage/allpatients"
          element={
            <PrivateRoute>
              <FullPageLayout>
                <AllPatients />
              </FullPageLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
