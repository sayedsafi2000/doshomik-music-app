"use client";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

const MusicList = () => {
  const { token } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/my-uploads`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSongs(res.data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSongs();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/music/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSongs();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/music/download/${id}`);
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Download Error:", err);
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="space-y-6">
      {songs.length === 0 ? (
        <p className="text-center text-gray-500">No songs uploaded yet.</p>
      ) : (
        songs.map((song) => (
          <div key={song._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="font-bold text-lg">{song.title}</h2>
                <p className="text-sm text-gray-500">Artist: {song.artist}</p>
              </div>
              <p className="text-sm text-gray-600">
                Downloads: {song.downloadCount || 0}
              </p>
            </div>

            <div className="flex gap-4 mb-3">
              <Link href={`/dashboard/creator/edit/${song._id}`} className="text-blue-600">
                ✏️ Edit
              </Link>              <button onClick={() => handleDelete(song._id)} className="text-red-600">🗑️ Delete</button>
            </div>

            <div className="space-y-2">
              {song.tracks.map((track) => (
                <div key={track._id} className="bg-gray-100 p-2 rounded">
                  <p className="text-sm font-medium capitalize">{track.type}</p>
                  <audio controls src={track.url} className="w-full mt-2" />
                  <button
                    onClick={() => handleDownload(song._id)}
                    className="text-blue-600 text-sm underline mt-1"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MusicList;