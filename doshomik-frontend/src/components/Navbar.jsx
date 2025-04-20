"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { FaBars, FaTimes, FaUser, FaMusic, FaUpload, FaTachometerAlt } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Function to get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case "admin":
        return "/dashboard/admin/profile";
      case "creator":
        return "/dashboard/creator/profile";
      case "user":
        return "/dashboard/user/profile";
      default:
        return "/dashboard";
    }
  };

  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FaMusic className="text-blue-400 text-2xl" />
            <span className="text-xl font-bold text-white">Music App</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/all-music" className="text-gray-300 hover:text-white transition-colors">
              Music
            </Link>
            {user && user.role === "creator" && (
              <Link href="/dashboard/creator/upload" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <FaUpload />
                <span>Upload</span>
              </Link>
            )}
            {user && (
              <Link href={getDashboardLink()} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href={getDashboardLink()} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <FaUser />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden py-4 bg-gray-800 rounded-lg mt-2">
            <div className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/all-music"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Music
              </Link>
              {user && user.role === "creator" && (
                <Link
                  href="/dashboard/creator/upload"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUpload />
                  <span>Upload</span>
                </Link>
              )}
              {user && (
                <Link
                  href={getDashboardLink()}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}