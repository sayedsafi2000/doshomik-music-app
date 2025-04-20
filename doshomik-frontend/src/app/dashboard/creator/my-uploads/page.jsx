"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { FaMusic, FaDownload, FaEdit, FaTrash } from "react-icons/fa";
import Image from "next/image";
import AudioPlayer from "@/components/AudioPlayer";

export default function MyUploadsPage() {
  const { user, token, loading } = useContext(AuthContext);
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    totalListens: 0
  });
  const [activeSong, setActiveSong] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user?.role !== "creator") {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const songsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/music/my-uploads`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSongs(songsRes.data.data || []);

        const statsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/creator/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchData();
    }
  }, [user, token]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/music/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSongs(songs.filter(song => song._id !== id));
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const handleDownload = async (id, trackType) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/download/${id}`,
        { trackType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const link = document.createElement('a');
      link.href = res.data.url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  const handlePlay = (songId, trackType) => {
    setActiveSong(songId);
    setActiveTrack(trackType);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-6">🎵 My Uploaded Songs</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                  <FaMusic className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalUploads}</span>
              </div>
              <h3 className="text-gray-300">Total Uploads</h3>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                  <FaDownload className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalDownloads}</span>
              </div>
              <h3 className="text-gray-300">Total Downloads</h3>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
                  <FaMusic className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalListens}</span>
              </div>
              <h3 className="text-gray-300">Total Listens</h3>
            </div>
          </div>
        </div>

        {/* Songs List */}
        {songs.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMusic className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No songs uploaded yet</h3>
            <p className="text-gray-300 mb-4">Start by uploading your first song</p>
            <button
              onClick={() => router.push('/dashboard/creator/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload a Song
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {songs.map((song) => (
              <div key={song._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Cover Image */}
                  <div className="relative h-48 md:h-auto md:w-48 bg-gray-700">
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

                  {/* Song Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">{song.title}</h2>
                        <p className="text-gray-300">{song.artist}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/creator/edit/${song._id}`)}
                          className="p-2 text-gray-300 hover:text-white"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(song._id)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-300">Downloads</p>
                        <p className="text-lg font-semibold text-white">{song.downloadCount || 0}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-300">Plays</p>
                        <p className="text-lg font-semibold text-white">{song.playCount || 0}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-300">Added</p>
                        <p className="text-lg font-semibold text-white">
                          {new Date(song.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-300">Category</p>
                        <p className="text-lg font-semibold text-white">{song.category}</p>
                      </div>
                    </div>

                    {/* Tracks */}
                    <div className="space-y-4">
                      {song.tracks.map((track, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 capitalize">{track.type}</span>
                            <button
                              onClick={() => handleDownload(song._id, track.type)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <FaDownload />
                            </button>
                          </div>
                          <AudioPlayer
                            url={track.url}
                            isActive={activeSong === song._id && activeTrack === index}
                            onPlay={() => {
                              setActiveSong(song._id);
                              setActiveTrack(index);
                            }}
                            onPause={() => {
                              setActiveSong(null);
                              setActiveTrack(null);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}