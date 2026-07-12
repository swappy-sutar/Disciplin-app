import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft, HelpCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  // Generate random stars for the background
  const stars = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 2,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
      {/* Background Starry Sky */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full opacity-45"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
            animate={{
              opacity: [0.15, 0.8, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Glowing Ambient Color Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Floating Glassmorphism Container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-[0_0_80px_-10px_rgba(139,92,246,0.15)] max-w-lg w-full"
      >
        {/* Animated Compass Icon Header */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border border-indigo-500/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 rounded-full border border-slate-800/80 shadow-inner">
            <motion.div
              animate={{
                y: [0, -6, 0],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Compass className="w-10 h-10 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
            </motion.div>
          </div>
        </div>

        {/* Cinematic 404 Text */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-7xl sm:text-8xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter drop-shadow-md"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-xl font-bold text-slate-200 mt-4 tracking-wide uppercase">
            Coordinates Lost
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
            The page you are looking for has drifted into an uncharted sector of the system or no longer exists.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <Link to="/overview" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-8 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer w-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4 animate-pulse" />
              Back to Safety
            </motion.button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="border border-slate-700 bg-slate-900/80 hover:border-slate-600 text-slate-300 text-sm font-semibold px-8 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer w-full transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Visit Homepage
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
