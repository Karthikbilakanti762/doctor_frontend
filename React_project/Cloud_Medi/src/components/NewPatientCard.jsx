import React from 'react';
import { User } from 'lucide-react';

/**
 * NewPatientCard - A modern patient card for sidebar listing styled like the blue cards in the app
 * @param {Object} props
 * @param {Object} props.patient - Patient object
 * @param {boolean} props.selected - Whether this patient is currently selected
 * @param {Function} props.onClick - Click handler for selecting the patient
 */
const NewPatientCard = ({ patient, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full cursor-pointer transition-all duration-200 relative overflow-hidden ${selected ? 'bg-teal-50' : 'bg-white hover:bg-gray-50'} border-b border-gray-100`}
      title={patient.name}
    >
      {/* Teal accent on the left side */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
      
      <div className="flex items-center space-x-3 p-3 pl-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 overflow-hidden">
          {patient.avatarUrl ? (
            <img src={patient.avatarUrl} alt={patient.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <User size={22} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-base truncate">
            {patient.name}
          </div>
          <div className="flex text-xs text-gray-500 mt-1 space-x-3">
            <span className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-1 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {patient.age || '22'} years
            </span>
            <span className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-1 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              {patient.gender || 'Male'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPatientCard;
