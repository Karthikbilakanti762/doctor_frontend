import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Phone, Clock, ArrowRight } from 'lucide-react';

const PatientCard = ({ patient, visits }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/patient/${patient._id}`);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get latest visit if available
  const getLatestVisit = () => {
    if (!visits || visits.length === 0) return null;
    return visits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };
  
  const latestVisit = getLatestVisit();

  return (
    <div className="group h-full flex flex-col bg-white/90 rounded-2xl overflow-hidden border border-blue-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-300">
      {/* Patient Header with translucent blue accent */}
      <div className="bg-gradient-to-r from-blue-500/90 to-teal-600/90 px-6 py-5 relative">
        {/* Avatar area */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border-4 border-blue-200 shadow-sm overflow-hidden">
            {patient.image ? (
              <img 
                src={`http://localhost:5000/api/files/${patient.image}`} 
                alt={patient.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={32} className="text-blue-300" />
            )}
          </div>
          <div className="text-white">
            <h3 className="font-bold text-lg leading-tight truncate max-w-[180px]">
              {patient.name}
            </h3>
            <div className="flex items-center mt-1 space-x-2 text-blue-100 text-sm">
              <span>{patient.age} yrs</span>
              <span className="text-blue-200">•</span>
              <span>{patient.gender}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient details */}
      <div className="flex-grow px-6 py-4 flex flex-col gap-3">
        {patient.phone && (
          <div className="flex items-center gap-3 text-gray-600">
            <Phone size={16} className="text-blue-500" />
            <span className="text-sm truncate">{patient.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-gray-600">
          <Calendar size={16} className="text-blue-500" />
          <span className="text-sm">Registered: {formatDate(patient.createdAt)}</span>
        </div>
        {/* Last Visit */}
        <div className="flex items-center gap-3 text-gray-600">
          <Clock size={16} className="text-blue-500" />
          <span className="text-sm">Last visit: {latestVisit ? formatDate(latestVisit.visitDate) : 'N/A'}</span>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <button
          onClick={handleViewDetails}
          className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-medium py-2.5 rounded-xl transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span>View Details</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default PatientCard;