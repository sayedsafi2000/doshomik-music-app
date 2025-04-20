"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { FaEdit, FaMusic } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function EditSongPage({ params }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    category: "",
  });
  const [files, setFiles] = useState({
    fullTrack: null,
    vocalTrack: null,
    instrumentalTrack: null,
    image: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user?.role !== "creator") {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchSong();
    }
  }, [user, params.id]);

  const fetchSong = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/music/${params.id}`);
      const songData = response.data.data;
      
      // Verify ownership
      if (songData.uploadedBy._id !== user._id) {
        toast.error("You don't have permission to edit this song");
        router.push("/dashboard/creator/my-uploads");
        return;
      }

      setSong(songData);
      setFormData({
        title: songData.title,
        artist: songData.artist,
        category: songData.category,
      });
      setPreview(songData.image);
    } catch (error) {
      console.error("Error fetching song:", error);
      toast.error("Failed to load song");
      router.push("/dashboard/creator/my-uploads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles({
        ...files,
        [name]: fileList[0],
      });

      if (name === "image") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(fileList[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add files only if they are selected
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/music/${params.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        }
      );

      if (response.data) {
        toast.success("Song updated successfully");
        router.push("/dashboard/creator/my-uploads");
      }
    } catch (error) {
      console.error("Error updating song:", error);
      toast.error(error.response?.data?.message || "Failed to update song");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !song) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FaEdit className="w-5 h-5 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Song</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artist
            </label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Track
            </label>
            <input
              type="file"
              name="fullTrack"
              onChange={handleFileChange}
              accept="audio/*"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vocal Track (Optional)
            </label>
            <input
              type="file"
              name="vocalTrack"
              onChange={handleFileChange}
              accept="audio/*"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instrumental Track (Optional)
            </label>
            <input
              type="file"
              name="instrumentalTrack"
              onChange={handleFileChange}
              accept="audio/*"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image Preview
            </label>
            <img
              src={preview}
              alt="Cover preview"
              className="w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/creator/my-uploads")}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Song"}
          </button>
        </div>
      </form>
    </div>
  );
} 