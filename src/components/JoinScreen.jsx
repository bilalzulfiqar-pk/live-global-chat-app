import { useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState("");
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (username.trim()) {
      setError("");
      // setLoading(true);
      onJoin(username.trim());
    } else {
      setError("Name cannot be empty");
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh] h-dvh-100 bg-gray-100 transition-colors dark:bg-gray-900 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex relative flex-col m-6 items-center justify-center transition-colors p-10 py-20 md:p-20 rounded-2xl shadow-lg bg-white dark:bg-gray-800 gap-6 w-md"
      >
        <h1 className="text-[27px] whitespace-nowrap sm:text-3xl font-bold transition-colors text-gray-800 dark:text-white mb-2">
          Live Global Chat
        </h1>

        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          autoFocus
          maxLength={15}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && username.trim()) handleJoin();
          }}
          className="transition-join-custom w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          // style={{ transition: "box-shadow 300ms ease" }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* {error && <div className="text-sm text-red-500 -mt-2">{error}</div>} */}

        {/* ${
            loading
              ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
              : "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:bg-gradient-to-r hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700"
          }  */}

        <button
          onClick={handleJoin}
          // disabled={loading}
          className={`w-full px-4 py-2 cursor-pointer rounded-lg text-white shadow-lg transition duration-300 
          bg-gradient-to-l 
          from-blue-500/90
          to-blue-600/90
          hover:from-blue-500
          hover:to-blue-700
            hover:shadow-xl
            hover:shadow-blue-500/50
          dark:from-blue-600/80
          dark:to-blue-500/80
          dark:hover:from-blue-600
          dark:hover:to-blue-500
            dark:hover:shadow-blue-500/50
            dark:hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50`}
        >
          {/* {loading ? "Joining..." : "Join Chat"} */}
          Connect
        </button>

        {error && (
          <div className="absolute bottom-12 text-sm text-red-500 -mt-2">
            {error}
          </div>
        )}
      </motion.div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
