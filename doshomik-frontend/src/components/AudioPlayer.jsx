"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

export default function AudioPlayer({ 
  url, 
  onPlay, 
  onPause, 
  onFinish,
  initialVolume = 0.7,
  height = 40,
  waveColor = '#4a90e2',
  progressColor = '#2c5282',
  cursorColor = '#1a365d',
  barWidth = 2,
  barGap = 1,
  barRadius = 3,
  containerClassName = "",
  showControls = true
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
      const newMutedState = !isMuted;
      wavesurferRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
      setVolume(newVolume);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${containerClassName}`}>
      {showControls && (
        <button
          onClick={togglePlayPause}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
        </button>
      )}
      
      <div ref={containerRef} className="flex-1" />
      
      {showControls && (
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
} 