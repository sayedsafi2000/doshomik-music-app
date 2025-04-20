"use client";
import { useEffect, useState, useContext } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export default function CreatorDetails() {
  const { token } = useContext(AuthContext);
  const { id } = useParams();

  const [creator, setCreator] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/creator/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCreator(res.data.creator || null);
        setSongs(res.data.songs || []);
      } catch (err) {
        console.error("Error loading creator", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCreator();
  }, [token, id]);

  if (loading) return <p className="p-6">Loading creator data...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">👤 Creator Profile</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p><strong>Name:</strong> {creator?.name}</p>
        <p><strong>Email:</strong> {creator?.email}</p>
        <p><strong>Role:</strong> {creator?.role}</p>
        <p><strong>Joined:</strong> {new Date(creator?.createdAt).toLocaleDateString()}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">🎧 Uploaded Songs</h2>

        {songs.length === 0 ? (
          <p className="text-sm text-gray-500">No uploads yet.</p>
        ) : (
          songs.map((song) => (
            <div key={song._id} className="bg-white p-4 mb-4 rounded shadow">
              <h3 className="font-bold">{song.title}</h3>
              <p>Artist: {song.artist}</p>
              <p className="text-xs text-gray-400">
                Uploaded on: {new Date(song.createdAt).toLocaleDateString()}
              </p>

              <div className="mt-3 space-y-2">
                {song.tracks.map((track) => (
                  <div key={track._id} className="bg-gray-100 p-2 rounded">
                    <p className="font-semibold">{track.type}</p>
                    <audio controls src={track.url} className="w-full mt-1" />
                    <a
                      href={track.url}
                      download
                      className="text-blue-600 text-sm underline mt-1 inline-block"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}