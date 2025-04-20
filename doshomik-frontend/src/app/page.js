"use client";
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturedSlider from "@/components/FeaturedSlider";
import MusicGrid from "@/components/MusicGrid";
import { motion } from "framer-motion";

// Animation variants
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

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <HeroSection />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-white mb-8 flex items-center"
          >
            <motion.span 
              className="bg-blue-600/20 p-2 rounded-lg mr-4"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </motion.span>
            Featured Music
          </motion.h2>
          <motion.div 
            variants={scaleIn}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-6 hover:shadow-blue-500/10 transition-shadow duration-500"
          >
            <FeaturedSlider />
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-white mb-8 flex items-center"
          >
            <motion.span 
              className="bg-purple-600/20 p-2 rounded-lg mr-4"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </motion.span>
            Latest Music
          </motion.h2>
          <motion.div 
            variants={scaleIn}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-6 hover:shadow-purple-500/10 transition-shadow duration-500"
          >
            <MusicGrid />
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}