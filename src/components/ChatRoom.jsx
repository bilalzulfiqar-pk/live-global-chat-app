import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import socket from "../socket";
import EmojiPicker from "emoji-picker-react";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for exit animations

export default function ChatRoom({ username, handleChangeUsername }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const chatEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageSound = useRef(new Audio("/notification.mp3"));
  const [activeUsers, setActiveUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to toggle sidebar
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessages, setNewMessages] = useState(false); // For tracking new messages
  const [isAtBottom, setIsAtBottom] = useState(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", username);

    socket.on("user-joined", (msg) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), user: "System", text: msg },
      ]);
    });

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          time:
            msg.time ||
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        },
      ]);
      if (msg.user !== username) {
        messageSound.current
          .play()
          .catch((e) => console.warn("Autoplay blocked", e));
      }
    });

    socket.on("user-left", (msg) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), user: "System", text: msg },
      ]);
    });

    socket.on("user-typing", (user) => {
      setTypingUser(user);
    });

    socket.on("user-stop-typing", () => {
      setTypingUser("");
    });

    socket.on("active-users", (users) => {
      setActiveUsers(users);
    });

    return () => {
      socket.off("user-joined");
      socket.off("receive-message");
      socket.off("user-left");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("active-users");
      socket.disconnect();
    };
  }, [username]);

  const handleSend = () => {
    if (input.trim()) {
      const message = {
        user: username,
        text: input.trim(),
        id: Date.now(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      socket.emit("send-message", message);
      setInput("");
      socket.emit("stop-typing");
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (e.target.value.trim()) {
      socket.emit("typing");
    } else {
      socket.emit("stop-typing");
    }
  };

  const handleScrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessages(false); // Reset the flag once scrolled to bottom
  };

  //   useEffect(() => {
  //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentNode; // Assuming the parent is the scrollable div
    if (!chatContainer) return;

    const threshold = 200; // px, how close to bottom counts as "at bottom"

    const handleScroll = () => {
      if (!chatContainer) return;

      const isAtBottom =
        chatContainer.scrollHeight -
          chatContainer.scrollTop -
          chatContainer.clientHeight <
        threshold;

      setIsAtBottom(isAtBottom);
    };

    // Adding scroll event listener
    chatContainer.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isAtBottom && typingUser) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUser]);

  useEffect(() => {
    // if (messages.length === 0) return;

    if (isAtBottom === null) return;
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    const isSelf = latestMessage.user === username;
    const isSystem = latestMessage.user === "System";
    // console.log("latestMessage", latestMessage);
    // console.log(latestMessage.user);
    // console.log("isSelf", isSelf);
    if (isAtBottom || isSelf || isSystem) {
      setNewMessages(false);
    } else {
      setNewMessages(true);
    }
    // console.log("isAtBottom", isAtBottom);
    // console.log("newMessages", newMessages);
  }, [messages]);

  useEffect(() => {
    if (isAtBottom === null) return;
    if (isAtBottom) {
      setShowScrollButton(false);
      setNewMessages(false);
    } else {
      setShowScrollButton(true);
    }
  }, [isAtBottom]);

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="px-4 py-3 flex flex-wrap flex-row items-center justify-between gap-4 bg-blue-600 text-white shadow-md">
        <div className="font-medium text-sm sm:text-base order-1 sm:order-1 flex items-center gap-2">
          👤 <span className="font-semibold">{username}</span>
          <button
            onClick={handleChangeUsername}
            className="text-xs bg-blue-500 cursor-pointer text-white px-2 py-1 rounded hover:bg-[#2b75ff] transition-colors duration-300"
          >
            Change
          </button>
        </div>

        {/* Active Users Count (Only the total number) */}
        <div className="text-sm sm:text-base order-3 w-full sm:w-auto sm:order-2">
          <strong>🟢 Active Users: {activeUsers.length}</strong>
          <button
            onClick={() => setSidebarOpen(true)}
            className="ml-4 text-white cursor-pointer bg-blue-500 px-2 py-1 rounded-md hover:bg-[#2b75ff] transition-colors duration-300"
          >
            View Full List
          </button>
        </div>

        <div className="order-2 sm:order-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 relative">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Message msg={msg} self={msg.user === username} />
          </motion.div>
        ))}
        <div
          className={`${
            typingUser ? "h-5" : "h-0.5"
          } transition-all duration-400`}
        >
          <AnimatePresence>
            {typingUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-gray-500 dark:text-gray-400 italic"
              >
                {typingUser} is typing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div ref={chatEndRef} />

        <AnimatePresence>
          {newMessages && !isAtBottom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() =>
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer"
            >
              New messages below
            </motion.div>
          )}

          {!newMessages && showScrollButton && !isAtBottom && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() =>
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="fixed cursor-pointer bottom-24 right-6 bg-blue-600 text-white p-3 flex justify-center items-center rounded-full shadow-lg hover:bg-blue-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="translate-y-[1px]"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="flex items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 min-w-20 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="cursor-pointer py-2 text-xl bg-gray-200 dark:bg-gray-600 rounded-full w-[44px] hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            😊
          </button>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-12 -right-17 min-[500px]:right-0 max-[500px]:max-w-screen max-[500px]:-right-20 z-10"
              >
                <div className="overflow-x-auto">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setInput((prev) => prev + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-lg text-white bg-blue-600 cursor-pointer hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>

      {/* Off-Canvas Sidebar for Active Users */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-gray-800/50 z-50"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }} // Sidebar starts invisible
            animate={{ opacity: 1 }} // Sidebar becomes fully visible
            exit={{ opacity: 0 }} // Sidebar fades out on exit
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-0 right-0 w-72 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-full p-6 overflow-y-auto rounded-lg shadow-lg"
              initial={{ x: "100%" }} // Initially off-screen to the right
              animate={{ x: 0 }} // Sidebar slides in
              exit={{ x: "100%" }} // Sidebar slides out to the right
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">🟢 Active Users</h2>
              <ul className="space-y-2">
                {activeUsers.map((user, idx) => (
                  <li
                    key={idx}
                    className="bg-blue-500 px-4 py-2 rounded-md text-white flex justify-between items-center"
                  >
                    <span>
                      {idx + 1}. {user}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-white bg-blue-500 hover:bg-blue-600 w-[32px] flex justify-center items-center px-3 py-1 rounded-full transition"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
