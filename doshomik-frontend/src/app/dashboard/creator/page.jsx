"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorMainPage() {
  const router = useRouter();

  useEffect(() => {
    // Delay optional (in case of AuthContext/Token load)
    const timer = setTimeout(() => {
      router.replace("/dashboard/creator/profile");
    }, 100); // 0.1 second delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="text-center mt-10 text-gray-600">
      Redirecting to your profile...
    </div>
  );
}