"use client";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { FaPlay, FaPause, FaDownload, FaHeart, FaClock, FaMusic } from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";

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

const MusicGrid = ({ songs: propSongs }) => {
  const { token, user } = useContext(AuthContext);
  const [songs, setSongs] = useState(propSongs || []);
  const [loading, setLoading] = useState(!propSongs);
  const [wishlist, setWishlist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioDurations, setAudioDurations] = useState({});
  const audioRefs = useRef({});

  useEffect(() => {
    if (propSongs) {
      setSongs(propSongs);
      setLoading(false);
    } else {
      const fetchData = async () => {
        try {
          // Fetch all songs
          const songsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/music/all`);
          setSongs(songsRes.data.data || []);

          // Fetch wishlist if user is logged in
          if (user && token) {
            const wishlistRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/wishlist`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setWishlist(wishlistRes.data.wishlist.map(song => song._id));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [propSongs, token, user]);

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
  const togglePlay = (songId, audioUrl, e) => {
    // Prevent navigation when clicking play button
    e.preventDefault();
    e.stopPropagation();
    
    if (currentlyPlaying === songId) {
      // Pause current song
      if (audioRefs.current[songId]) {
        audioRefs.current[songId].pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop previous song if playing
      if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
        audioRefs.current[currentlyPlaying].pause();
      }
      
      // Play new song
      if (audioRefs.current[songId]) {
        audioRefs.current[songId].play();
      } else {
        // Create new audio element if it doesn't exist
        const audio = new Audio(audioUrl);
        audioRefs.current[songId] = audio;
        audio.play();
      }
      
      setCurrentlyPlaying(songId);
    }
  };

  const handleAddToWishlist = async (songId, e) => {
    // Prevent navigation when clicking wishlist button
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please login to add songs to wishlist");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/wishlist/add/${songId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist(prev => [...prev, songId]);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const handleRemoveFromWishlist = async (songId, e) => {
    // Prevent navigation when clicking wishlist button
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/wishlist/remove/${songId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist(prev => prev.filter(id => id !== songId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleDownload = async (songId, e) => {
    // Prevent navigation when clicking download button
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Get the first track (full track) by default
      const song = songs.find(s => s._id === songId);
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {songs.map((song, index) => {
        const audioUrl = song.tracks[0]?.url;
        const isPlaying = currentlyPlaying === song._id;
        const duration = audioDurations[song._id] || 0;
        
        return (
          <motion.div
            key={song._id}
            variants={itemVariants}
            custom={index}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <Link href={`/music/${song._id}`} className="block">
              {/* Cover Image */}
              <div className="relative h-48 w-full bg-gray-700 group">
                {song.image ? (
                  <Image
                    src={song.image}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <FaMusic className="text-white text-4xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.button
                    onClick={(e) => togglePlay(song._id, audioUrl, e)}
                    className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
                  </motion.button>
                </div>
              </div>

              <div className="p-4">
                {/* Song Info */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white truncate">{song.title}</h3>
                  <p className="text-sm text-gray-400 truncate">By {song.artist}</p>
                </div>
                
                {/* Audio Player */}
                <div className="mb-4">
                  <audio 
                    src={audioUrl} 
                    preload="metadata"
                    onLoadedMetadata={(e) => handleMetadataLoaded(song._id, e.target.duration)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <FaClock className="mr-1" />
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={(e) => handleDownload(song._id, e)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Download"
                    >
                      <FaDownload size={18} />
                    </motion.button>
                    {user && (
                      <motion.button
                        onClick={(e) => 
                          wishlist.includes(song._id)
                            ? handleRemoveFromWishlist(song._id, e)
                            : handleAddToWishlist(song._id, e)
                        }
                        className={`transition-colors ${
                          wishlist.includes(song._id)
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={wishlist.includes(song._id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <FaHeart size={18} />
                      </motion.button>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {song.downloadCount || 0} downloads
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MusicGrid; 