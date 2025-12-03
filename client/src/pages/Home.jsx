import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Activity, Wind, Thermometer, Car, Droplets, Building2, Search, Command, TrendingUp, Award, Shield, Zap, Mail, MapPin, Phone, Twitter, Facebook, Instagram, Linkedin, ChevronDown } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";
import FlipCard from '../components/FlipCard';
import smartCityHubImg from '../assets/smart_city_hub.png';



const FadeInSection = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: delay * 0.001, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const [weather, setWeather] = useState({ temp: 'Loading...', aqi: 'Loading...' });
  const [stats, setStats] = useState({ issues: 0, resolved: 0, citizens: 0, rating: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m'),
          fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.6139&longitude=77.2090&current=us_aqi')
        ]);

        if (!weatherRes.ok || !aqiRes.ok) throw new Error('Network response was not ok');

        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();

        setWeather({
          temp: weatherData.current.temperature_2m,
          aqi: aqiData.current.us_aqi
        });
      } catch (error) {
        // Silently fail and show N/A for production
        setWeather({ temp: 'N/A', aqi: 'N/A' });
      }
    };

    fetchVitals();
  }, []);

  // Animate stats counter when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateStats();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateStats = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = { issues: 12847, resolved: 10293, citizens: 25634, rating: 4.6 };
    let current = { issues: 0, resolved: 0, citizens: 0, rating: 0 };

    const increment = {
      issues: targets.issues / steps,
      resolved: targets.resolved / steps,
      citizens: targets.citizens / steps,
      rating: targets.rating / steps
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = {
        issues: Math.min(Math.floor(current.issues + increment.issues), targets.issues),
        resolved: Math.min(Math.floor(current.resolved + increment.resolved), targets.resolved),
        citizens: Math.min(Math.floor(current.citizens + increment.citizens), targets.citizens),
        rating: Math.min(parseFloat((current.rating + increment.rating).toFixed(1)), targets.rating)
      };
      setStats(current);

      if (step >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, interval);
  };

  const getAQIStatus = (aqi) => {
    if (typeof aqi !== 'number') return { text: 'Loading...', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200', hoverBorder: 'hover:border-slate-300', gradient: 'from-slate-50/50' };
    if (aqi <= 50) return { text: 'Good', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500 dark:border-green-400', hoverBorder: 'hover:border-green-500 dark:hover:border-green-400', gradient: 'from-green-50/50 dark:from-green-900/20' };
    if (aqi <= 100) return { text: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500 dark:border-yellow-400', hoverBorder: 'hover:border-yellow-500 dark:hover:border-yellow-400', gradient: 'from-yellow-50/50 dark:from-yellow-900/20' };
    if (aqi <= 150) return { text: 'Unhealthy (Sensitive)', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500 dark:border-orange-400', hoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400', gradient: 'from-orange-50/50 dark:from-orange-900/20' };
    if (aqi <= 200) return { text: 'Unhealthy', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500 dark:border-red-400', hoverBorder: 'hover:border-red-500 dark:hover:border-red-400', gradient: 'from-red-50/50 dark:from-red-900/20' };
    if (aqi <= 300) return { text: 'Very Unhealthy', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500 dark:border-purple-400', hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-400', gradient: 'from-purple-50/50 dark:from-purple-900/20' };
    return { text: 'Hazardous', color: 'text-rose-800 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-500 dark:border-rose-400', hoverBorder: 'hover:border-rose-500 dark:hover:border-rose-400', gradient: 'from-rose-50/50 dark:from-rose-900/20' };
  };

  const getTempStatus = (temp) => {
    if (typeof temp !== 'number') return { text: 'Loading...', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200', hoverBorder: 'hover:border-slate-300', gradient: 'from-slate-50/50' };
    if (temp <= 10) return { text: 'Cold', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-500 dark:border-cyan-400', hoverBorder: 'hover:border-cyan-500 dark:hover:border-cyan-400', gradient: 'from-cyan-50/50 dark:from-cyan-900/20' };
    if (temp <= 30) return { text: 'Pleasant', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500 dark:border-green-400', hoverBorder: 'hover:border-green-500 dark:hover:border-green-400', gradient: 'from-green-50/50 dark:from-green-900/20' };
    if (temp <= 40) return { text: 'Hot', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500 dark:border-orange-400', hoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400', gradient: 'from-orange-50/50 dark:from-orange-900/20' };
    return { text: 'Extreme', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500 dark:border-red-400', hoverBorder: 'hover:border-red-500 dark:hover:border-red-400', gradient: 'from-red-50/50 dark:from-red-900/20' };
  };

  const getTrafficStatus = (status) => {
    if (status === 'Clear') return { text: 'Clear', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500 dark:border-green-400', hoverBorder: 'hover:border-green-500 dark:hover:border-green-400', gradient: 'from-green-50/50 dark:from-green-900/20' };
    if (status === 'Moderate') return { text: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500 dark:border-yellow-400', hoverBorder: 'hover:border-yellow-500 dark:hover:border-yellow-400', gradient: 'from-yellow-50/50 dark:from-yellow-900/20' };
    return { text: 'Heavy', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500 dark:border-red-400', hoverBorder: 'hover:border-red-500 dark:hover:border-red-400', gradient: 'from-red-50/50 dark:from-red-900/20' };
  };

  const getWaterLevelStatus = (level) => {
    if (level === 'Normal') return { text: 'Normal', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500 dark:border-blue-400', hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400', gradient: 'from-blue-50/50 dark:from-blue-900/20' };
    if (level === 'Warning') return { text: 'Warning', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500 dark:border-orange-400', hoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400', gradient: 'from-orange-50/50 dark:from-orange-900/20' };
    return { text: 'Danger', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500 dark:border-red-400', hoverBorder: 'hover:border-red-500 dark:hover:border-red-400', gradient: 'from-red-50/50 dark:from-red-900/20' };
  };

  const aqiStatus = getAQIStatus(weather.aqi);
  const tempStatus = getTempStatus(weather.temp);
  const trafficStatus = getTrafficStatus('Heavy'); // Mocked
  const waterStatus = getWaterLevelStatus('Normal'); // Mocked

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        {/* 1. Interactive Particle Network Background */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" }, // Connects particles on hover
                onClick: { enable: true, mode: "push" },
              },
              modes: {
                grab: { distance: 200, line_linked: { opacity: 1 } },
              },
            },
            particles: {
              color: { value: "#60A5FA" }, // Blue-400
              links: {
                color: "#3B82F6", // Blue-500
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

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter">
              E-CITY <span className="text-blue-400">2.0</span>
            </h1>
            <p className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto">
              The operating system for your city. Connected, Intelligent, Responsive.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Link
              to="/login"
              className="inline-flex items-center bg-blue-600 text-white font-bold py-4 px-10 rounded-full hover:bg-blue-500 transition-all transform hover:scale-110 active:scale-95 shadow-lg shadow-blue-500/25 duration-300 group"
            >
              Login to Contribute
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95 shadow-lg duration-300 group border border-white/20"
            >
              Learn More
              <ChevronDown className="ml-2 group-hover:translate-y-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <ChevronDown className="text-white/60" size={32} />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black mb-2">{stats.issues.toLocaleString()}</div>
              <div className="text-blue-100 font-medium flex items-center justify-center">
                <TrendingUp size={18} className="mr-2" />
                Total Issues Reported
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">{stats.resolved.toLocaleString()}</div>
              <div className="text-blue-100 font-medium flex items-center justify-center">
                <CheckCircle size={18} className="mr-2" />
                Issues Resolved
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">{stats.citizens.toLocaleString()}+</div>
              <div className="text-blue-100 font-medium flex items-center justify-center">
                <Users size={18} className="mr-2" />
                Active Citizens
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">{stats.rating}<span className="text-3xl">/5</span></div>
              <div className="text-blue-100 font-medium flex items-center justify-center">
                <Award size={18} className="mr-2" />
                Citizen Satisfaction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City Meters Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Live Data</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Live City Vitals</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Real-time monitoring of our city's health</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* AQI Meter */}
            <FadeInSection delay={100}>
              <FlipCard
                height="h-56"
                frontContent={
                  <div className={`group bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border-2 ${aqiStatus.border} flex flex-col items-center justify-center transform ${aqiStatus.hoverBorder} transition-all duration-300 h-full relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${aqiStatus.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`${aqiStatus.bg} p-3 rounded-full ${aqiStatus.color} mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm`}>
                      <Wind size={28} />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white relative z-10 tracking-tight">{weather.aqi}</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 relative z-10">AQI ({aqiStatus.text})</div>
                  </div>
                }
                backContent={
                  <div className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 ${aqiStatus.border} flex flex-col items-center justify-center h-full text-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${aqiStatus.bg} opacity-20`}></div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 relative z-10">Air Quality Details</h4>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-200 w-full relative z-10">
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">PM2.5</span> <span className="font-bold">45 µg/m³</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">PM10</span> <span className="font-bold">85 µg/m³</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">O3</span> <span className="font-bold text-green-600 dark:text-green-400">Good</span>
                      </div>
                    </div>
                  </div>
                }
              />
            </FadeInSection>

            {/* Temperature Meter */}
            <FadeInSection delay={200}>
              <FlipCard
                height="h-56"
                frontContent={
                  <div className={`group bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border-2 ${tempStatus.border} flex flex-col items-center justify-center transform ${tempStatus.hoverBorder} transition-all duration-300 h-full relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${tempStatus.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`${tempStatus.bg} p-3 rounded-full ${tempStatus.color} mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm`}>
                      <Thermometer size={28} />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white relative z-10 tracking-tight">{weather.temp}°C</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 relative z-10">Temperature</div>
                  </div>
                }
                backContent={
                  <div className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 ${tempStatus.border} flex flex-col items-center justify-center h-full text-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${tempStatus.bg} opacity-20`}></div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 relative z-10">Forecast</h4>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-200 w-full relative z-10">
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">Humidity</span> <span className="font-bold">45%</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">Wind</span> <span className="font-bold">12 km/h</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">Rain</span> <span className="font-bold">0%</span>
                      </div>
                    </div>
                  </div>
                }
              />
            </FadeInSection>

            {/* Traffic Meter */}
            <FadeInSection delay={300}>
              <FlipCard
                height="h-56"
                frontContent={
                  <div className={`group bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border-2 ${trafficStatus.border} flex flex-col items-center justify-center transform ${trafficStatus.hoverBorder} transition-all duration-300 h-full relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${trafficStatus.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`${trafficStatus.bg} p-3 rounded-full ${trafficStatus.color} mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm`}>
                      <Car size={28} />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white relative z-10 tracking-tight">Heavy</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 relative z-10">Traffic Status</div>
                  </div>
                }
                backContent={
                  <div className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 ${trafficStatus.border} flex flex-col items-center justify-center h-full text-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${trafficStatus.bg} opacity-20`}></div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 relative z-10">Hotspots</h4>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-200 w-full relative z-10">
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">City Center</span> <span className="font-bold text-red-500">Heavy</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">Expressway</span> <span className="font-bold text-yellow-500">Moderate</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-medium">Ring Road</span> <span className="font-bold text-green-500">Clear</span>
                      </div>
                    </div>
                  </div>
                }
              />
            </FadeInSection>

            {/* Water Level Meter */}
            <FadeInSection delay={400}>
              <FlipCard
                height="h-56"
                frontContent={
                  <div className={`group bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border-2 ${waterStatus.border} flex flex-col items-center justify-center transform ${waterStatus.hoverBorder} transition-all duration-300 h-full relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${waterStatus.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`${waterStatus.bg} p-3 rounded-full ${waterStatus.color} mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm`}>
                      <Droplets size={28} />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white relative z-10 tracking-tight">Normal</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 relative z-10">Water Level</div>
                  </div>
                }
                backContent={
                  <div className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 ${waterStatus.border} flex flex-col items-center justify-center h-full text-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${waterStatus.bg} opacity-20`}></div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 relative z-10">River Level</h4>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mb-1 relative z-10">204.5m</div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300 relative z-10">
                      Current Status: <span className="font-bold text-blue-500">Safe</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 relative z-10">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                }
              />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* City of Tomorrow Section */}
      <section className="py-20 bg-white dark:bg-slate-800 overflow-hidden transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <FadeInSection>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                  Building the <span className="text-blue-600 dark:text-blue-400">City of Tomorrow</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                  Experience the perfect harmony of technology and sustainability. Our smart city hub integrates cutting-edge innovation with eco-friendly living to create a seamless urban experience.
                </p>
                <div className="space-y-4 mt-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Smart Infrastructure</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Intelligent transport systems, energy-efficient buildings, and seamless connectivity.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400 mt-1">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Sustainable Living</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Vertical gardens, renewable energy integration, and zero-carbon initiatives.</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
            <div className="md:w-1/2 relative">
              <FadeInSection delay={200}>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50 blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-50 blur-3xl animate-pulse-slow delay-700"></div>
                <div className="relative bg-gradient-to-br from-slate-100 to-white dark:from-slate-700 dark:to-slate-800 p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 group">
                  <img
                    src={smartCityHubImg}
                    alt="Smart City Hub"
                    className="rounded-xl w-full h-80 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <p className="font-bold text-slate-800 dark:text-white">Smart City Hub</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Innovation Center</p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="grid md:grid-cols-3 gap-10">
          <FadeInSection delay={0}>
            <FlipCard
              height="h-80"
              frontContent={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 h-full flex flex-col group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 text-slate-900 dark:text-white relative z-10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Clean City</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-grow font-medium relative z-10">
                    Report garbage dumps, smog towers issues, or park maintenance to keep our capital breathing.
                  </p>
                </div>
              }
              backContent={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border-2 border-blue-500 dark:border-blue-400 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/10"></div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white relative z-10">Take Action</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8 font-medium relative z-10">
                    Upload photos of garbage or pollution. Our AI will categorize and route it to the right department.
                  </p>
                  <Link to="/login" className="relative z-10 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center">
                    Report Now <ArrowRight size={18} className="ml-2" />
                  </Link>
                </div>
              }
            />
          </FadeInSection>
          <FadeInSection delay={150}>
            <FlipCard
              height="h-80"
              frontContent={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-slate-100 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-400 h-full flex flex-col group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10">
                    <Activity size={32} />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 text-slate-900 dark:text-white relative z-10 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Civic Progress</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-grow font-medium relative z-10">
                    From pothole repairs in Connaught Place to streetlights in Dwarka, track resolution in real-time.
                  </p>
                </div>
              }
              backContent={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border-2 border-green-500 dark:border-green-400 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-50/30 dark:bg-green-900/10"></div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white relative z-10">Live Dashboard</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8 font-medium relative z-10">
                    View real-time status of all reported issues in your ward. Transparency is key.
                  </p>
                  <Link to="/login" className="relative z-10 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center">
                    View Dashboard <ArrowRight size={18} className="ml-2" />
                  </Link>
                </div>
              }
            />
          </FadeInSection>
          <FadeInSection delay={300}>
            <FlipCard
              height="h-80"
              frontContent={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-slate-100 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 h-full flex flex-col group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10">
                    <Users size={32} />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 text-slate-900 dark:text-white relative z-10 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Participation</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-grow font-medium relative z-10">
                    Join fellow citizens in making our historic city a modern, smart, and livable metropolis.
                  </p>
                </div>
              }
              backContent={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border-2 border-purple-500 dark:border-purple-400 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-50/30 dark:bg-purple-900/10"></div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white relative z-10">Join Community</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8 font-medium relative z-10">
                    Participate in polls, suggest improvements, and volunteer for local drives.
                  </p>
                  <Link to="/login" className="relative z-10 bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center">
                    Join Now <ArrowRight size={18} className="ml-2" />
                  </Link>
                </div>
              }
            />
          </FadeInSection>
        </div>
      </section >

      {/* Why Choose E-City Section */}
      < section className="py-20 bg-slate-50 dark:bg-slate-800 transition-colors duration-200" >
        <div className="container mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Why E-City 2.0?</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Built for the people, by the people. Here's what makes us different.</p>
            </div>
          </FadeInSection>
          <div className="grid md:grid-cols-3 gap-8">
            <FadeInSection delay={100}>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Lightning Fast Response</h3>
                <p className="text-slate-600 dark:text-slate-300">AI-powered routing ensures your complaint reaches the right department within minutes, not days.</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-green-500 dark:hover:border-green-400 transition-all">
                <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                  <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">100% Transparent</h3>
                <p className="text-slate-600 dark:text-slate-300">Track every step of your issue resolution. See who's assigned, when it's resolved, and rate the service.</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={300}>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Community Driven</h3>
                <p className="text-slate-600 dark:text-slate-300">Upvote issues in your area, collaborate with neighbors, and make your voice heard collectively.</p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-slate-900 text-white py-12" >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">E-CITY 2.0</h3>
              <p className="text-slate-400 mb-4">Empowering citizens to build a better city together.</p>
              <div className="flex space-x-4">
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link to="/map" className="hover:text-white transition-colors">City Map</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/api-access" className="hover:text-white transition-colors">API Access</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center">
                  <MapPin size={18} className="mr-2 flex-shrink-0" />
                  <span>City Hall, Central District</span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-2 flex-shrink-0" />
                  <span>1800-XXX-XXXX (Toll Free)</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-2 flex-shrink-0" />
                  <span>support@ecity.gov.in</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 E-City 2.0. All rights reserved. Built with ❤️ for our city.</p>
          </div>
        </div>
      </footer >
    </div >
  );
};

export default Home;
