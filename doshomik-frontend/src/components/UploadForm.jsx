"use client";
import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { FaMusic, FaMicrophone, FaGuitar, FaImage, FaUpload } from "react-icons/fa";

export default function UploadForm() {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({ title: "", artist: "", category: "All" });
  const [files, setFiles] = useState({ fullTrack: null, vocalTrack: null, instrumentalTrack: null, image: null });
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const validateFile = (file, type) => {
    if (!file) return true;
    
    if (file.size > MAX_FILE_SIZE) {
      setError(`${type} file size must be less than 10MB`);
      return false;
    }

    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      setError('Cover image must be JPEG, PNG or WebP');
      return false;
    }
    
    if (type !== 'image' && !allowedAudioTypes.includes(file.type)) {
      setError(`${type} file must be MP3, WAV or OGG`);
      return false;
    }

    return true;
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    if (!validateFile(file, e.target.name)) {
      e.target.value = '';
      return;
    }

    setFiles({ ...files, [e.target.name]: file });

    // Create preview for image
    if (e.target.name === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!files.fullTrack) {
      setError("Full track is required");
      return;
    }

    if (!files.image) {
      setError("Cover image is required");
      return;
    }

    // Validate all files before upload
    const fileTypes = Object.keys(files);
    for (const type of fileTypes) {
      if (files[type] && !validateFile(files[type], type)) {
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("artist", form.artist);
    formData.append("category", form.category);
    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key]);
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setMessage("Uploading...");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setMessage("✅ Upload successful! Your track will be available shortly.");
      setForm({ title: "", artist: "", category: "All" });
      setFiles({ fullTrack: null, vocalTrack: null, instrumentalTrack: null, image: null });
      setPreview(null);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🎵 Upload Your Music</h2>
        <p className="text-gray-300">Share your music with the world</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded ${
          message.includes("success") ? "bg-green-900/50 text-green-200" : "bg-blue-900/50 text-blue-200"
        }`}>
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded bg-red-900/50 text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter song title"
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Artist</label>
            <input
              name="artist"
              value={form.artist}
              onChange={handleChange}
              placeholder="Enter artist name"
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="All">All</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="Electronic">Electronic</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Folk">Folk</option>
            <option value="Ambient">Ambient</option>
            <option value="R&B">R&B</option>
            <option value="Country">Country</option>
            <option value="Blues">Blues</option>
            <option value="Reggae">Reggae</option>
          </select>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">🎵 Audio Tracks</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-200 mb-2">
                  <FaMusic className="mr-2" /> Full Track (Required)
                </label>
                <input
                  type="file"
                  name="fullTrack"
                  accept="audio/*"
                  onChange={handleFileChange}
                  required
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-200 mb-2">
                  <FaMicrophone className="mr-2" /> Vocal Track (Optional)
                </label>
                <input
                  type="file"
                  name="vocalTrack"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-200 mb-2">
                  <FaGuitar className="mr-2" /> Instrumental Track (Optional)
                </label>
                <input
                  type="file"
                  name="instrumentalTrack"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">🖼️ Cover Image</h3>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-200 mb-2">
                <FaImage className="mr-2" /> Upload Cover Image (Required)
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Cover preview"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300 text-center">{uploadProgress}% uploaded</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className={`w-full flex items-center justify-center space-x-2 p-4 rounded-lg text-white font-semibold ${
            isUploading
              ? "bg-blue-500/50 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 transition-colors"
          }`}
        >
          <FaUpload />
          <span>{isUploading ? "Uploading..." : "Upload Track"}</span>
        </button>
      </form>
    </div>
  );
}