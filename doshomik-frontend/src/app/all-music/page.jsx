"use client";
import { useState } from "react";
import AllMusicList from "@/components/AllMusicList";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

export default function AllMusicPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "All",
    "Pop",
    "Rock",
    "Hip Hop",
    "Classical",
    "Electronic",
    "Jazz",
    "Folk",
    "Country",
    "R&B",
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Music Library</h1>
            <p className="text-xl text-gray-200">Discover and enjoy amazing music</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or artist..."
                  className="w-full md:w-80 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="downloads">Most Downloads</option>
              </select>
              
              {(searchQuery || selectedCategory !== "") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory) && (
            <div className="flex flex-wrap items-center">
              <span className="text-sm text-gray-400 mr-2">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-200 mr-2 mb-2">
                  Search: {searchQuery}
                </span>
              )}
              {selectedCategory && selectedCategory !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900 text-purple-200 mr-2 mb-2">
                  Category: {selectedCategory}
                </span>
              )}
            </div>
          )}
        </div>

        {/* AllMusicList Component */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <AllMusicList 
            searchQuery={searchQuery}
            category={selectedCategory}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  );
}