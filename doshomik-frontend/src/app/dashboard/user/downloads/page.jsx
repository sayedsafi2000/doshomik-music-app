"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { FaMusic, FaCalendar, FaDownload, FaUser, FaTag } from "react-icons/fa";
import Image from "next/image";

export default function DownloadsPage() {
  const { token } = useContext(AuthContext);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let downloadHistory = response.data.user?.downloadHistory || [];
        
        // Sort the downloads based on user preference
        downloadHistory = downloadHistory.sort((a, b) => {
          if (sortBy === "newest") {
            return new Date(b.downloadedAt) - new Date(a.downloadedAt);
          }
          return new Date(a.downloadedAt) - new Date(b.downloadedAt);
        });

        setDownloads(downloadHistory);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching downloads:", err);
        setError("Failed to load download history");
        setLoading(false);
      }
    };

    if (token) {
      fetchDownloads();
    }
  }, [token, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-700 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Download History</h1>
            <p className="text-gray-400">
              {downloads.length} {downloads.length === 1 ? "track" : "tracks"} downloaded
            </p>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaDownload className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Downloads Yet</h3>
            <p className="text-gray-400">
              Your download history will appear here once you download some tracks.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((download, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {download.song?.image ? (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                      <Image
                        src={download.song.image}
                        alt={download.song.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      <FaMusic className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {download.song?.title || "Unknown Track"}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-gray-400 text-sm">
                        <FaUser className="w-4 h-4 mr-1" />
                        <span>{download.song?.artist || "Unknown Artist"}</span>
                      </div>
                      {download.song?.category && (
                        <div className="flex items-center text-gray-400 text-sm">
                          <FaTag className="w-4 h-4 mr-1" />
                          <span>{download.song.category}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-400 text-sm">
                        <FaCalendar className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(download.downloadedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
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