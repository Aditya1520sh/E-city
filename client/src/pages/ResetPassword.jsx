import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsValidToken(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/auth/verify-reset-token/${token}`);
        setIsValidToken(response.data.valid);
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", { token, password });
      setIsSuccess(true);
      showToast("Password reset successfully!", "success");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.error || "Failed to reset password. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!isValidToken && !isSuccess) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-900 transition-colors duration-500 relative">
        <div className="absolute inset-0">
          <Particles
            id="tsparticles-invalid"
            init={particlesInit}
            options={{
              background: { color: { value: "#0f172a" } },
              fpsLimit: 120,
              particles: {
                color: { value: "#ef4444" },
                links: { color: "#ef4444", distance: 150, enable: true, opacity: 0.15, width: 1 },
                move: { enable: true, speed: 0.5 },
                number: { density: { enable: true, area: 800 }, value: 30 },
                opacity: { value: 0.2 },
                size: { value: { min: 1, max: 2 } },
              },
            }}
            style={{ position: "absolute", width: "100%", height: "100%", zIndex: 1 }}
          />
        </div>
        <div className="w-full flex items-center justify-center p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
              <AlertCircle size={40} className="text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Invalid or Expired Link</h2>
              <p className="text-slate-400">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold transition-colors hover:shadow-lg hover:shadow-blue-500/25"
            >
              Request New Reset Link
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 transition-colors duration-500 relative">
      {/* Background Particles */}
      <div className="absolute inset-0">
        <Particles
          id="tsparticles-reset"
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
              color: { value: isSuccess ? "#22c55e" : "#38bdf8" },
              links: {
                color: isSuccess ? "#22c55e" : "#38bdf8",
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

          {!isSuccess ? (
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
                    Create New Password
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Reset{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Password
                  </span>
                </h2>
                <p className="text-slate-400 text-base">
                  Enter your new password below.
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
                {/* New Password Field */}
                <motion.div whileHover={{ scale: 1.01 }} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder=" "
                      className="peer block w-full px-4 pt-6 pb-3 pr-12 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700 rounded-2xl text-white placeholder-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <label className="absolute left-4 top-2 text-xs font-bold text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div whileHover={{ scale: 1.01 }} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder=" "
                      className="peer block w-full px-4 pt-6 pb-3 pr-12 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700 rounded-2xl text-white placeholder-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <label className="absolute left-4 top-2 text-xs font-bold text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>

                {/* Password Requirements */}
                <div className="text-sm text-slate-500">
                  <p className="flex items-center">
                    <span className={`mr-2 ${password.length >= 4 ? 'text-green-400' : ''}`}>
                      {password.length >= 4 ? '✓' : '○'}
                    </span>
                    At least 4 characters
                  </p>
                  <p className="flex items-center">
                    <span className={`mr-2 ${password && password === confirmPassword ? 'text-green-400' : ''}`}>
                      {password && password === confirmPassword ? '✓' : '○'}
                    </span>
                    Passwords match
                  </p>
                </div>

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
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      <>
                        <Lock size={18} className="mr-2" />
                        <span>Reset Password</span>
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
                <h2 className="text-2xl font-bold text-white">Password Reset Complete!</h2>
                <p className="text-slate-400">
                  Your password has been successfully reset.
                </p>
                <p className="text-slate-500 text-sm mt-4">
                  Redirecting to login page...
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold transition-colors hover:shadow-lg hover:shadow-blue-500/25"
              >
                Go to Login Now
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
