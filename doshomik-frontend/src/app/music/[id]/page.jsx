"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StandardAudioPlayer from "@/components/StandardAudioPlayer";
import { FaMusic, FaDownload, FaUser, FaCalendar, FaTag } from "react-icons/fa";

export default function MusicDetailsPage() {
  const params = useParams();
  const [music, setMusic] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMusicDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/music/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch music details");
        const { data } = await response.json();
        setMusic(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMusicDetails();
  }, [params.id]);

  const handleDownload = async (songId, trackType) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/music/download/${songId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackType }),
      });

      if (!response.ok) throw new Error("Download failed");

      const { url } = await response.json();
      
      // Create a temporary link to download the file
      const a = document.createElement("a");
      a.href = url;
      a.download = `${music.title}-${trackType}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download track");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500 text-center">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!music) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500 text-center">
        <h2 className="text-2xl font-bold mb-2">Music Not Found</h2>
        <p>The requested music could not be found.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{music.title}</h1>
            <p className="text-xl text-gray-200">{music.artist}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
            <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              {music.image ? (
                <img 
                  src={music.image} 
                  alt={music.title} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FaMusic className="text-4xl text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>Uploaded by {music.uploadedBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="mr-2" />
                  <span>Added {new Date(music.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <FaTag className="mr-2" />
                  <span>{music.category}</span>
                </div>
                <div className="flex items-center">
                  <FaDownload className="mr-2" />
                  <span>{music.downloadCount} downloads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracks Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Tracks</h2>
            {music.tracks.map((track, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <StandardAudioPlayer
                  url={track.url}
                  trackType={track.type}
                  songId={music._id}
                  onDownload={handleDownload}
                  isActive={activeTrack === index}
                  onPlay={() => setActiveTrack(index)}
                  onPause={() => setActiveTrack(null)}
                  onFinish={() => setActiveTrack(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 