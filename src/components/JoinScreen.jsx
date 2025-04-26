import { useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState("");

  const handleJoin = () => {
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col m-3 items-center justify-center p-10 py-20 md:p-20 rounded-2xl shadow-lg bg-white dark:bg-gray-800 gap-6 w-md"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🌐 Global Chat
        </h1>

        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          autoFocus
          maxLength={20}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && username.trim()) handleJoin();
          }}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleJoin}
          className="w-full px-4 py-2 cursor-pointer rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          Join Chat
        </button>
      </motion.div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
