"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaMusic, FaDownload, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMicrophone, FaGuitar, FaHeadphones } from "react-icons/fa";
import Image from "next/image";
import WaveSurfer from "wavesurfer.js";

export default function AllMusicList({ searchQuery = "", category = "", sortBy = "newest" }) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const waveformRefs = useRef({});
  const wavesurferRefs = useRef({});

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Using the correct endpoint for all songs
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/music/all`);
        console.log('API Response:', response.data); // Debug log
        
        if (response.data && response.data.data) {
          setSongs(response.data.data);
          setFilteredSongs(response.data.data);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Failed to load songs. Please try again later.');
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
        setError(error.response?.data?.message || 'Failed to load songs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    let result = [...songs];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (category && category !== "All") {
      result = result.filter((song) => song.category === category);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "downloads":
        result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        break;
      default:
        break;
    }

    setFilteredSongs(result);
  }, [songs, searchQuery, category, sortBy]);

  // Initialize WaveSurfer instances for each song and track
  useEffect(() => {
    // Clean up previous instances
    Object.values(wavesurferRefs.current).forEach(wavesurfer => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }
    });
    
    // Reset refs
    wavesurferRefs.current = {};
    
    // Create new instances
    filteredSongs.forEach(song => {
      if (song.tracks && song.tracks.length > 0) {
        song.tracks.forEach((track, index) => {
          const trackId = `${song._id}-${index}`;
          const container = waveformRefs.current[trackId];
          
          if (container && track.url) {
            const wavesurfer = WaveSurfer.create({
              container: container,
              waveColor: '#4a9eff',
              progressColor: '#1e40af',
              cursorColor: '#ffffff',
              barWidth: 2,
              barRadius: 3,
              responsive: true,
              height: 40, // Thinner height
              normalize: true,
              partialRender: true,
              interact: true,
            });
            
            wavesurfer.load(track.url);
            
            wavesurfer.on('ready', () => {
              console.log(`WaveSurfer for ${song.title} - ${track.type} is ready`);
            });
            
            wavesurfer.on('finish', () => {
              if (activeSong?._id === song._id && activeTrack === index) {
                setIsPlaying(false);
              }
            });
            
            wavesurferRefs.current[trackId] = wavesurfer;
          }
        });
      }
    });
    
    // Cleanup function
    return () => {
      Object.values(wavesurferRefs.current).forEach(wavesurfer => {
        if (wavesurfer) {
          wavesurfer.destroy();
        }
      });
    };
  }, [filteredSongs, activeSong, activeTrack]);

  const handleDownload = async (songId, trackIndex) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If no token, redirect to login
        window.location.href = '/login';
        return;
      }

      // Get the track type from the song's tracks array
      const song = songs.find(s => s._id === songId);
      const trackType = song.tracks[trackIndex].type;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/download/${songId}`,
        { trackType }, // Include trackType in request body
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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
        // If unauthorized, redirect to login
        window.location.href = '/login';
      }
    }
  };

  const togglePlay = (songId, trackIndex) => {
    const trackId = `${songId}-${trackIndex}`;
    const wavesurfer = wavesurferRefs.current[trackId];
    
    if (!wavesurfer) return;
    
    if (isPlaying && activeSong?._id === songId && activeTrack === trackIndex) {
      wavesurfer.pause();
      setIsPlaying(false);
    } else {
      // Pause any currently playing song/track
      if (activeSong && activeTrack !== null) {
        const currentTrackId = `${activeSong._id}-${activeTrack}`;
        if (wavesurferRefs.current[currentTrackId]) {
          wavesurferRefs.current[currentTrackId].pause();
        }
      }
      
      // Play the selected song/track
      wavesurfer.play();
      setIsPlaying(true);
      setActiveSong(songs.find(s => s._id === songId));
      setActiveTrack(trackIndex);
    }
  };

  const toggleMute = () => {
    if (activeSong && activeTrack !== null) {
      const trackId = `${activeSong._id}-${activeTrack}`;
      const wavesurfer = wavesurferRefs.current[trackId];
      
      if (wavesurfer) {
        if (isMuted) {
          wavesurfer.setVolume(volume);
          setIsMuted(false);
        } else {
          wavesurfer.setVolume(0);
          setIsMuted(true);
        }
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (activeSong && activeTrack !== null) {
      const trackId = `${activeSong._id}-${activeTrack}`;
      const wavesurfer = wavesurferRefs.current[trackId];
      
      if (wavesurfer) {
        wavesurfer.setVolume(newVolume);
        if (isMuted) {
          setIsMuted(false);
        }
      }
    }
  };

  const getTrackIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'vocal':
        return <FaMicrophone className="text-pink-400" />;
      case 'instrumental':
        return <FaGuitar className="text-green-400" />;
      default:
        return <FaHeadphones className="text-blue-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaMusic className="w-8 h-8 text-red-200" />
        </div>
        <h3 className="text-lg font-medium text-red-200 mb-2">Error Loading Songs</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaMusic className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-200 mb-2">No songs found</h3>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {filteredSongs.map((song) => {
        const isActive = activeSong && activeSong._id === song._id;
        
        return (
          <div 
            key={song._id} 
            className={`bg-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:bg-gray-600 ${
              isActive ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Cover Image */}
              <div className="relative h-48 md:h-auto md:w-48 bg-gray-800">
                {song.image ? (
                  <Image
                    src={song.image}
                    alt={song.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <FaMusic className="text-white text-4xl" />
                  </div>
                )}
              </div>

              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{song.title}</h3>
                    <p className="text-gray-400">{song.artist}</p>
                    {song.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded-full mt-2">
                        {song.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <div className="flex items-center text-sm text-gray-400 mr-4">
                      <FaDownload className="mr-1" />
                      <span>{song.downloadCount || 0} downloads</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(song._id, 0);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
                
                {/* Tracks List */}
                {song.tracks && song.tracks.length > 0 ? (
                  <div className="space-y-3">
                    {song.tracks.map((track, index) => {
                      const trackId = `${song._id}-${index}`;
                      const isTrackActive = isActive && activeTrack === index;
                      const isCurrentlyPlaying = isPlaying && isTrackActive;
                      
                      return (
                        <div key={trackId} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="mr-2">
                                {getTrackIcon(track.type)}
                              </div>
                              <span className="text-white font-medium capitalize">{track.type || 'Main'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => togglePlay(song._id, index)}
                                className="text-white hover:text-blue-400 transition-colors bg-blue-600 hover:bg-blue-700 rounded-full p-2"
                              >
                                {isCurrentlyPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(song._id, index);
                                }}
                                className="text-white hover:text-green-400 transition-colors bg-green-600 hover:bg-green-700 rounded-full p-2"
                                title={`Download ${track.type || 'Main'} version`}
                              >
                                <FaDownload size={16} />
                              </button>
                              
                              {isTrackActive && (
                                <div className="flex items-center">
                                  <button 
                                    onClick={toggleMute}
                                    className="text-white hover:text-blue-400 transition-colors mr-2"
                                  >
                                    {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                                  </button>
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01" 
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div 
                            ref={el => waveformRefs.current[trackId] = el} 
                            className="w-full h-10"
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-3 text-center text-gray-400">
                    No audio tracks available
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}