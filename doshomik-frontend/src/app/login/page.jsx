"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        formData
      );

      if (response.data.token) {
        // Save to localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Update context
        login(response.data.token, response.data.user);

        // Redirect based on role
        if (response.data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else if (response.data.user.role === "creator") {
          router.push("/dashboard/creator/profile");
        } else {
          router.push("/dashboard/user/profile");
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">
              Login
            </h1>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-4 text-center text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 