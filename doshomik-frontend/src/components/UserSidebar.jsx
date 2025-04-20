"use client";
import Link from "next/link";

export default function UserSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
      <h2 className="text-xl font-bold">👤 User Panel</h2>
      <ul className="space-y-2 text-sm">
        <li><Link href="/dashboard/user" className="hover:underline">🏠 Overview</Link></li>
        <li><Link href="/dashboard/user/wishlist" className="hover:underline">❤️ Wishlist</Link></li>
        <li><Link href="/dashboard/user/downloads" className="hover:underline">📥 Downloads</Link></li>
        <li><Link href="/dashboard/user/profile" className="hover:underline">👤 Profile</Link></li>
      </ul>
    </aside>
  );
}