"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaUser, FaDownload, FaHeart, FaMusic } from "react-icons/fa";

export default function UserProfile() {
    const { user, token, loading } = useContext(AuthContext);
    const router = useRouter();
    const [stats, setStats] = useState({
        totalDownloads: 0,
        wishlistCount: 0,
        playlistCount: 0
    });

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading]);

    useEffect(() => {
        const fetchStats = async () => {
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
                const downloadCount = profileResponse.data.user?.downloadHistory?.length || 0;
                const playlistCount = profileResponse.data.user?.playlists?.length || 0;
                
                setStats({
                    totalDownloads: downloadCount,
                    wishlistCount: wishlistCount,
                    playlistCount: playlistCount
                });
            } catch (error) {
                console.error("Error fetching user stats:", error);
            }
        };

        if (user && token) {
            fetchStats();
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
                            <p className="text-sm text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div className="w-12 h-12 bg-pink-900 rounded-full flex items-center justify-center">
                                <FaHeart className="w-6 h-6 text-pink-400" />
                            </div>
                            <span className="text-2xl font-bold text-white">{stats.wishlistCount}</span>
                        </div>
                        <h3 className="text-gray-300">Wishlist Items</h3>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
                                <FaMusic className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-2xl font-bold text-white">{stats.playlistCount}</span>
                        </div>
                        <h3 className="text-gray-300">Playlists Created</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
