"use client";
import { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-xl font-bold mb-6">🎛 Dashboard</h2>
      <ul className="space-y-4 text-sm">
        <li><Link href="/dashboard" className="hover:underline">🏠 Overview</Link></li>

        {user?.role === "creator" && (
          <>
            <li><Link href="/dashboard/creator/upload">➕ Upload</Link></li>
            <li><Link href="/dashboard/creator/my-uploads">🎧 My Songs</Link></li>
          </>
        )}

        {user?.role === "user" && (
          <>
            <li><Link href="/dashboard/user/profile">👤 Profile</Link></li>
            <li><Link href="/dashboard/user/wishlist">❤️ Wishlist</Link></li>
            <li><Link href="/dashboard/user/downloads">📥 Download History</Link></li>
            <li><Link href="/dashboard/user/playlists">🎼 My Playlists</Link></li>
          </>
        )}
      </ul>
    </aside>
  );
}