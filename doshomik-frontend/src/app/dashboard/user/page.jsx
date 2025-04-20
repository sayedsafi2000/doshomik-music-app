"use client";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { FaDownload, FaHeart, FaUser, FaMusic } from "react-icons/fa";
import Link from "next/link";

export default function ProfilePage() {
  const { user, token } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState({
    downloads: 0,
    wishlist: 0,
    recentDownloads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch wishlist count
        const wishlistResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/wishlist`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Fetch user profile for download history
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const wishlistCount = wishlistResponse.data.wishlist?.length || 0;
        const downloadHistory = profileResponse.data.user?.downloadHistory || [];
        const downloadCount = downloadHistory.length;
        
        // Get the 5 most recent downloads
        const recentDownloads = downloadHistory
          .sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt))
          .slice(0, 5);
        
        setStats({
          downloads: downloadCount,
          wishlist: wishlistCount,
          recentDownloads
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setLoading(false);
      }
    };

    if (token) {
      fetchUserStats();
    }
  }, [token]);

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Profile updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      setMsg("Failed to update profile");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-700 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
              <FaUser className="w-10 h-10 text-blue-400" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700 text-white text-xl font-bold px-3 py-2 rounded-md w-full mb-2"
              />
              <p className="text-gray-400">{user?.email}</p>
              <button
                onClick={handleSave}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              {msg && <p className="mt-2 text-green-400">{msg}</p>}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                <FaDownload className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.downloads}</span>
            </div>
            <h3 className="text-gray-300">Total Downloads</h3>
            <Link href="/dashboard/user/downloads" className="mt-4 text-blue-400 hover:text-blue-300 inline-block">
              View Download History →
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
                <FaHeart className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.wishlist}</span>
            </div>
            <h3 className="text-gray-300">Wishlist Items</h3>
            <Link href="/dashboard/user/wishlist" className="mt-4 text-blue-400 hover:text-blue-300 inline-block">
              View Wishlist →
            </Link>
          </div>
        </div>

        {/* Recent Downloads */}
        {stats.recentDownloads.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Downloads</h2>
            <div className="space-y-4">
              {stats.recentDownloads.map((download, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <FaMusic className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-medium">{download.song?.title || "Unknown Track"}</h3>
                      <p className="text-sm text-gray-400">
                        Downloaded on {new Date(download.downloadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}