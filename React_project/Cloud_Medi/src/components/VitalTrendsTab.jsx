import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { 
  Calendar, 
  Heart, 
  Activity, 
  ActivitySquare, 
  Thermometer, 
  Wind, 
  Droplets,
  Scale,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  BarChart4,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

const VitalsTrendsTab = ({ patientVisits = [] }) => {
  const [activeVital, setActiveVital] = useState("bloodPressure");
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Define vital sign options with their display properties
  const vitalOptions = [
    { 
      id: "bloodPressure", 
      name: "Blood Pressure", 
      icon: Heart, 
      color: "#ef4444", 
      unit: "mmHg",
      secondaryColor: "#fee2e2"
    },
    { 
      id: "heartRate", 
      name: "Heart Rate", 
      icon: ActivitySquare, 
      color: "#f97316", 
      unit: "bpm",
      secondaryColor: "#ffedd5"
    },
    { 
      id: "temperature", 
      name: "Temperature", 
      icon: Thermometer, 
      color: "#eab308", 
      unit: "°F",
      secondaryColor: "#fef9c3" 
    },
    { 
      id: "respirationRate", 
      name: "Respiratory Rate", 
      icon: Wind, 
      color: "#3b82f6", 
      unit: "bpm",
      secondaryColor: "#dbeafe"
    },
    { 
      id: "weight", 
      name: "Weight", 
      icon: Scale, 
      color: "#10b981", 
      unit: "kg",
      secondaryColor: "#d1fae5"
    }
  ];

  // Function to get current vital option
  const getCurrentVital = () => {
    return vitalOptions.find(option => option.id === activeVital) || vitalOptions[0];
  };

  // Process visit data for charting when visits or active vital changes
  useEffect(() => {
    if (!patientVisits || patientVisits.length === 0) {
      setChartData([]);
      return;
    }

    const processedData = patientVisits
      .filter(visit => visit.vitals && visit.vitals[activeVital])
      .map(visit => {
        // Special handling for blood pressure which might be formatted as "120/80"
        let value = visit.vitals[activeVital];
        let systolic, diastolic;
        
        if (activeVital === 'bloodPressure' && typeof value === 'string' && value.includes('/')) {
          const [sys, dia] = value.split('/').map(v => parseInt(v.trim(), 10));
          systolic = sys;
          diastolic = dia;
          value = sys; // For sorting purposes
        }

        return {
          date: new Date(visit.visitDate),
          formattedDate: formatDate(visit.visitDate),
          value: parseFloat(value),
          systolic: systolic,
          diastolic: diastolic,
          raw: visit.vitals[activeVital],
          condition: visit.condition
        };
      })
      .sort((a, b) => a.date - b.date); // Sort chronologically

    setChartData(processedData);
  }, [patientVisits, activeVital]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Calculate min and max values for a vital sign
  const getMinMaxValues = () => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0 };
    
    if (activeVital === 'bloodPressure') {
      const systolics = chartData.map(item => item.systolic).filter(Boolean);
      const diastolics = chartData.map(item => item.diastolic).filter(Boolean);
      
      if (systolics.length === 0 || diastolics.length === 0) return { min: 0, max: 0, avg: 0 };
      
      return {
        minSys: Math.min(...systolics),
        maxSys: Math.max(...systolics),
        avgSys: Math.round(systolics.reduce((sum, val) => sum + val, 0) / systolics.length),
        minDia: Math.min(...diastolics),
        maxDia: Math.max(...diastolics),
        avgDia: Math.round(diastolics.reduce((sum, val) => sum + val, 0) / diastolics.length)
      };
    } else {
      const values = chartData.map(item => item.value).filter(Boolean);
      if (values.length === 0) return { min: 0, max: 0, avg: 0 };
      
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10
      };
    }
  };

  // Calculate trends for vital sign
  const calculateTrend = () => {
    if (chartData.length < 2) return { trend: "neutral", percentage: 0 };
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const change = lastValue - firstValue;
    const percentage = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      percentage: Math.abs(Math.round(percentage * 10) / 10)
    };
  };

  const stats = getMinMaxValues();
  const trend = calculateTrend();
  const currentVital = getCurrentVital();

  // Format tooltip value based on vital type
  const formatTooltipValue = (value, name, props) => {
    const { payload } = props;
    if (activeVital === 'bloodPressure' && payload.systolic && payload.diastolic) {
      return `${payload.systolic}/${payload.diastolic} mmHg`;
    }
    return `${value} ${currentVital.unit}`;
  };

  // Generate custom tooltip content
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="text-xs font-medium text-gray-500">{payload[0].payload.formattedDate}</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">
            {activeVital === 'bloodPressure' && payload[0].payload.systolic && payload[0].payload.diastolic 
              ? `${payload[0].payload.systolic}/${payload[0].payload.diastolic} mmHg`
              : `${payload[0].value} ${currentVital.unit}`
            }
          </p>
          {payload[0].payload.condition && (
            <p className="text-xs text-gray-600 mt-1">
              Visit reason: {payload[0].payload.condition}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get button style based on vital type
  const getButtonStyle = (vitalId) => {
    const isActive = activeVital === vitalId;
    let baseClasses = "flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all ";
    
    if (!isActive) {
      return baseClasses + "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
    
    // Return with inline style for active state
    return baseClasses;
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Header with tabs for different vital signs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {vitalOptions.map((option) => {
          const isActive = activeVital === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setActiveVital(option.id)}
              className={getButtonStyle(option.id)}
              style={{
                backgroundColor: isActive ? option.secondaryColor : '',
                color: isActive ? option.color : '',
                ...(isActive ? { 
                  boxShadow: `0 0 0 2px ${option.secondaryColor} `
                } : {})
              }}
            >
              <option.icon size={14} className="mr-1" />
              {option.name}
            </button>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {activeVital === 'bloodPressure' ? (
          // Blood pressure specific stats
          <>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center text-red-700 mb-1">
                <ArrowDown size={14} className="mr-1" />
                <span className="text-xs font-medium">LOWEST</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {stats.minSys}/{stats.minDia} <span className="text-sm text-gray-500">mmHg</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center text-blue-700 mb-1">
                <Activity size={14} className="mr-1" />
                <span className="text-xs font-medium">AVERAGE</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {stats.avgSys}/{stats.avgDia} <span className="text-sm text-gray-500">mmHg</span>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center text-red-700 mb-1">
                <ArrowUp size={14} className="mr-1" />
                <span className="text-xs font-medium">HIGHEST</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {stats.maxSys}/{stats.maxDia} <span className="text-sm text-gray-500">mmHg</span>
              </div>
            </div>
          </>
        ) : (
          // Other vitals stats (heart rate, temperature, etc.)
          <>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center text-red-700 mb-1">
                <ArrowDown size={14} className="mr-1" />
                <span className="text-xs font-medium">LOWEST</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {stats.min} <span className="text-sm text-gray-500">{currentVital.unit}</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center text-blue-700 mb-1">
                <Activity size={14} className="mr-1" />
                <span className="text-xs font-medium">AVERAGE</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {stats.avg} <span className="text-sm text-gray-500">{currentVital.unit}</span>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center text-red-700 mb-1">
                <ArrowUp size={14} className="mr-1" />
                <span className="text-xs font-medium">HIGHEST</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {stats.max} <span className="text-sm text-gray-500">{currentVital.unit}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chart Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button 
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between bg-white px-4 py-3 hover:bg-gray-50"
        >
          <div className="flex items-center text-gray-800">
            <BarChart4 size={18} className="mr-2" style={{ color: currentVital.color }} />
            <h3 className="font-medium">{currentVital.name} Trend</h3>
            
            {trend.trend !== "neutral" && (
              <div className={`ml-3 flex items-center text-sm ${
                trend.trend === "up" ? "text-red-600" : "text-green-600"
              }`}>
                {trend.trend === "up" ? (
                  <TrendingUp size={14} className="mr-1" />
                ) : (
                  <ArrowDown size={14} className="mr-1" />
                )}
                <span>{trend.percentage}% {trend.trend === "up" ? "increase" : "decrease"}</span>
              </div>
            )}
          </div>
          <ChevronDown 
            size={18} 
            className={`text-gray-500 transition-transform ${accordionOpen ? 'transform rotate-180' : ''}`} 
          />
        </button>
        
        {accordionOpen && (
          <div className="p-4 bg-white border-t border-gray-200">
            {chartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {activeVital === 'bloodPressure' ? (
                    // Specialized chart for blood pressure
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 10', 'dataMax + 10']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        name="Systolic" 
                        type="monotone" 
                        dataKey="systolic" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        name="Diastolic" 
                        type="monotone" 
                        dataKey="diastolic" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    // Area chart for other vitals
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`gradient-${activeVital}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={currentVital.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={currentVital.color} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 10', 'dataMax + 10']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name={currentVital.name}
                        stroke={currentVital.color} 
                        fillOpacity={1}
                        fill={`url(#gradient-${activeVital})`}
                        strokeWidth={2}
                        dot={{ fill: currentVital.color, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertTriangle size={32} className="mb-3 text-amber-500" />
                <p>No {currentVital.name.toLowerCase()} data available for this patient</p>
                <p className="text-sm text-gray-400 mt-1">
                  Data will appear here once vitals are recorded during visits
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalsTrendsTab;