"use client";
import { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">🎛 Dashboard</h1>
      
      <ul className="space-y-4 text-sm">

        <li>
          <Link href="/dashboard" className="hover:text-blue-400">
            🏠 Overview
          </Link>
        </li>

        {user?.role === "creator" && (
          <>
            <li>
              <Link href="/dashboard/creator/upload" className="hover:text-blue-400">
                ➕ Upload Music
              </Link>
            </li>
            <li>
              <Link href="/dashboard/creator/my-uploads" className="hover:text-blue-400">
                🎵 My Songs
              </Link>
            </li>
          </>
        )}

        {user?.role === "user" && (
          <>
            <li>
              <Link href="/dashboard/user/downloads" className="hover:text-blue-400">
                📥 Download History
              </Link>
            </li>
            <li>
              <Link href="/dashboard/user/wishlist" className="hover:text-blue-400">
                ❤️ My Wishlist
              </Link>
            </li>
            <li>
              <Link href="/dashboard/user/profile" className="hover:text-blue-400">
                👤 Edit Profile
              </Link>
            </li>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <li>
              <Link href="/dashboard/admin/users" className="hover:text-blue-400">
                👥 All Users
              </Link>
            </li>
            <li>
              <Link href="/dashboard/admin/songs" className="hover:text-blue-400">
                📁 All Songs
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}