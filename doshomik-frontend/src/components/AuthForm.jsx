"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const { setUser, setToken } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const isLogin = mode === "login";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseURL = process.env.NEXT_PUBLIC_API_URL;

    const endpoint = isLogin
      ? `${baseURL}/api/auth/login`
      : `${baseURL}/api/auth/register`;

    try {
      const res = await axios.post(endpoint, formData);
      console.log("Login response:", res.data);

      if (isLogin) {
        // ✅ Save to localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // ✅ Update context
        setUser(res.data.user);
        setToken(res.data.token);

        console.log("Token set:", res.data.token);
        console.log("User set:", res.data.user);

        // ✅ Dashboard redirect
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Form error:", err);
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">
        {isLogin ? "Login" : "Register"}
      </h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        {!isLogin && (
          <select
            name="role"
            onChange={handleChange}
            value={formData.role}
            className="w-full p-2 border rounded"
            required
          >
            <option value="user">User</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
    </div>
  );
}