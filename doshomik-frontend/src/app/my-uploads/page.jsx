"use client";
import { useEffect, useState } from "react";
import StandardAudioPlayer from "@/components/StandardAudioPlayer";
import { FaMusic } from "react-icons/fa";

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/music/my-uploads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch uploads");
        const data = await response.json();
        setUploads(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

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
      a.download = `${songId}-${trackType}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download track");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!uploads.length) return <div>No uploads found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Uploads</h1>
        <div className="grid gap-6">
          {uploads.map((music) => (
            <div key={music._id} className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FaMusic className="text-4xl text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{music.title}</h2>
                  <p className="text-gray-300">{music.artist}</p>
                </div>
              </div>

              <div className="space-y-4">
                {music.tracks.map((track, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <StandardAudioPlayer
                      url={track.url}
                      trackType={track.type}
                      songId={music._id}
                      onDownload={handleDownload}
                      isActive={activeTrack === `${music._id}-${index}`}
                      onPlay={() => setActiveTrack(`${music._id}-${index}`)}
                      onPause={() => setActiveTrack(null)}
                      onFinish={() => setActiveTrack(null)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 