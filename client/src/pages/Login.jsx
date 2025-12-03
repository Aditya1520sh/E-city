import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Fingerprint, Activity, Globe, Cpu, Key, Link as LinkIcon } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showLockAnimation, setShowLockAnimation] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleGoogleLogin = () => {
    window.location.href = `${window.location.origin}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await axiosInstance.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setIsLoading(false);
      setShowLockAnimation(true);

      // Animation Sequence
      setTimeout(() => {
        setUnlocking(true); // Key turns, lock opens
      }, 400);

      setTimeout(() => {
        setIsExiting(true); // Tear apart

        if (res.data.user.role === 'admin') {
          showToast('Welcome back, Admin!', 'success');
        } else {
          showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        }
      }, 1200);

      setTimeout(() => {
        if (res.data.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 2000);

    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setError(error.response.data.error || 'Invalid credentials');
        showToast(error.response.data.error || 'Invalid credentials', 'error');
      } else if (error.request) {
        setError('Server not responding. Please try again later.');
        showToast('Server not responding', 'error');
      } else {
        setError('An error occurred. Please try again.');
        showToast('An error occurred', 'error');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 transition-colors duration-500 relative">

      {/* Vertical Divider */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent z-30 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>

      {/* Left Panel - Digital Twin Visualization (Desktop Only) */}
      <motion.div
        initial={{ x: 0, scale: 1, opacity: 1 }}
        animate={{
          x: isExiting ? "-100%" : 0,
          scale: isExiting ? 1.2 : 1,
          opacity: isExiting ? 0 : 1
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-center items-start p-12 text-white overflow-hidden"
      >
        <div className="absolute inset-0">
          <Particles
            id="tsparticles-login"
            init={particlesInit}
            options={{
              background: { color: { value: "#0f172a" } },
              fpsLimit: 120,
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                  onClick: { enable: false }
                },
                modes: {
                  grab: { distance: 140, links: { opacity: 0.5 } }
                }
              },
              particles: {
                color: { value: "#38bdf8" },
                links: {
                  color: "#38bdf8",
                  distance: 150,
                  enable: true,
                  opacity: 0.15,
                  width: 1,
                },
                move: { enable: true, speed: 0.5 },
                number: { density: { enable: true, area: 800 }, value: 50 },
                opacity: { value: 0.2 },
                size: { value: { min: 1, max: 2 } },
              },
            }}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Globe size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">E-CITY <span className="text-blue-400">2.0</span></span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-bold leading-tight"
          >
            Smart City, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Smarter Living
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-slate-400 text-lg max-w-md leading-relaxed"
          >
            Transform how you interact with your city. Access real-time data, connect with your community, and shape your city's future.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-3 pt-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Live City Dashboard</h3>
                <p className="text-slate-400 text-xs leading-relaxed">Track air quality, traffic flow, weather alerts in real-time</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck size={16} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Instant Issue Resolution</h3>
                <p className="text-slate-400 text-xs leading-relaxed">Report problems, track progress, get results faster</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={16} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Your Voice Matters</h3>
                <p className="text-slate-400 text-xs leading-relaxed">Vote on initiatives, join events, drive positive change</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* System Status card removed per request */}
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ x: 0, scale: 1, opacity: 1 }}
        animate={{
          x: isExiting ? "100%" : 0,
          scale: isExiting ? 1.2 : 1,
          opacity: isExiting ? 0 : 1
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-slate-950 overflow-hidden"
      >
        {/* Particles Background for Right Side */}
        <div className="absolute inset-0">
          <Particles
            id="tsparticles-login-right"
            init={particlesInit}
            options={{
              background: { color: { value: "#020617" } },
              fpsLimit: 120,
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                  onClick: { enable: false }
                },
                modes: {
                  grab: { distance: 140, links: { opacity: 0.5 } }
                }
              },
              particles: {
                color: { value: "#38bdf8" },
                links: {
                  color: "#38bdf8",
                  distance: 150,
                  enable: true,
                  opacity: 0.15,
                  width: 1,
                },
                move: { enable: true, speed: 0.5 },
                number: { density: { enable: true, area: 800 }, value: 50 },
                opacity: { value: 0.2 },
                size: { value: { min: 1, max: 2 } },
              },
            }}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
          />
        </div>

        <div className="w-full max-w-md space-y-4 sm:space-y-6 relative z-10 px-4 sm:px-0">
          {/* Premium Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left space-y-2"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-2 sm:mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Secure Access</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Back</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">Enter your credentials to continue your journey</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Modern Glassmorphic Input Fields */}
            <div className="space-y-4">
              {/* Email Field with Floating Label Effect */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer block w-full px-4 pt-6 pb-3 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700 rounded-2xl text-white placeholder-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  />
                  <label className="absolute left-4 top-2 text-xs font-bold text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
                    Email Address
                  </label>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-blue-500 transition-colors">
                    <Mail size={20} />
                  </div>
                </div>
              </motion.div>

              {/* Password Field with Floating Label Effect */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer block w-full px-4 pt-6 pb-3 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700 rounded-2xl text-white placeholder-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  />
                  <label className="absolute left-4 top-2 text-xs font-bold text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
                    Password
                  </label>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-blue-500 transition-colors">
                    <Lock size={20} />
                  </div>
                </div>
              </motion.div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm font-medium flex items-center"
              >
                <span className="mr-2">⚠️</span> {error}
              </motion.div>
            )}

            {/* Enhanced Options Row */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-600 rounded-md peer-checked:bg-gradient-to-br peer-checked:from-blue-600 peer-checked:to-cyan-600 peer-checked:border-transparent transition-all"></div>
                  <svg className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors font-medium">Keep me signed in</span>
              </label>
              <a href="#" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Recovery</a>
            </div>

            {/* Premium CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] animate-gradient-xy"></div>
              <div className="relative flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold text-base tracking-wide">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight size={20} className="ml-2" />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>
          </form>

          {/* Modern Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-slate-950 text-slate-500 font-bold text-xs uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(234, 67, 53, 0.15)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            type="button"
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white rounded-xl"></div>
            <div className="relative flex items-center justify-center py-4 px-6 rounded-xl border-2 border-slate-700 hover:border-slate-600 transition-all bg-white">
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-bold text-slate-900 text-base tracking-wide">Continue with Google</span>
            </div>
          </motion.button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Lock & Key Animation Overlay */}
        {showLockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="relative">
              {/* Modern Lock Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotateY: 0,
                  rotate: unlocking ? 10 : 0
                }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="relative z-10"
                style={{ perspective: "1000px" }}
              >
                <div className={`relative w-40 h-40 rounded-2xl ${unlocking ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/50' : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl shadow-slate-900/50'} flex items-center justify-center transition-all duration-300 ring-4 ${unlocking ? 'ring-green-400/30' : 'ring-slate-600/30'}`}>
                  {/* Lock Shackle */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{
                      y: unlocking ? -20 : 0,
                      rotate: unlocking ? -20 : 0,
                      x: unlocking ? -10 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={`absolute -top-12 w-16 h-16 border-8 ${unlocking ? 'border-green-400' : 'border-slate-600'} rounded-t-full transition-colors duration-300`}
                  />

                  {/* Lock Body Icon */}
                  <motion.div
                    animate={{
                      scale: unlocking ? [1, 1.1, 1] : 1,
                      rotate: unlocking ? [0, 5, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className={`${unlocking ? 'text-white' : 'text-slate-400'} transition-colors duration-300`}
                  >
                    <Lock size={56} strokeWidth={2.5} />
                  </motion.div>

                  {/* Success Indicator */}
                  {unlocking && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <motion.div
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <motion.path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Modern Key */}
              <motion.div
                initial={{ x: 150, y: 20, opacity: 0, rotate: -45 }}
                animate={{
                  x: unlocking ? 20 : 80,
                  y: unlocking ? 0 : 20,
                  opacity: unlocking ? 0 : 1,
                  rotate: unlocking ? 360 : -45,
                  scale: unlocking ? 0.5 : 1
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute top-1/2 -right-12 -translate-y-1/2 z-30"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: unlocking ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 0.3, repeat: unlocking ? 0 : Infinity, repeatDelay: 1 }}
                  >
                    <Key size={72} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" fill="currentColor" strokeWidth={1.5} />
                  </motion.div>

                  {/* Key Glow */}
                  <div className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full -z-10 scale-150"></div>
                </div>
              </motion.div>

              {/* Particles on Unlock */}
              {unlocking && (
                <motion.div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos(i * 30 * Math.PI / 180) * 80,
                        y: Math.sin(i * 30 * Math.PI / 180) * 80,
                        opacity: [0, 1, 0]
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Status Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-24 text-center"
            >
              <p className={`text-lg font-bold ${unlocking ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'} transition-colors duration-300`}>
                {unlocking ? '✓ Access Granted' : 'Authenticating...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
