import React, { useState, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Signup = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await axiosInstance.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      showToast('Account created successfully! Please login.', 'success');
      setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.response?.data?.error || 'Registration failed. Please try again.';
      showToast(errorMsg, 'error');
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Interactive Particle Network Background - Same as Homepage */}
      <Particles
        id="tsparticles-signup"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              grab: { distance: 200, line_linked: { opacity: 1 } },
            },
          },
          particles: {
            color: { value: "#60A5FA" },
            links: {
              color: "#3B82F6",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: { enable: true, speed: 1.5 },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl z-0"
      ></motion.div>
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-700/20 to-slate-700/20 rounded-full blur-3xl z-0"
      ></motion.div>
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-blue-600/15 to-slate-600/15 rounded-full blur-3xl z-0"
      ></motion.div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 border border-slate-700/60 overflow-hidden relative">
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Header */}
          <div className="px-8 pt-10 pb-8 text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-2xl"></div>
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 mb-6 shadow-lg shadow-blue-500/30 relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-2xl"
              ></motion.div>
              <User className="text-white relative z-10" size={28} strokeWidth={2.5} />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-white mb-2 tracking-tight"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-slate-300 text-sm"
            >
              Join E-City and start engaging with your community
            </motion.p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-900/50 border-2 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
                      errors.name 
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formData.name && !errors.name && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="text-green-500" size={18} />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <AlertCircle size={14} />
                      <span>{errors.name}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-900/50 border-2 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
                      errors.email 
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="text-green-500" size={18} />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <AlertCircle size={14} />
                      <span>{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3 bg-slate-900/50 border-2 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
                      errors.password 
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength ? getPasswordStrengthColor() : 'bg-slate-700'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Strength: <span className={`font-semibold ${
                        passwordStrength <= 1 ? 'text-red-500' :
                        passwordStrength <= 2 ? 'text-orange-500' :
                        passwordStrength <= 3 ? 'text-yellow-500' :
                        passwordStrength <= 4 ? 'text-lime-500' :
                        'text-green-500'
                      }`}>{getPasswordStrengthText()}</span>
                    </p>
                  </motion.div>
                )}

                <AnimatePresence>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <AlertCircle size={14} />
                      <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3 bg-slate-900/50 border-2 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
                      errors.confirmPassword 
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute right-12 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="text-green-500" size={18} />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <AlertCircle size={14} />
                      <span>{errors.confirmPassword}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="relative w-full mt-6 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden group"
              >
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="relative z-10">Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Create Account</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10"
                    >
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center mt-6 pt-6 border-t border-slate-700"
            >
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Sign In</span>
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-6 text-xs text-slate-400"
        >
          By creating an account, you agree to our{' '}
          <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;
