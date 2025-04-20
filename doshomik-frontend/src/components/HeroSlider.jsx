"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/react/24/solid';

// Import images from assets
import summerBeach from '../assets/summer-vibes.jpg';
import midnightDreams from '../assets/midnight-dreams.jpg';
import urbanBeats from '../assets/urban-beats.jpg';

const heroData = [
  {
    id: 1,
    title: "Summer Vibes",
    artist: "DJ Wave",
    image: summerBeach,
    link: "/track/summer-vibes",
    likes: 12500,
    waveform: [0.2, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.6, 0.4, 0.8]
  },
  {
    id: 2,
    title: "Midnight Dreams",
    artist: "Luna Beats",
    image: midnightDreams,
    link: "/track/midnight-dreams",
    likes: 8900,
    waveform: [0.5, 0.7, 0.3, 0.9, 0.4, 0.8, 0.6, 0.5, 0.7, 0.4]
  },
  {
    id: 3,
    title: "Urban Beats",
    artist: "City Sound",
    image: urbanBeats,
    link: "/track/urban-beats",
    likes: 15600,
    waveform: [0.3, 0.6, 0.8, 0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8]
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroData.length);
      }, 5000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroData.length) % heroData.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroData.length);
  };

  return (
    <div 
      className="relative w-full h-[80vh] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {heroData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <div className="max-w-4xl mx-auto w-full">
                  {/* Waveform Visualization */}
                  <div className="flex items-center gap-1 h-16 mb-6">
                    {slide.waveform.map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-orange-500/50 hover:bg-orange-500 transition-all duration-300"
                        style={{
                          height: `${height * 100}%`,
                          minHeight: '4px'
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-5xl font-bold mb-2">{slide.title}</h2>
                      <p className="text-xl text-gray-300 mb-4">{slide.artist}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePlayPause}
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/20"
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-7 h-7" />
                        ) : (
                          <PlayIcon className="w-7 h-7" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-6">
                    <Link
                      href={slide.link}
                      className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors font-medium shadow-lg hover:shadow-orange-500/20"
                    >
                      Listen Now
                    </Link>
                    <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                      <HeartIcon className="w-6 h-6" />
                      <span>{slide.likes.toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className={`absolute bottom-8 left-0 right-0 flex justify-center gap-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handlePrevSlide}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNextSlide}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className="h-full bg-orange-500 transition-all duration-1000"
          style={{
            width: `${((currentSlide + 1) / heroData.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}