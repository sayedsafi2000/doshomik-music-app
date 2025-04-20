"use client"
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [music, setMusic] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMusic: 0,
    totalCreators: 0,
    totalDownloads: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserMusic, setSelectedUserMusic] = useState([]);
  const [selectedUserDownloads, setSelectedUserDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    // Only redirect if auth is loaded and user is not admin
    if (!authLoading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      
      if (user.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      
      fetchData();
    }
  }, [activeTab, user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug token and user
      console.log("Token:", token);
      console.log("User:", user);

      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        return;
      }

      if (activeTab === "users" || activeTab === "overview") {
        const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data.users);
      }

      if (activeTab === "music" || activeTab === "overview") {
        const musicRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/music`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMusic(musicRes.data.music);
      }

      // Fetch stats
      const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleDeleteMusic = async (musicId) => {
    if (window.confirm("Are you sure you want to delete this music?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/music/${musicId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting music:", error);
      }
    }
  };

  const handleToggleCreator = async (userId) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/toggle-creator`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error("Error toggling creator status:", error);
    }
  };

  const handleViewUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User details response:", response.data);
      setSelectedUser(response.data.user);
      setSelectedUserMusic(response.data.music || []);
      setSelectedUserDownloads(response.data.downloadHistory || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to fetch user details. Please try again later.");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      {authLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-white">Admin Dashboard</h1>
            <p className="text-gray-300">Welcome back, {user?.name}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded ${
                activeTab === "overview" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded ${
                activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("music")}
              className={`px-4 py-2 rounded ${
                activeTab === "music" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Music
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Music</h3>
                    <p className="text-3xl font-bold text-green-400">{stats.totalMusic}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Creators</h3>
                    <p className="text-3xl font-bold text-purple-400">{stats.totalCreators}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Downloads</h3>
                    <p className="text-3xl font-bold text-orange-400">{stats.totalDownloads}</p>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="creator">Creators</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-gray-700">
                            <th className="pb-2 text-gray-300">Name</th>
                            <th className="pb-2 text-gray-300">Email</th>
                            <th className="pb-2 text-gray-300">Role</th>
                            <th className="pb-2 text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user._id} className="border-b border-gray-700">
                              <td className="py-2 text-gray-300">{user.name}</td>
                              <td className="py-2 text-gray-300">{user.email}</td>
                              <td className="py-2 text-gray-300">{user.role}</td>
                              <td className="py-2">
                                <button
                                  onClick={() => handleViewUserDetails(user._id)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Music Tab */}
              {activeTab === "music" && (
                <div className="space-y-4">
                  {music.map((song) => (
                    <div key={song._id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{song.title}</h3>
                          <p className="text-gray-300">By {song.artist}</p>
                          <p className="text-sm text-gray-400">Uploaded by: {song.uploadedBy?.name}</p>
                          <p className="text-sm text-gray-400">Downloads: {song.downloadCount || 0}</p>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleDeleteMusic(song._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        {song.tracks.map((track) => (
                          <div key={track._id} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg mt-2">
                            <span className="capitalize text-gray-300">{track.type}:</span>
                            <audio controls src={track.url} className="w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-300">Basic Information</h3>
                    <p className="text-gray-300">Name: {selectedUser.name}</p>
                    <p className="text-gray-300">Email: {selectedUser.email}</p>
                    <p className="text-gray-300">Role: {selectedUser.role}</p>
                    <p className="text-gray-300">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedUser.role === "creator" && (
                    <div>
                      <h3 className="font-semibold text-gray-300">Uploaded Music</h3>
                      <div className="space-y-2">
                        {selectedUserMusic.length > 0 ? (
                          selectedUserMusic.map((song) => (
                            <div key={song._id} className="bg-gray-700 p-2 rounded">
                              <p className="font-medium text-gray-200">{song.title}</p>
                              <p className="text-sm text-gray-400">Downloads: {song.downloadCount || 0}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400">No music uploaded yet</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-300">Download History</h3>
                    <div className="space-y-2">
                      {selectedUserDownloads.length > 0 ? (
                        selectedUserDownloads.map((song) => (
                          <div key={song._id} className="bg-gray-700 p-2 rounded">
                            <p className="font-medium text-gray-200">{song.title}</p>
                            <p className="text-sm text-gray-400">
                              Downloaded: {new Date(song.downloadedAt || song.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No download history</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 