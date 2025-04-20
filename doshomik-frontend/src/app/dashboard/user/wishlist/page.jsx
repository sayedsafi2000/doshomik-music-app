"use client";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export default function WishlistPage() {
  const { token } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data.wishlist || []);
    };

    if (token) fetchWishlist();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">💖 My Wishlist</h2>
        {wishlist.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-300">No songs in wishlist.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {wishlist.map((song) => (
              <div key={song._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">{song.title}</h3>
                <p className="text-gray-300 mb-4">{song.artist}</p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <audio 
                    controls 
                    src={song.tracks.find(t => t.type === "full")?.url} 
                    className="w-full" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}