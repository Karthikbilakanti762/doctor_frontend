import React, { useState, useEffect, useRef } from 'react';
import hospitalLogo from '../assets/hospital-logo.jpg';
import { Search, User, ChevronLeft, ChevronRight, Menu, Users, LogOut, Settings, HelpCircle } from 'lucide-react';
import NewPatientCard from './NewPatientCard';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const searchDivRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Navigate to AllPatients page without sidebar
  const navigateToAllPatients = () => {
    navigate('/fullpage/allpatients');
  };
  
  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    // Close profile menu when collapsing sidebar
    if (isExpanded) {
      setProfileMenuOpen(false);
    }
  };
  
  // Toggle profile menu
  const toggleProfileMenu = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(!profileMenuOpen);
  };
  
  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem("hasGreeted");
    navigate('/login');
  };
  
  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch patients for the sidebar
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`, {
        params: { search, limit: 50 }
      });
      setPatients(res.data.patients);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  // Navigate to patient details or toggle back to welcome screen
  const handlePatientClick = (patientId) => {
    // If clicking on the already selected patient, go back to home
    if (location.pathname === `/patient/${patientId}`) {
      navigate('/');
    } else {
      navigate(`/patient/${patientId}`);
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Check if patient is currently selected
  const isPatientSelected = (patientId) => {
    return location.pathname === `/patient/${patientId}`;
  };

  return (
  <div className={`h-full w-full flex flex-col transition-all duration-300 ease-in-out bg-white ${isExpanded ? 'overflow-hidden' : ''} shadow-sm`} style={{ borderRight: '1px solid rgba(229, 231, 235, 0.6)' }}>
      {/* CloudMedi logo and brand name */}
      <div className={`flex items-center w-full py-6 ${isExpanded ? 'justify-start px-6' : 'justify-center'}`} style={{minHeight: '70px', background: 'linear-gradient(to bottom, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 1))'}}>
        <div className="flex items-center">
          {/* Logo - hospital-logo.jpg */}
          <div className="bg-teal-500 rounded-full flex items-center justify-center shadow-sm" style={{width: 42, height: 42, overflow: 'hidden'}}>
            <img src={hospitalLogo} alt="CloudMedi Logo" style={{width: 32, height: 32, objectFit: 'cover', borderRadius: '50%'}} />
          </div>
          {isExpanded && <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-teal-700 tracking-tight select-none">CloudMedi</span>}
        </div>
      </div>
      
      {/* Top section with toggle button */}
      <div className="flex flex-col items-center">
        {/* Toggle button */}
        <div className={`w-full flex ${isExpanded ? 'flex-row' : 'flex-col'} items-center justify-center gap-2 py-4 border-b border-gray-100 bg-transparent`}>
          <button 
            onClick={toggleSidebar}
            className="flex items-center justify-center text-gray-400 hover:text-teal-600 transition-all duration-200 focus:outline-none focus:ring-0"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            style={{ padding: '6px' }}
          >
            {isExpanded ? <ChevronLeft size={20} className="transform transition-transform duration-200 hover:scale-110" /> : <Menu size={20} className="transform transition-transform duration-200 hover:scale-110" />}
          </button>
          
          {/* Users button - positioned inline when expanded, below when collapsed */}
          <button
            onClick={() => navigate('/fullpage/allpatients')}
            className={`flex items-center justify-center text-gray-400 hover:text-teal-600 transition-all duration-200 focus:outline-none focus:ring-0 ${!isExpanded ? 'mt-4' : ''}`}
            title="All Patients"
            style={{ padding: '6px' }}
          >
            <Users size={20} />
          </button>
        </div>
        
        {/* Search patients - only in expanded mode */}
        {isExpanded && (
          <div className="w-full px-3 py-3" ref={searchDivRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 text-sm shadow-sm transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Patients list */}
      {/* Patients list - only visible when sidebar is expanded */}
      {isExpanded ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-gray-50 mt-3 px-1">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-teal-500 border-l-teal-500 shadow-md"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <Users size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No patients found</p>
              <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div>
              {patients.map((patient) => (
                <div key={patient._id} className="px-2 py-1.5">
                  <NewPatientCard
                    patient={{
                      ...patient,
                      avatarUrl: patient.image ? `${import.meta.env.VITE_BACKEND_URL}/api/files/${patient.image}` : undefined
                    }}
                    selected={isPatientSelected(patient._id)}
                    onClick={() => handlePatientClick(patient._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1" style={{ flex: '1 1 auto', minHeight: '10vh', maxHeight: 'calc(100vh - 200px)' }}></div>
      )}
      
      {/* Doctor profile section at bottom */}
      <div className="relative" ref={profileMenuRef}>
        <button
          onClick={toggleProfileMenu}
          className={`w-full flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-all duration-200 hover:border-teal-100`}
        >
          <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-600 font-medium flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white">
            {user.image ? (
              <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span>{user.initials || 'DR'}</span>
            )}
          </div>
          {isExpanded && (
            <div className="ml-3 text-left overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name || 'Dr. Arjun Reddy'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email || 'doctor@example.com'}</p>
            </div>
          )}
        </button>
        
        {/* Profile dropdown menu */}
        {profileMenuOpen && (
          <div
            className={
              isExpanded
                ? 'absolute bottom-full left-8 mb-1 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100'
                : 'fixed left-16 bottom-8 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-[9999] border border-gray-100'
            }
            style={{ maxWidth: '250px' }}
          >
            {/* User info 
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <p className="text-sm font-medium text-gray-900">{user.email || 'doctor@example.com'}</p>
            </div>*/}
            
            {/* Menu items */}
            <div className="py-2">
              <button 
                onClick={handleSignOut}
                className="flex items-center w-full px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150 font-medium"
              >
                <LogOut size={16} className="mr-3" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;