"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaUser, FaUsers, FaMusic, FaDownload } from "react-icons/fa";

export default function AdminProfile() {
  const { user, token, loading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalSongs: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    if (user && token) {
      fetchAdminStats();
    }
  }, [user, token]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Admin since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
            </div>
            <h3 className="text-gray-600">Total Users</h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalCreators}</span>
            </div>
            <h3 className="text-gray-600">Total Creators</h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaMusic className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalSongs}</span>
            </div>
            <h3 className="text-gray-600">Total Songs</h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaDownload className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</span>
            </div>
            <h3 className="text-gray-600">Total Downloads</h3>
          </div>
        </div>
      </div>
    </div>
  );
} 