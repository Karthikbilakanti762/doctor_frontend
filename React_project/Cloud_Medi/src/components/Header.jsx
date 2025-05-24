import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import PatientCardH from '@/components/PatientCardH';
import { Box } from 'grommet';
import { Menu, LogOut, Settings, HelpCircle } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem("hasGreeted");
    navigate('/login');
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) return setResults([]);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients/search?q=${value}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    }
  };

  const handleSelectPatient = (patientId) => {
    if (!patientId) return alert('Invalid ID');
    setQuery('');
    setResults([]);
    navigate(`/patient/${patientId}`);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="flex justify-between items-center px-4 py-3 bg-teal-600 border-b border-gray-300 shadow-sm">
        {/* Left Section: App Title and Logo */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer select-none"
          >
            <span className="text-white font-medium text-lg">CloudMedi</span>
          </div>
        </div>

        {/* Right Section: Actions and Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Button */}
          <button 
            onClick={handleSearchFocus}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Menu Button */}
          <button className="text-white hover:text-gray-200 transition-colors">
            <Menu size={20} />
          </button>
          {results.length > 0 && isSearchFocused && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30">
              <div className="p-2 max-h-96 overflow-y-auto">
                <p className="text-xs text-gray-500 px-3 py-1">Search Results ({results.length})</p>
                <Box direction="column" gap="small">
                  {results.map(patient => (
                    <div 
                      key={patient._id}
                      onClick={() => handleSelectPatient(patient._id)}
                      className="hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <PatientCardH patient={patient} />
                    </div>
                  ))}
                </Box>
              </div>
            </div>
          )}
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center"
            >
              <div className="w-9 h-9 rounded-full bg-teal-500 text-white font-medium flex items-center justify-center shadow-sm border border-teal-400">
                {user.initials || 'DR'}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="font-medium text-gray-800">{user.name || 'Dr. Arjun Reddy'}</p>
                  <p className="text-xs text-gray-500">{user.email || 'doctor@example.com'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}