"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaMusic, FaHeadphones, FaDownload, FaHeart, FaUsers } from "react-icons/fa";
import Link from "next/link";
import HeroSlider from "./HeroSlider";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const waveAnimation = {
  animate: {
    y: [0, -5, 0, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setIsVisible(true);
    controls.start("animate");
  }, [controls]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="relative">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"
          animate={{
            background: [
              "linear-gradient(to right, rgba(249, 115, 22, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(249, 115, 22, 0.1))"
            ]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-12"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={floatingAnimation}
              animate="animate"
            >
              Discover Your Next Favorite Track
            </motion.h2>
            <motion.p 
              className="text-gray-300 text-lg max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Search through our extensive collection of high-quality music tracks. From ambient to electronic, find the perfect sound for your project.
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.form 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              onSubmit={handleSearch} 
              className="mb-12"
            >
              <motion.div 
                className="relative group"
                animate={isSearchFocused ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search by track name, artist, or genre..."
                  className="w-full px-6 py-4 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-lg transform transition-all duration-300 placeholder-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <FaSearch size={20} />
                </motion.button>
              </motion.div>
            </motion.form>

            {/* Quick Stats */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            >
              {[
                { icon: <FaMusic />, value: "10K+", label: "Tracks" },
                { icon: <FaUsers />, value: "5K+", label: "Artists" },
                { icon: <FaDownload />, value: "50K+", label: "Downloads" },
                { icon: <FaHeart />, value: "25K+", label: "Favorites" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-gray-700/50 transition-colors duration-300"
                >
                  <motion.div 
                    className="text-orange-500 text-2xl mb-2"
                    variants={pulseAnimation}
                    animate="animate"
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.div 
                    className="text-2xl font-bold"
                    variants={waveAnimation}
                    animate="animate"
                    transition={{ delay: index * 0.2 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/all-music"
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 block"
                >
                  Browse Music
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/register"
                  className="bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl block"
                >
                  Join Now
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gray-900 py-16 relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"
          animate={{
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        >
          <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <FaMusic />,
                title: "High Quality Music",
                description: "Access to premium quality music tracks for your projects"
              },
              {
                icon: <FaHeadphones />,
                title: "Easy Download",
                description: "Simple and fast download process for all your favorite tracks"
              },
              {
                icon: <FaMusic />,
                title: "Regular Updates",
                description: "New music added regularly to keep your collection fresh"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-sm hover:bg-gray-700/50 transition-colors duration-300"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  variants={pulseAnimation}
                  animate="animate"
                >
                  <div className="text-3xl text-orange-500">
                    {feature.icon}
                  </div>
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-2 text-white"
                  variants={waveAnimation}
                  animate="animate"
                  transition={{ delay: index * 0.2 }}
                >
                  {feature.title}
                </motion.h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection; 