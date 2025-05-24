import React, { useEffect, useState , useRef } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Home, Loader, Calendar, SlidersHorizontal, Users, ArrowLeft, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PatientCard from '@/components/PatientCard';





const AllPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  let latestVisit = null;
  
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/patients', {
        params: { search, gender, minAge, maxAge, from, to, sort, page, limit: 9 }
      });
      setPatients(res.data.patients);
      setTotalPages(res.data.totalPages);
      
      if (res.data.patients.length > 0) {
        const patientId = res.data.patients[0]._id;
        const { data: visitData } = await axios.get(`/api/visits/patient/${patientId}`);
        setVisits(visitData);
        
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
    

  };
const getLatestVisit = () => {
    if (!visits || visits.length === 0) return null;
    return visits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };
  
  latestVisit = getLatestVisit();

   const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  useEffect(() => {
    fetchPatients();
  }, [search, gender, minAge, maxAge, from, to, sort, page]);
useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
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
  const resetFilters = () => {
    setSearch('');
    setGender('');
    setMinAge('');
    setMaxAge('');
    setFrom('');
    setTo('');
    setSort('createdAt');
    setPage(1);
  };

  const getSortLabel = (value) => {
    const labels = {
      'createdAt': 'Date Added',
      'name': 'Patient Name',
      'age': 'Age'
    };
    return labels[value] || value;
  };

  

  const renderPagination = () => {
    // Logic to determine which pages to show
    let pages = [];
    if (totalPages <= 5) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (page <= 3) {
      pages = [1, 2, 3, 4, 5];
    } else if (page >= totalPages - 2) {
      pages = Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    } else {
      pages = [page - 2, page - 1, page, page + 1, page + 2];
    }

    return (
      <div className="flex items-center space-x-1">
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === pageNum
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-100'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Title and Controls */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Patient Directory</h1>
            <p className="text-sm text-gray-500">Manage your patient records</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
  {/* Search Bar with icon */}
  <div className="relative w-80">
    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.65 13.65z" />
      </svg>
    </span>
    <input
      type="text"
      placeholder="Search patients..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm shadow-md transition-all duration-200"
    />
  </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewType('grid')} 
              className={`px-3 py-1 rounded-md text-sm ${viewType === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewType('list')} 
              className={`px-3 py-1 rounded-md text-sm ${viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>
      {/* Filters panel - conditionally rendered */}
      {filtersExpanded && (
        <div className="bg-white p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-md border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={fetchPatients}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Results Summary - Small bar showing count */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs text-gray-500">
        {loading 
          ? 'Loading patients...' 
          : patients.length > 0 
            ? `Showing ${patients.length} of ${totalPages * 9} patients` 
            : 'No patients found'}
      </div>

      {/* Patients List - Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin mb-4 p-2 rounded-full">
              <Loader size={24} className="text-teal-500" />
            </div>
            <p className="text-gray-500 text-sm">Loading patient records...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No patients found</h2>
            <p className="text-gray-500 text-sm max-w-md">Try adjusting your search or filters to find patients.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 flex items-center space-x-2 text-sm px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <PatientCard 
                key={patient._id} 
                patient={patient} 
                visits={visits} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/patient/${patient._id}`)}>                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                          {patient.image ? (
                            <img src={`http://localhost:5000/api/files/${patient.image}`} alt={patient.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <User size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.age} yrs • {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone || 'No phone'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(patient.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{latestVisit ? formatDate(latestVisit.visitDate) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination - Footer */}
      {!loading && patients.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`p-1 rounded ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            {renderPagination()}
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`p-1 rounded ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPatients;