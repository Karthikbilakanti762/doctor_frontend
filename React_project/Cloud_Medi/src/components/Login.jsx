import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showVideo, setShowVideo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({ email: false, password: false });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [statusMessage, setStatusMessage] = useState("");
const [statusType, setStatusType] = useState(""); 

  // Advanced mouse tracking for dynamic effects
  const handleMouseMove = useCallback((e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Dynamic gradient based on mouse position
  const dynamicGradient = useMemo(() => {
    return `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
      rgba(6, 182, 212, 0.3) 0%, 
      rgba(14, 165, 233, 0.2) 25%, 
      rgba(59, 130, 246, 0.1) 50%, 
      transparent 70%)`;
  }, [mousePosition]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.doctor));
        localStorage.setItem("hasGreeted", "false");
        
         setStatusMessage("Login successful!");
    setStatusType("success");
        setShowVideo(true);
      } else {
        setStatusMessage("Login failed. Please check your credentials.");
    setStatusType("error");
      }
    } catch (error) {
      setStatusMessage("Login failed. Please check your credentials.");
    setStatusType("error");
    } finally {
      setIsLoading(false);
    }
     setTimeout(() => setStatusMessage(""), 3000);
  };

  useEffect(() => {
    if (showVideo) {
      setTimeout(() => {
        setFadeOut(true);
      }, 2500);

      setTimeout(() => {
        navigate('/');
      }, 4000);
    }
  }, [showVideo, navigate]);

  const isFormValid = credentials.email && credentials.password;

  if (showVideo) {
    return (
      <div className={`flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl animate-pulse">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in-up">
            Welcome to CloudMedi
          </h1>
          <div className="flex items-center justify-center space-x-2 text-cyan-300">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="text-lg">Initializing secure connection...</span>
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
        </div>

        {/*<video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={() => console.log('Error loading video')}
        >
          <source src="/uploads/videolog.mp4" type="video/mp4" />
        </video>*/}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Dynamic background overlay */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{ background: dynamicGradient }}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-[1.02] group">
            
             <AnimatePresence>
    {statusMessage && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`mb-4 px-4 py-2 rounded text-sm font-medium shadow-md ring-1 ring-inset
  ${statusType === "success" ? "bg-green-100 text-green-800 ring-green-300" : "bg-red-100 text-red-800 ring-red-300"}`}

      >
        {statusMessage}
      </motion.div>
    )}
  </AnimatePresence>
            {/* Header section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 group-hover:shadow-cyan-400/60 transition-all duration-500 group-hover:scale-110">
                  <img 
                    src="/jj-removebg-preview.png" 
                    alt="CloudMedi Logo" 
                    className="h-10 w-10 object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-30 blur animate-pulse"></div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent mb-2 tracking-tight">
                CLOUDMEDI
              </h1>
              <div className="flex items-center justify-center space-x-2 text-slate-300">
                <Shield className="w-4 h-4" />
                <p className="text-sm font-medium">Secure Doctor Portal</p>
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    inputFocus.email ? 'text-cyan-400' : 'text-slate-400'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    onFocus={() => setInputFocus({ ...inputFocus, email: true })}
                    onBlur={() => setInputFocus({ ...inputFocus, email: false })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl shadow-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    placeholder="doctor@cloudmedi.com"
                  />
                  <div className={`absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left transition-transform duration-300 ${
                    inputFocus.email ? 'scale-x-100' : 'scale-x-0'
                  }`}></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    inputFocus.password ? 'text-cyan-400' : 'text-slate-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    onFocus={() => setInputFocus({ ...inputFocus, password: true })}
                    onBlur={() => setInputFocus({ ...inputFocus, password: false })}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-xl shadow-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className={`absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left transition-transform duration-300 ${
                    inputFocus.password ? 'scale-x-100' : 'scale-x-0'
                  }`}></div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`relative w-full group overflow-hidden rounded-xl py-4 px-6 font-semibold text-white transition-all duration-300 transform ${
                    isFormValid && !isLoading
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/50 active:scale-[0.98]"
                      : "bg-slate-600/50 cursor-not-allowed"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent flex-1"></div>
                <span className="px-3">Need assistance?</span>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent flex-1"></div>
              </div>
              <a 
                href="https://wa.me/919000923824" 
                className="inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 transition-all duration-300 text-sm font-medium group"
              >
                <span>Contact Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}