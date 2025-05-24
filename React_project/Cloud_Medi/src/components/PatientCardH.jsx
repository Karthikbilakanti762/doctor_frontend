import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Calendar, Activity, ChevronRight } from 'lucide-react';

const PatientCardH = ({ patient }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/patient/${patient._id}`); // Navigate to PatientDetails page
  };

  // Format date of birth or registration date if available
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate patient ID from MongoDB _id
  const patientIdDisplay = patient._id ? 
    `#${patient._id.toString().slice(-6).toUpperCase()}` : 'N/A';

  return (
    <div 
      onClick={handleViewDetails}
      className="flex items-center bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {/* Left color bar - can indicate status */}
      <div className="w-2 self-stretch bg-teal-500"></div>
      
      {/* Patient Image */}
      <div className="p-4 flex-shrink-0">
        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-100 flex items-center justify-center overflow-hidden">
          {patient.image ? (
            <img src={`http://localhost:5000/api/files/${patient.image}`} alt={patient.name} className="h-full w-full object-cover" />
          ) : (
            <User size={32} className="text-teal-500" />
          )}
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex-grow py-4 pr-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
            <div className="flex items-center text-sm text-gray-500 gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-teal-600" />
                {patient.dob ? formatDate(patient.dob) : `${patient.age} years`}
              </span>
              <span className="flex items-center gap-1">
                <User size={14} className="text-teal-600" />
                {patient.gender}
              </span>

            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {patient.bloodGroup && (
              <div className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                <span className="text-red-600 font-semibold text-sm">{patient.bloodGroup}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCardH;