"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import UploadForm from "@/components/UploadForm";
import { FaUpload } from "react-icons/fa";

export default function CreatorUploadPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user?.role !== "creator") {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  if (loading) return <div className="text-center p-8 text-gray-300">Loading...</div>;
  if (!user) return null;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
          <FaUpload className="w-5 h-5 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Upload a New Song</h1>
      </div>
      
      <div className="bg-gray-700 p-4 rounded-md mb-6">
        <p className="text-gray-300">
          Upload your music tracks here. You can provide the full track, vocal track, instrumental track, and a cover image.
          The full track is required, while the others are optional.
        </p>
      </div>
      
      <UploadForm />
    </div>
  );
}