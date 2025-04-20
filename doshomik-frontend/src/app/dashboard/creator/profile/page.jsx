"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaUser, FaMusic, FaDownload, FaStar, FaHeadphones } from "react-icons/fa";

export default function CreatorProfile() {
  const { user, token, loading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    averageRating: 0,
    totalListens: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user?.role !== "creator") {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchCreatorStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/creator/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching creator stats:", error);
        setError("Failed to load statistics. Please try again later.");
      }
    };

    if (user && token) {
      fetchCreatorStats();
    }
  }, [user, token]);

  if (loading) return <div className="text-center p-8 text-gray-300">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
              <FaUser className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-300">{user.email}</p>
              <p className="text-sm text-gray-400">Creator since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
                <FaDownload className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalDownloads}</span>
            </div>
            <h3 className="text-gray-300">Total Downloads</h3>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-900 rounded-full flex items-center justify-center">
                <FaStar className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</span>
            </div>
            <h3 className="text-gray-300">Average Rating</h3>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                <FaHeadphones className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalListens}</span>
            </div>
            <h3 className="text-gray-300">Total Listens</h3>
          </div>
        </div>
      </div>
    </div>
  );
}