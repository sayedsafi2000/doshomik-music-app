"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlay, FaPause, FaDownload, FaHeart, FaClock, FaMusic } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const FeaturedSlider = () => {
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioDurations, setAudioDurations] = useState({});
  const audioRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedSongs = async () => {
      try {
        // Fetch all songs and sort by download count
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/music/all`);
        console.log("API Response:", response.data); // Debug log
        const songs = response.data.data || [];
        
        // Sort by download count and take the top 8
        const featured = songs
          .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
          .slice(0, 8);
        
        setFeaturedSongs(featured);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching featured songs:", err);
        setError('Failed to load featured songs');
        setLoading(false);
      }
    };

    fetchFeaturedSongs();
    
    // Clean up audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio metadata loaded to get duration
  const handleMetadataLoaded = (songId, duration) => {
    setAudioDurations(prev => ({
      ...prev,
      [songId]: duration
    }));
  };

  // Toggle play/pause for a song
  const togglePlay = (songId, audioUrl) => {
    if (currentlyPlaying === songId) {
      // Pause current song
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Stop previous song if playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Add event listeners
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      
      audio.addEventListener('loadedmetadata', () => {
        handleMetadataLoaded(songId, audio.duration);
      });
      
      // Play the audio
      audio.play()
        .then(() => {
          setCurrentlyPlaying(songId);
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          setCurrentlyPlaying(null);
        });
    }
  };

  const handleDownload = async (songId) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Get the first track (full track) by default
      const song = featuredSongs.find(s => s._id === songId);
      const trackType = song.tracks[0].type;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/download/${songId}`,
        { trackType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = res.data.url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading:", error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.9
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-red-500 py-8"
      >
        {error}
      </motion.div>
    );
  }

  if (featuredSongs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-gray-400 py-8"
      >
        No featured songs available yet.
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        variants={itemVariants}
        className="text-2xl font-bold text-white mb-6"
      >
        Featured Songs
      </motion.h2>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {featuredSongs.map((song) => (
          <motion.div 
            key={song._id} 
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={{
              ...itemVariants,
              hover: {
                scale: 1.05,
                transition: { duration: 0.3 }
              }
            }}
            whileHover="hover"
          >
            <div className="relative group h-48">
              {song.image ? (
                <Image
                  src={song.image}
                  alt={song.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={true}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <FaMusic className="text-gray-500 text-4xl" />
                </div>
              )}
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.button 
                  onClick={() => togglePlay(song._id, song.tracks[0]?.url)}
                  className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {currentlyPlaying === song._id ? (
                    <FaPause className="text-white" />
                  ) : (
                    <FaPlay className="text-white" />
                  )}
                </motion.button>
                <motion.button 
                  onClick={() => handleDownload(song._id)}
                  className="p-3 bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaDownload className="text-white" />
                </motion.button>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link 
                    href={`/music/${song._id}`}
                    className="p-3 bg-pink-600 rounded-full hover:bg-pink-700 transition-colors duration-300 block"
                  >
                    <FaHeart className="text-white" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
            <motion.div 
              className="p-4"
              variants={itemVariants}
            >
              <motion.h3 
                className="text-lg font-semibold text-white mb-1"
                variants={itemVariants}
              >
                {song.title}
              </motion.h3>
              <motion.p 
                className="text-gray-400"
                variants={itemVariants}
              >
                {song.artist}
              </motion.p>
              <motion.div 
                className="mt-2 flex items-center text-gray-400 text-sm"
                variants={itemVariants}
              >
                <FaDownload className="mr-1" />
                <span>{song.downloadCount || 0} downloads</span>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default FeaturedSlider; 