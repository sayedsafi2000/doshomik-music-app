"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { 
  FaUser, 
  FaMusic, 
  FaHeart, 
  FaDownload, 
  FaUpload, 
  FaUsers, 
  FaCog, 
  FaChartBar,
  FaSignOutAlt
} from "react-icons/fa";

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useContext(AuthContext);
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    // Set active link based on current path
    const path = window.location.pathname;
    setActiveLink(path);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    const commonLinks = [
      { href: `/dashboard/${user.role}/profile`, label: "Profile", icon: <FaUser /> },
    ];

    switch (user.role) {
      case "admin":
        return [
          ...commonLinks,
          { href: "/dashboard/admin/users", label: "Users", icon: <FaUsers /> },
          { href: "/dashboard/admin/music", label: "Music", icon: <FaMusic /> },
          { href: "/dashboard/admin/stats", label: "Statistics", icon: <FaChartBar /> },
          { href: "/dashboard/admin/settings", label: "Settings", icon: <FaCog /> },
        ];
      case "creator":
        return [
          ...commonLinks,
          { href: "/dashboard/creator/upload", label: "Upload", icon: <FaUpload /> },
          { href: "/dashboard/creator/my-uploads", label: "My Uploads", icon: <FaMusic /> },
          { href: "/dashboard/creator/stats", label: "Statistics", icon: <FaChartBar /> },
          { href: "/dashboard/creator/settings", label: "Settings", icon: <FaCog /> },
        ];
      case "user":
        return [
          ...commonLinks,
          { href: "/dashboard/user/wishlist", label: "Wishlist", icon: <FaHeart /> },
          { href: "/dashboard/user/downloads", label: "Downloads", icon: <FaDownload /> },
          { href: "/dashboard/user/playlists", label: "Playlists", icon: <FaMusic /> },
          { href: "/dashboard/user/settings", label: "Settings", icon: <FaCog /> },
        ];
      default:
        return commonLinks;
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-300">Loading...</div>;
  if (!user) return null;

  const navLinks = getNavLinks();

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 shadow-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-gray-400 capitalize">{user.role}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                    activeLink === link.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setActiveLink(link.href)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
            <li className="pt-4 mt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-md text-red-400 hover:bg-red-900 hover:text-red-300 w-full transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-900">
        {children}
      </div>
    </div>
  );
}