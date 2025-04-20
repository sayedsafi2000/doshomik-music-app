"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaDownload, FaMicrophone, FaGuitar, FaHeadphones } from "react-icons/fa";

export default function StandardAudioPlayer({ 
  url, 
  trackType,
  songId,
  onPlay, 
  onPause, 
  onFinish,
  onDownload,
  initialVolume = 0.7,
  height = 30,
  waveColor = '#4a90e2',
  progressColor = '#2c5282',
  cursorColor = '#1a365d',
  barWidth = 2,
  barGap = 1,
  barRadius = 3,
  containerClassName = "",
  showControls = true,
  isActive = false
}) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    // Create new instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      barWidth,
      barGap,
      barRadius,
      height,
      responsive: true,
      normalize: true,
      partialRender: true,
      hideScrollbar: true,
      interact: true,
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(url);
    wavesurfer.setVolume(volume);

    // Event listeners
    wavesurfer.on('play', () => {
      setIsPlaying(true);
      onPlay?.();
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
      onPause?.();
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      onFinish?.();
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [url]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        wavesurferRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
      setVolume(newVolume);
      if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const getTrackIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'vocal':
        return <FaMicrophone className="text-pink-400" />;
      case 'instrumental':
        return <FaGuitar className="text-green-400" />;
      default:
        return <FaHeadphones className="text-blue-400" />;
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${containerClassName}`}>
      <div className="flex items-center space-x-2">
        {trackType && (
          <div className="mr-1">
            {getTrackIcon(trackType)}
          </div>
        )}
        
        {showControls && (
          <button
            onClick={togglePlayPause}
            className={`text-white hover:text-blue-400 transition-colors rounded-full p-1.5 ${
              isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
          </button>
        )}
      </div>
      
      <div ref={containerRef} className="flex-1" />
      
      <div className="flex items-center space-x-2">
        {onDownload && (
          <button
            onClick={() => onDownload(songId, trackType)}
            className="text-white hover:text-green-400 transition-colors bg-green-600 hover:bg-green-700 rounded-full p-1.5"
            title={`Download ${trackType || 'track'}`}
          >
            <FaDownload size={12} />
          </button>
        )}
        
        {showControls && isActive && (
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
} 