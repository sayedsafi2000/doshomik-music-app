"use client";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

const RecentMusic = () => {
  const mockSongs = [
    { id: 1, title: "Ei Mon Tomake Dilam", artist: "Balam" },
    { id: 2, title: "Hridoy Chuye Gelo", artist: "Tahsan" },
    { id: 3, title: "Tomake Bujhina", artist: "James" },
  ];

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Uploads</h2>
          <Link href="/all-music" className="text-blue-600 hover:underline">View All</Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSongs.map((song) => (
            <div key={song.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition duration-300">
              <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
              <p className="text-gray-600 text-sm">Artist: {song.artist}</p>
              <Link href={`/music/${song.id}`} className="text-blue-500 hover:underline flex items-center mt-2">
                <FaPlay className="mr-2" /> Listen
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentMusic;