import React, { useState, useCallback } from "react";
import axiosInstance from "../utils/axios";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      showToast("Password reset link sent! Check your email.", "success");
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.error || "Failed to send reset email. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 transition-colors duration-500 relative">
      {/* Background Particles */}
      <div className="absolute inset-0">
        <Particles
          id="tsparticles-forgot"
          init={particlesInit}
          options={{
            background: { color: { value: "#0f172a" } },
            fpsLimit: 120,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" },
                onClick: { enable: false },
              },
              modes: {
                grab: { distance: 140, links: { opacity: 0.5 } },
              },
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
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />
      </div>

      {/* Content */}
      <div className="w-full flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Login Link */}
          <Link
            to="/login"
            className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Password Recovery
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Forgot{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Password?
                  </span>
                </h2>
                <p className="text-slate-400 text-base">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email Field */}
                <motion.div whileHover={{ scale: 1.01 }} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
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

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm font-medium flex items-center"
                  >
                    <span className="mr-2">⚠️</span> {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] animate-gradient-xy rounded-2xl"></div>
                  <div className="relative flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold text-base tracking-wide">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.form>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                <CheckCircle size={40} className="text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                <p className="text-slate-400">
                  We've sent a password reset link to{" "}
                  <span className="text-blue-400 font-medium">{email}</span>
                </p>
                <p className="text-slate-500 text-sm mt-4">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Login
              </Link>
            </motion.div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
