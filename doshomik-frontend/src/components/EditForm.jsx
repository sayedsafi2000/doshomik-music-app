"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";

export default function EditForm({ songId }) {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [form, setForm] = useState({ title: "", artist: "" });
  const [files, setFiles] = useState({ full: null, vocal: null, instrumental: null });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSong = async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/music/my-uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const song = res.data.data.find((s) => s._id === songId);
      if (song) {
        setForm({ title: song.title, artist: song.artist });
      }
    };
    if (token) fetchSong();
  }, [songId, token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("artist", form.artist);

    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key]);
    });

    try {
      setMessage("Updating...");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/edit/${songId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("✅ Updated successfully");
      router.push("/dashboard/creator/my-uploads");
    } catch (err) {
      console.error(err);
      setMessage("❌ Update failed");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">✏️ Edit Your Song</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="artist"
          value={form.artist}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <div className="space-y-2 text-sm text-gray-600">
          <label>🎵 Upload new FULL track (optional)</label>
          <input type="file" name="full" onChange={handleFileChange} accept="audio/*" />
          <label>🎤 Upload new VOCAL (optional)</label>
          <input type="file" name="vocal" onChange={handleFileChange} accept="audio/*" />
          <label>🎹 Upload Instrumental (optional)</label>
          <input type="file" name="instrumental" onChange={handleFileChange} accept="audio/*" />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}