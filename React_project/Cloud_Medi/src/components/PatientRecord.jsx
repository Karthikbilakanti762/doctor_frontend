//main final backup page

import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Tabs, Tab, Layer, DataTable, Grid, Card, CardBody , Image} from 'grommet';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AddPrescriptionModal from '@/components/PrescriptionModal';
import AddClinicalNoteModal from '@/components/ClinicalNoteModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PatientCard from '@/components/PatientCardH';
import { 
  Calendar, Clock, FileText, Activity, AlertCircle, FileCheck,
  HeartPulse, Thermometer, Ruler, Weight, LineChart, ChevronDown,
  Heart, ActivitySquare, Droplets, Scale,
  AlertTriangle, FileX, FileSearch,
  Pill, Accessibility, User, Loader, Plus, Printer , ChevronRight , X ,  FileEdit ,RefreshCw ,Clipboard
} from 'lucide-react';
import { FaLungs } from 'react-icons/fa';
import VitalsTrendsTab from '@/components/VitalTrendsTab';



const PatientDetails = () => {
  const { id: patientId } = useParams();
  const printRef = useRef();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [triggerMic, setTriggerMic] = useState(false);
  const [triggerPrescriptionMic, setTriggerPrescriptionMic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [accordionOpen, setAccordionOpen] = useState({
    vitals: false,
    notes: false,
    medications: false
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmText, setConfirmText] = useState('');
const [selectedReportId, setSelectedReportId] = useState(null);


  

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time separately
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: patientData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${patientId}`);
        setPatient(patientData);

        const { data: visitData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/visits/patient/${patientId}`);
        setVisits(visitData); 
        setSelectedVisit(visitData[0]);

        const { data: labData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/labs/patient/${patientId}`);
        setLabReports(labData);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchData();
  }, [patientId]);

  const restartAssistantRef = useRef(null);

  const handlePrescriptionAdded = async () => {
    try {
      const { data: visitData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/visits/patient/${patientId}`);
      setVisits(visitData);
  
      // Update selectedVisit with the latest one from refreshed data
      const updatedVisit = visitData.find(v => v._id === selectedVisit._id);
      setSelectedVisit(updatedVisit || visitData[0]);
    } catch (err) {
      console.error("Error updating visits after prescription:", err);
    }
  };
  
  const fetchLabReports = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/labs/patient/${patientId}`);
      setLabReports(response.data); 
    } catch (error) {
      console.error('Error fetching lab reports:', error);
    }
  };

  const handleAddTest = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/labs`, {
        patientId: patient._id,   
        testName: newTestName,
        visitId : selectedVisit._id
       
      });

      
  
      if (response.status === 201) {
        fetchLabReports();  
        setShowAddTestModal(false);
        setNewTestName('');
      }
    } catch (error) {
      console.error('Error adding lab report:', error);
    }
  };

  
  const handleDeleteTest = async (labReportId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/labs/${labReportId}`);
      setLabReports(prev => prev.filter(report => report._id !== labReportId));
      console.log('Lab report deleted successfully');
    } catch (error) {
      console.error('Error deleting lab report:', error);
    }
  };
  

  const handleCloseClinicalNoteModal = () => {
    setShowClinicalNoteModal(false);
    setTriggerMic(false);
    if (restartAssistantRef.current) restartAssistantRef.current();
  };

  const handleClosePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setTriggerPrescriptionMic(false);
    if (restartAssistantRef.current) restartAssistantRef.current();
  };

  const handleVoiceCommand = (command) => {
    if (command === "notes") {
      setShowClinicalNoteModal(true);
      setTriggerMic(true);
    } else if (command === "prescription") {
      setShowPrescriptionModal(true);
      setTriggerPrescriptionMic(true);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Prescription_${patient.name || 'Patient'}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  if (!patient || !selectedVisit) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-teal-600" />
          
        </div>
      </div>
    );
  }

  const tabIcons = [
    { icon: <Activity size={20} />, label: "Vitals" },
    { icon: <Calendar size={20} />, label: "Visits" },
    { icon: <FileCheck size={20} />, label: "Medical History" },
    { icon: <FileText size={20} />, label: "Lab Reports" }
  ];

  
  



  return (
    
    <div className="bg-gray-50 min-h-screen">
      

      {/* Patient Information Bar */}
      <div className="bg-white/90 border-b border-gray-200 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <PatientCard key={patient._id} patient={patient} />
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => setShowPrescriptionModal(true)} 
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-sm hover:shadow font-medium"
              >
                <Plus size={16} />
                Add Prescription
              </button>
              <button 
                onClick={() => setShowClinicalNoteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow font-medium"
              >
                <Plus size={16} />
                Add Clinical Note
              </button>
              <button
                onClick={handlePrint}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2.5 ${loading ? 'bg-gray-300' : 'bg-blue-600'} text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow font-medium`}
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Printer size={16} />}
                {loading ? "Printing..." : "Print Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Template - Hidden */}
      <div
      ref={printRef}
      className="bg-white text-black w-[800px] absolute top-[-10000px] left-[-10000px] z-[-1]"
      style={{ 
        fontSize: '12px',
        lineHeight: '1.3',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header - Compact */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">CLOUDMEDI</h1>
            <p className="text-blue-100 text-xs mt-0">Your Health, Our Wealth</p>
          </div>
          <div className="text-right">
            <div className="text-base font-medium">Medical Prescription</div>
            <div className="text-xs text-blue-100">
              Ref: RX-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Information Section - Ultra Compact */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          {/* Patient Info */}
          <div className="bg-blue-50 p-2 rounded">
            <h2 className="text-xs font-bold text-blue-800 mb-1 flex items-center">
              <User size={12} className="mr-1" /> Patient Information
            </h2>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div><span className="font-medium text-gray-600">Name:</span> <span className="font-semibold">{patient?.name || "salaar"}</span></div>
              <div><span className="font-medium text-gray-600">ID:</span> {patient._id}</div>
              <div><span className="font-medium text-gray-600">Age:</span> {patient.age}y</div>
              <div><span className="font-medium text-gray-600">Gender:</span> {patient.gender}</div>
            </div>
          </div>

          {/* Doctor & Visit Info */}
          <div className="bg-gray-50 p-2 rounded">
            <h2 className="text-xs font-bold text-gray-700 mb-1 flex items-center">
              <FileText size={12} className="mr-1" /> Visit Details
            </h2>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div><span className="font-medium text-gray-600">Doctor:</span> <span className="font-semibold">Dr. Smith</span></div>
              <div><span className="font-medium text-gray-600">Location:</span> CloudMedi</div>
              <div className="col-span-2"><span className="font-medium text-gray-600">Date:</span> {new Date(selectedVisit?.visitDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Section - Optimized for 20+ medicines */}
      <div className="px-3 py-2">
        <h2 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-1 mb-2 flex items-center">
          <Pill size={14} className="mr-1" /> Prescription ({selectedVisit?.prescriptionId?.medicines?.length || 0} medicines)
        </h2>

        {selectedVisit?.prescriptionId?.medicines?.length > 0 ? (
          <div className="space-y-1">
            {/* Table format for maximum space efficiency */}
            <div className="border border-gray-300 rounded">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-1 font-semibold text-blue-800 w-1/12">#</th>
                    <th className="text-left p-1 font-semibold text-blue-800 w-3/12">Medicine</th>
                    <th className="text-left p-1 font-semibold text-blue-800 w-1/12">Dosage</th>
                    <th className="text-left p-1 font-semibold text-blue-800 w-1/12">Duration</th>
                    <th className="text-left p-1 font-semibold text-blue-800 w-6/12">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVisit.prescriptionId.medicines.map((item, index) => (
                    <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <td className="p-1 text-center font-medium text-blue-700">{index + 1}</td>
                      <td className="p-1">
                        <div className="font-semibold text-blue-800">{item.name}</div>
                      </td>
                      <td className="p-1 text-center">
                        <span className="bg-green-100 text-green-800 px-1 rounded text-xs font-medium">
                          {item.dosage}
                        </span>
                      </td>
                      <td className="p-1 text-center">
                        <span className="bg-orange-100 text-orange-800 px-1 rounded text-xs font-medium">
                          {item.duration}
                        </span>
                      </td>
                      <td className="p-1">
                        <div className="flex items-start">
                          <AlertCircle size={10} className="mr-1 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-tight">{item.instructions}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-gray-500 italic text-xs flex items-center justify-center">
              <Clipboard size={12} className="mr-1" />
              No medicines prescribed for this visit.
            </p>
          </div>
        )}
      </div>

      {/* Doctor's Notes - Ultra Compact */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
        <h2 className="text-sm font-bold text-gray-700 mb-1 flex items-center">
          <FileEdit size={12} className="mr-1" /> Doctor's Notes
        </h2>
        <div className="bg-white p-2 rounded border border-gray-200 text-xs">
          {selectedVisit?.doctorNote.content ? (
            <p className="text-gray-700 italic leading-tight">{selectedVisit.doctorNote.content}</p>
          ) : (
            <p className="text-gray-500 italic">No additional notes provided.</p>
          )}
        </div>
      </div>

      {/* Footer - Ultra Compact */}
      <div className="px-3 py-2 border-t border-gray-200">
        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center">
              <RefreshCw size={10} className="mr-1" />
              Follow-up if symptoms persist after medication completion.
            </p>
            <p className="text-gray-400">Valid for 30 days from issue date.</p>
          </div>
          <div className="text-right">
            <div className="mb-4 h-px w-24 bg-gray-300"></div>
            <p className="text-blue-800 font-semibold text-xs">Dr. Smith, M.D.</p>
            <p className="text-xs text-gray-500">License #: MD12345678</p>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style >{`
        @media print {
          .prescription-container {
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .header, .footer {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  

      

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Custom Tabs */}
        <div className="mb-6 bg-white/90 rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="flex flex-wrap">
            {tabIcons.map((tab, index) => (
              <div
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex items-center px-6 py-4 cursor-pointer transition-all ${
                  activeTab === index
                    ? "text-teal-600 border-b-2 border-teal-500 font-medium bg-teal-50/50"
                    : "text-gray-600 hover:text-teal-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  {/* Metrics Tab */}
  {activeTab === 0 && (
    <VitalsTrendsTab patientVisits={visits} />
  )}

          {/* Visits Tab */}
          {activeTab === 1 && (
            <div className="flex flex-col md:flex-row h-full">
            {/* Visit List - Left side */}
            <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar size={18} className="mr-2 text-teal-600" />
                  Medical Visits History
                </h3>
                
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                  {visits
                    .slice()
                    .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
                    .map((visit) => (
                      <div
                        key={visit._id}
                        onClick={() => setSelectedVisit(visit)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVisit?._id === visit._id
                            ? "bg-white border-l-4 border-teal-500 shadow-sm"
                            : "bg-white/60 hover:bg-white border-l-4 border-transparent hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-teal-700">
                          <Calendar size={14} />
                          <span className="font-medium text-sm">
                            {formatDate(visit.visitDate)}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2 text-sm line-clamp-1">{visit.reason}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{formatTime(visit.visitDate)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          
            {/* Visit Details - Right side */}
            <div className="w-full md:w-2/3 p-6 overflow-y-auto">
              {selectedVisit ? (
                <div className="space-y-6">
                  {/* Visit Header */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedVisit.reason}
                      </h2>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {formatDate(selectedVisit.visitDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 mt-1">
                      <Clock size={16} className="mr-1" />
                      <span>{formatTime(selectedVisit.visitDate)}</span>
                    </div>
                  </div>
          
                  {/* Accordion Sections */}
                  <div className="space-y-4">
                    {/* Vitals Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setAccordionOpen(prev => ({...prev, vitals: !prev.vitals}))}
                        className="w-full flex items-center justify-between bg-white px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center text-gray-800">
                          <Activity size={18} className="mr-2 text-indigo-500" />
                          <h3 className="font-medium">Patient Vitals</h3>
                        </div>
                        <ChevronDown 
                          size={18} 
                          className={`text-gray-500 transition-transform ${accordionOpen.vitals ? 'transform rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {accordionOpen.vitals && selectedVisit.vitals && (
                        <div className="p-4 bg-indigo-50 border-t border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Blood Pressure */}
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center mb-1">
                                <Heart size={14} className="text-red-500 mr-1" />
                                <span className="text-xs text-gray-500 font-medium">BLOOD PRESSURE</span>
                              </div>
                              <div className="flex items-end">
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedVisit.vitals.bloodPressure || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 ml-1 mb-1">mmHg</span>
                              </div>
                            </div>
                            
                            {/* Heart Rate */}
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center mb-1">
                                <ActivitySquare size={14} className="text-red-500 mr-1" />
                                <span className="text-xs text-gray-500 font-medium">HEART RATE</span>
                              </div>
                              <div className="flex items-end">
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedVisit.vitals.heartRate || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 ml-1 mb-1">bpm</span>
                              </div>
                            </div>
                            
                            {/* Temperature */}
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center mb-1">
                                <Thermometer size={14} className="text-amber-500 mr-1" />
                                <span className="text-xs text-gray-500 font-medium">TEMPERATURE</span>
                              </div>
                              <div className="flex items-end">
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedVisit.vitals.temperature || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 ml-1 mb-1">°F</span>
                              </div>
                            </div>
                            
                            {/* Respiratory Rate */}
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center mb-1">
                                <FaLungs size={14} className="text-blue-500 mr-1" />
                                <span className="text-xs text-gray-500 font-medium">RESPIRATORY RATE</span>
                              </div>
                              <div className="flex items-end">
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedVisit.vitals.respirationRate || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 ml-1 mb-1">breaths/min</span>
                              </div>
                            </div>
                            
                            
                            
                            {/* Weight */}
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center mb-1">
                                <Scale size={14} className="text-green-500 mr-1" />
                                <span className="text-xs text-gray-500 font-medium">WEIGHT</span>
                              </div>
                              <div className="flex items-end">
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedVisit.vitals.weight || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 ml-1 mb-1">kg</span>
                              </div>
                            </div>
                          </div>
                          {!selectedVisit.vitals.bloodPressure && !selectedVisit.vitals.heartRate && (
                            <div className="flex items-center justify-center p-4 text-gray-500">
                              <AlertTriangle size={16} className="mr-2" />
                              <p>No vital signs recorded for this visit</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
          
                    {/* Clinical Notes Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setAccordionOpen(prev => ({...prev, notes: !prev.notes}))}
                        className="w-full flex items-center justify-between bg-white px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center text-gray-800">
                          <FileText size={18} className="mr-2 text-blue-500" />
                          <h3 className="font-medium">Clinical Notes</h3>
                        </div>
                        <div className="flex items-center">
                          {selectedVisit.doctorNote && selectedVisit.doctorNote.title && (
                            <span className="text-xs mr-2 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {selectedVisit.doctorNote.title.length > 25 ? 
                                selectedVisit.doctorNote.title.substring(0, 25) + '...' : 
                                selectedVisit.doctorNote.title}
                            </span>
                          )}
                          <ChevronDown 
                            size={18} 
                            className={`text-gray-500 transition-transform ${accordionOpen.notes ? 'transform rotate-180' : ''}`} 
                          />
                        </div>
                      </button>
                      
                      {accordionOpen.notes && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          {selectedVisit.doctorNote ? (
                            <div>
                              {selectedVisit.doctorNote.title && (
                                <h4 className="font-medium text-gray-800 mb-2">
                                  {selectedVisit.doctorNote.title}
                                </h4>
                              )}
                              <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-md">
                                {selectedVisit.doctorNote.content || 
                                 (typeof selectedVisit.doctorNote === 'string' ? selectedVisit.doctorNote : "No content available")}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-6 text-gray-500 bg-gray-50 rounded-md">
                              <FileX size={18} className="mr-2" />
                              <p className="italic">No clinical notes available for this visit</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
          
                    {/* Medications Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setAccordionOpen(prev => ({...prev, medications: !prev.medications}))}
                        className="w-full flex items-center justify-between bg-white px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center text-gray-800">
                          <Pill size={18} className="mr-2 text-emerald-500" />
                          <h3 className="font-medium">Prescribed Medications</h3>
                          {selectedVisit.prescriptionId?.medicines?.length > 0 && (
                            <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
                              {selectedVisit.prescriptionId.medicines.length}
                            </span>
                          )}
                        </div>
                        <ChevronDown 
                          size={18} 
                          className={`text-gray-500 transition-transform ${accordionOpen.medications ? 'transform rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {accordionOpen.medications && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          {selectedVisit.prescriptionId?.medicines &&
                          selectedVisit.prescriptionId.medicines.length > 0 ? (
                            <div className="space-y-3">
                              {selectedVisit.prescriptionId.medicines.map((med, idx) => (
                                <div
                                  key={idx}
                                  className="bg-emerald-50 p-4 rounded-md border-l-4 border-emerald-300"
                                >
                                  <h4 className="font-medium text-emerald-800">{med.name}</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                                    <div>
                                      <span className="text-gray-500">Dosage:</span>{" "}
                                      <span className="font-medium">{med.dosage}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Duration:</span>{" "}
                                      <span className="font-medium">{med.duration}</span>
                                    </div>
                                    <div className="md:col-span-3">
                                      <span className="text-gray-500">Instructions:</span>{" "}
                                      <span className="font-medium">{med.instructions}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-6 text-amber-700 bg-amber-50 rounded-md">
                              <AlertCircle size={18} className="mr-2" />
                              <p>No medications prescribed for this visit</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <FileSearch size={36} className="text-gray-400 mb-3" />
                  <p className="text-gray-500">Select a visit to view details</p>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 2 && (
        <div className="w-full bg-gray-50 rounded-xl shadow-md overflow-hidden">
          
          
          {visits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar size={28} className="text-gray-400" />
              </div>
              <p>No visit records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visits.map((visit) => {
                
                
                return (
                  <div
                    key={visit._id}
                    className="bg-white hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="p-6">
                      {/* Date ribbon */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-gray-600 font-medium">
                          <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                            <Calendar size={18} />
                          </div>
                          {formatDate(visit.visitDate)}
                        </div>
                        
                        {/* Condition badge */}
                        
                      </div>
                      
                      {/* Check if doctorNote exists and has content */}
                      {visit.doctorNote && (visit.doctorNote.title || visit.doctorNote.content) ? (
                        <>
                          {/* Title section */}
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {visit.doctorNote.title|| "Clinical Notes"}
                          </h3>
                          
                          {/* Note content */}
                          <div className="mt-3 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 text-gray-700">
                            <p className="leading-relaxed">{visit.doctorNote.content}</p>
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-700 flex items-center">
                          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                          <p>No medical history to show for this visit</p>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="mt-4 flex justify-end">
                        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
                        onClick={() => {
                          setActiveTab(1);
                          setSelectedVisit(visit);
                        }}>
                          View Details
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

          {/* Lab Reports Tab */}
          {activeTab === 3 && (
          <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Laboratory Results</h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 w-64"
            />
            <svg className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setShowAddTestModal(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Test
          </button>
        </div>
      </div>

      {showAddTestModal && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Add New Lab Test</h2>
          <input
            type="text"
            placeholder="Enter test name..."
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md mb-4"
          />
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowAddTestModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddTest}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Test
            </button>
          </div>
        </div>
      )}

      {labReports.length > 0 ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Test</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Result</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {labReports
                    .filter((report) => report.testName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
                    .map((report, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{new Date(report.testDate).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-500">{new Date(report.testDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{report.testName}</td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => setSelectedImage(`${import.meta.env.VITE_BACKEND_URL}/api/files/${report.result}`)}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="View Report"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-4 px-4">
                      <button
  onClick={() => {
    setSelectedReportId(report._id);
    setShowConfirmModal(true);
  }}
  className="text-red-500 hover:text-red-700"
>
  Delete
</button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertTriangle size={22} className="text-red-500 mr-2" />
                Confirm Deletion
              </h2>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText('');
                  setSelectedReportId(null);
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-1">This action cannot be undone. This will permanently delete the selected report.</p>
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-sm text-yellow-700">
                    Please type <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded">DELETE</span> to confirm.
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirm-deletion" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmation
                </label>
                <input
                  id="confirm-deletion"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                {confirmText && confirmText !== 'DELETE' && (
                  <p className="mt-1 text-sm text-red-600">
                    Please type DELETE exactly as shown.
                  </p>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText('');
                  setSelectedReportId(null);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmText === 'DELETE') {
                    handleDeleteTest(selectedReportId);
                    setShowConfirmModal(false);
                    setConfirmText('');
                    setSelectedReportId(null);
                  } else {
                    // Instead of alert, we show inline validation message
                    // See the conditional text above the button
                  }
                }}
                disabled={confirmText !== 'DELETE'}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  confirmText === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : 'bg-red-400 cursor-not-allowed'
                }`}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{labReports.length}</span> results
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Laboratory Results</h3>
          <p className="text-gray-500 mb-6 max-w-md">There are no laboratory test results available for this patient yet.</p>
          <button 
            onClick={() => setShowAddTestModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add First Test 
          </button>
        </div>
      )}
    </div>)}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <Layer onEsc={() => setSelectedImage(null)} onClickOutside={() => setSelectedImage(null)}>
          <Box pad="medium">
            <Image src={selectedImage} fit="contain" />
          </Box>
        </Layer>
      )}

      {/* Modals */}
      <AddPrescriptionModal
        isOpen={showPrescriptionModal}
        onPrescriptionAdded={handlePrescriptionAdded}
        onClose={handleClosePrescriptionModal}
        existingPrescription={selectedVisit.prescriptionId?.medicines || []}
        patientId={patientId}
        visitId={selectedVisit._id}
        onSaved={(newData) => {
          setSelectedVisit((prev) => ({
            ...prev,
            prescriptionId: newData,
          }));
          handlePrescriptionAdded();
        }}
        triggerMic={triggerPrescriptionMic}
      />

      <AddClinicalNoteModal
        isOpen={showClinicalNoteModal}
        onClose={handleCloseClinicalNoteModal}
        patientId={patientId}
        doctorId={selectedVisit.doctorId}
        visitId={selectedVisit._id}
        onSaved={(updatedNote) => {
          setVisits((prev) => prev.map((visit) => visit._id === selectedVisit._id ?
            { ...visit, doctorNote: updatedNote } : visit));
          setSelectedVisit((prev) => ({ ...prev, doctorNote: updatedNote }));
        }}
        triggerMic={triggerMic}
      />
    </div>
  );
};

export default PatientDetails;