import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import socket from "../socket";
// import EmojiPicker from "emoji-picker-react";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for exit animations
import { EmojiButton } from "@joeattardi/emoji-button";
import { Smile, Send } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { HiStatusOnline } from "react-icons/hi";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export default function ChatRoom({
  username,
  handleChangeUsername,
  setUsername,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  // const [typingUser, setTypingUser] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const chatEndRef = useRef(null);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiButtonRef = useRef(null); // holds the picker instance
  const emojiTriggerRef = useRef(null); // attach to your 😊 button

  const messageSound = useRef(new Audio("/notification.mp3"));
  const [activeUsers, setActiveUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to toggle sidebar
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessages, setNewMessages] = useState(false); // For tracking new messages
  const [isAtBottom, setIsAtBottom] = useState(null);
  const requestedNameRef = useRef(username);
  const clientIdRef = useRef(null);
  const inputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const messageTimestampsRef = useRef([]);
  const [isLocked, setIsLocked] = useState(false);
  const [timeoutRemaining, setTimeoutRemaining] = useState(0);

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let clientId = localStorage.getItem("chatapp-ClientId");
    if (!clientId) {
      clientId = uuidv4();
      localStorage.setItem("chatapp-ClientId", clientId);
    }

    requestedNameRef.current = username;
    clientIdRef.current = clientId;

    if (!socket.connected) {
      socket.connect();
    }

    // listener
    const handleAssigned = (finalName) => {
      // Only toast if it really changed
      if (finalName !== requestedNameRef.current) {
        toast.success(
          `${requestedNameRef.current} was taken. You’re now ${finalName}`
        );
      }
      // Update React state & localStorage
      setUsername(finalName);
      localStorage.setItem("chatapp-username", finalName);
    };

    // // capture the name *before* the server assigns it
    // let requestedName = username;
    // // console.log("requestedName", requestedName);

    // // listen for final, unique name
    // socket.on("username-assigned", (finalName) => {
    //   // replace your local username (so header, typing, etc. all match)
    //   setUsername(finalName);
    //   localStorage.setItem("chatapp-username", finalName);

    //   // only toast if the server actually changed it
    //   if (finalName !== requestedName) {
    //     // clear any existing toast
    //     // toast.dismiss();
    //     toast.success(`${requestedName} was taken. You’re now ${finalName}`);
    //   }

    //   // console.log("Assigned name:", finalName);
    // });

    // 4️⃣ Register listener and emit join
    socket.on("username-assigned", handleAssigned);

    socket.emit("join", { clientId, desiredName: username });

    socket.on("username-changed", ({ clientId, oldName, newName }) => {
      // 1) push a System message
      if (oldName !== newName) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: "System",
            text: `${oldName} changed name to ${newName}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: "System",
            text: `${oldName} tried to change name and joined again as ${newName}`,
          },
        ]);
      }

      // 2) if it’s you, update your tab’s username + localStorage
      if (clientId === clientIdRef.current) {
        setUsername(newName);
        localStorage.setItem("chatapp-username", newName);
      }
    });

    socket.on("user-joined", (msg) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), user: "System", text: msg },
      ]);
    });

    socket.on("receive-message", (msg) => {
      const localTime = new Date(msg.time || new Date()).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
          // hour12: true, //  12-hour format or 24-hour format (without it means system default)
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          time: localTime,
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

    // socket.on("user-typing", (user) => {
    //   setTypingUser(user);
    // });

    // socket.on("user-stop-typing", () => {
    //   setTypingUser("");
    // });

    socket.on("update-typing-users", (usersArray) => {
      // Filter out yourself so you don't see your own name
      // const filtered = usersArray.filter((u) => u !== username);
      // setTypingUsers(filtered);

      setTypingUsers(usersArray.filter((u) => u !== username));
    });

    socket.on("active-users", (users) => {
      setActiveUsers(users);
      // console.log("Active users:", users);
    });

    socket.on("connect", () => {
      setIsConnected(true); // ✅ Hide loader
    });

    socket.on("disconnect", () => {
      setIsConnected(false); // 🔁 Show loader again if disconnected
    });

    // Fires each time a reconnect attempt starts (with attempt number)
    socket.io.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Reconnecting… attempt #${attemptNumber}`);
      setIsConnected(false);
    });

    // Fires when reconnection finally succeeds
    socket.io.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected on attempt #${attemptNumber}`);
      setIsConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.log(
        "Connection error"
        // , error
      );
      setIsConnected(false);
    });

    return () => {
      socket.off("user-joined");
      socket.off("receive-message");
      socket.off("user-left");
      // socket.off("user-typing");
      // socket.off("user-stop-typing");
      socket.off("update-typing-users");
      socket.off("active-users");
      // socket.off("username-assigned");
      socket.off("username-assigned", handleAssigned);
      socket.off("username-changed");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (loading) return; // skip if we’re still showing the loader

    let timeoutId; // will hold the ID returned by setTimeout
    let picker; // will hold the EmojiButton instance
    let btn; // will hold emojiTriggerRef.current
    let handleClick; // will hold our click‐handler function

    // delay initialization until after the exit animation finishes
    timeoutId = setTimeout(() => {
      // 1. create the picker
      const isDark = document.documentElement.classList.contains("dark");
      picker = new EmojiButton({
        position: "top-end",
        zIndex: 1000,
        theme: isDark ? "dark" : "light",
        autoFocusSearch: false,
      });

      // 2. wire up the “emoji” event
      let innerTimeoutId;
      picker.on("emoji", (selection) => {
        setInput((prev) => prev + selection.emoji);

        if (innerTimeoutId) clearTimeout(innerTimeoutId);
        innerTimeoutId = setTimeout(() => {
          const inputEl = inputRef.current;
          if (inputEl) {
            inputEl.focus();
            const length = inputEl.value.length;
            inputEl.setSelectionRange(length, length);
            inputEl.scrollTop = inputEl.scrollHeight;
          }
        }, 10);
      });

      // 3. store the picker in the ref (if you want to access it later)
      emojiButtonRef.current = picker;

      // 4. grab the actual button element
      btn = emojiTriggerRef.current;
      if (!btn) {
        console.warn("Emoji button not found—picker won’t open.");
        return;
      }

      // 5. create the click handler and attach it
      handleClick = () => picker.togglePicker(btn);
      btn.addEventListener("click", handleClick);
    }, 1000); // 1s delay so that any exit animation can finish first

    // Clean up everything when this effect re-runs or unmounts:
    return () => {
      clearTimeout(timeoutId); // stop the pending timeout (if not run yet)

      if (btn && handleClick) {
        btn.removeEventListener("click", handleClick);
      }
      if (picker) {
        picker.destroyPicker();
      }
    };
  }, [loading]);

  useEffect(() => {
    const handle = (e) => {
      // e.detail is "light" or "dark"
      emojiButtonRef.current?.setTheme(e.detail);
    };

    window.addEventListener("themeChange", handle);
    return () => window.removeEventListener("themeChange", handle);
  }, []);

  useEffect(() => {
    if (typingUsers.length === 0) {
      setCurrentIdx(0);
      return; // nothing to cycle
    }

    // When typingUsers changes, ensure currentIdx is valid
    if (currentIdx >= typingUsers.length) {
      setCurrentIdx(0);
    }

    // Cycle every 2 seconds
    const id = setInterval(() => {
      setCurrentIdx((prev) => {
        // move to next index, wrap around
        return (prev + 1) % typingUsers.length;
      });
    }, 2000);

    return () => clearInterval(id);
  }, [typingUsers]);

  const handleSend = () => {
    if (input.trim()) {
      const message = {
        user: username,
        text: input.trim(),
        id: Date.now(),
        // time: new Date().toLocaleTimeString([], {
        //   hour: "2-digit",
        //   minute: "2-digit",
        // }),
        time: new Date().toISOString(),
        clientId: clientIdRef.current,
      };

      socket.emit("send-message", message);
      setInput("");
      setIsTyping(false);
      socket.emit("stop-typing");

      const t = inputRef.current;
      if (t) {
        t.style.height = "auto";
      }
    }

    const now = Date.now();
    const limit = 5; // max messages limit
    const duration = 5 * 1000; // max messages limit duration in seconds

    // Clean up old timestamps
    messageTimestampsRef.current = messageTimestampsRef.current.filter(
      (timestamp) => now - timestamp < duration
    );

    // Add new timestamp
    messageTimestampsRef.current.push(now);

    if (messageTimestampsRef.current.length > limit) {
      // Trigger lock
      const timeoutSeconds = 30; // Timeout seconds

      setIsLocked(true);
      setTimeoutRemaining(timeoutSeconds);
      localStorage.setItem("chat_timeout_start", now.toString());

      // Prevent message from being sent
      return;
    }
  };

  useEffect(() => {
    const savedStart = localStorage.getItem("chat_timeout_start");
    if (savedStart) {
      const now = Date.now();
      const elapsed = Math.floor((now - parseInt(savedStart, 10)) / 1000);
      const remaining = 30 - elapsed; // Remaining Timeout seconds
      if (remaining > 0) {
        setIsLocked(true);
        setTimeoutRemaining(remaining);
      } else {
        localStorage.removeItem("chat_timeout_start");
      }
    }
  }, []);

  useEffect(() => {
    let interval = null;

    if (isLocked && timeoutRemaining > 0) {
      interval = setInterval(() => {
        setTimeoutRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsLocked(false);
            messageTimestampsRef.current = [];
            localStorage.removeItem("chat_timeout_start");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isLocked, timeoutRemaining]);

  const handleInputChange = (e) => {
    const value = e.target.value;

    const t = inputRef.current;
    if (t) {
      t.style.height = "auto";
      t.style.height = t.scrollHeight + "px";
    }

    setInput(value);

    const hasText = value.trim().length > 0;

    if (hasText && !isTyping) {
      socket.emit("typing"); // only emit once when typing starts
      setIsTyping(true);
    } else if (!hasText && isTyping) {
      socket.emit("stop-typing"); // only emit once when typing stops
      setIsTyping(false);
    }

    // if (e.target.value.trim()) {
    //   socket.emit("typing");
    // } else {
    //   socket.emit("stop-typing");
    // }
  };

  const handleScrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessages(false); // Reset the flag once scrolled to bottom
  };

  //   useEffect(() => {
  //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
    if (loading) return;
    const chatContainer = chatEndRef.current?.parentNode; // Assuming the parent is the scrollable div
    // console.log("chatContainer", chatContainer);
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
  }, 1000); // Delay to ensure the chat container is rendered

  return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    // console.log("messages changed, isAtBottom:", isAtBottom);
    if (!isAtBottom) return;

    chatEndRef.current.scrollIntoView({ behavior: "smooth" });

    // console.log("typingUser", typingUser);
    // console.log("isAtBottom", isAtBottom);
  }, [messages]);

  useEffect(() => {
    // if (messages.length === 0) return;

    if (isAtBottom === null) return;
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    // const isSelf = latestMessage.user === username;
    const isSelf = latestMessage.clientId === clientIdRef.current;
    const isSystem = latestMessage.user === "System";
    // console.log("latestMessage", latestMessage);
    // console.log(latestMessage.user);
    // console.log("isSelf", isSelf);

    // if (isAtBottom || isSelf || isSystem) {
    //   setNewMessages(false);
    // } else {
    //   setNewMessages(true);
    // }

    if (isAtBottom) {
      setNewMessages(false);
    } else {
      if (!isSelf && !isSystem) {
        setNewMessages(true);
      }
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

  useEffect(() => {
    if (isConnected) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000); // small delay to avoid flicker

      return () => clearTimeout(timeout);
    } else {
      setLoading(true);
    }
  }, [isConnected]);

  // if (loading)
  //   return (
  //     <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
  //       <div className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
  //         Connecting...
  //       </div>
  //     </div>
  //   );

  return (
    <div className="h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full flex justify-center items-center bg-white dark:bg-gray-900"
          >
            <div className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
              Connecting...
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
              {/* Header */}
              {/* dark:bg-gradient-to-r dark:from-[#2C3E50] dark:via-[#34495E] dark:to-[#5D6D7E]
              dark:bg-gradient-to-r dark:from-[#3B4D64] dark:via-[#2D3748] dark:to-[#4A5568]         3 miidle via: 3a475d 374357 3e4c62
              dark:bg-gradient-to-r dark:from-[#3E4A59] dark:via-[#2C3D49] dark:to-[#4F677C]
              */}
              {/* bg-gradient-to-l from-teal-400 via-blue-500 to-indigo-600  last 2b6dfc
               */}
              <header
                className="px-4 py-3 flex flex-wrap flex-row items-center justify-between gap-4
              bg-gradient-to-l from-blue-400 via-blue-500 sm:to-blue-600 to-[#2b6dfc]
              dark:bg-gradient-to-r dark:from-[#3B4D64] sm:dark:via-[#2D3748] dark:via-[#3e4c62]  dark:to-[#4A5568]
            text-white shadow-md"
              >
                <div className="font-medium text-sm sm:text-base order-1 sm:order-1 flex items-center gap-2">
                  <FaUser className="text-lg dark:text-white" />{" "}
                  <span className="font-semibold dark:text-white">
                    {username}
                  </span>
                  <button
                    onClick={handleChangeUsername}
                    className="text-xs shadow-2xs cursor-pointer text-white px-2 dark:text-gray-300 dark:bg-[#1E2939] dark:hover:bg-[#171e29] py-1 rounded-xl bg-blue-400 hover:bg-blue-500 transition-colors duration-300"
                  >
                    Change
                  </button>
                </div>

                {/* Active Users Count (Only the total number) */}
                <div className="text-sm sm:text-base dark:text-white order-3 w-full sm:w-auto sm:order-2 flex items-center justify-between">
                  <strong className="flex items-center justify-center gap-1">
                    <HiStatusOnline className="text-2xl "/>
                    Active Users: {activeUsers.length}
                  </strong>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="ml-2.5 text-white dark:text-gray-300 shadow-sm dark:bg-[#1E2939] dark:hover:bg-[#171e29] cursor-pointer bg-blue-400 px-2.5 pr-3 py-1.5 rounded-full hover:bg-blue-500 transition-colors duration-300 text-sm"
                  >
                    View Full List
                  </button>
                </div>

                <div className="order-2 sm:order-3">
                  <ThemeToggle />
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 relative min-h-0">
                <div className="h-full flex flex-col overflow-y-auto px-4 py-3 relative scroll-smooth">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}

                      // transition={{
                      //   duration: 0.3,
                      //   ...(typingUsersRef.current.length > 1 ? { delay: 0.3 } : {}),
                      // }}
                    >
                      <Message
                        msg={msg}
                        self={msg.clientId === clientIdRef.current}
                      />
                    </motion.div>
                  ))}
                  <div className={`min-h-5 mb-0 mt-auto`}>
                    <AnimatePresence mode="wait">
                      {typingUsers.length > 0 && (
                        <motion.div
                          // layout
                          key={typingUsers[currentIdx]}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            // layout: {
                            //   duration: 0.05,
                            // },
                          }}
                          className="text-sm text-gray-500 dark:text-gray-400 italic"
                        >
                          {typingUsers[currentIdx]} is typing...
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div ref={chatEndRef} />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                  {newMessages && !isAtBottom && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() =>
                        chatEndRef.current?.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                      className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 bg-blue-500 text-white dark:text-gray-300 p-3 rounded-full shadow-lg dark:bg-[#303A4B] dark:hover:bg-[#1E2939] hover:bg-blue-600 transition duration-300 cursor-pointer"
                    >
                      New Messages
                    </motion.div>
                  )}

                  {!newMessages && showScrollButton && !isAtBottom && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() =>
                        chatEndRef.current?.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                      className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 cursor-pointer dark:bg-[#303A4B] dark:hover:bg-[#1E2939] bg-blue-500 text-white dark:text-gray-300 p-3 flex justify-center items-center rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
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
              <div className="flex flex-col items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-l from-blue-400 to-blue-500 dark:from-none dark:to-none dark:bg-none dark:bg-gray-800 gap-2">
                <div className="flex items-center w-full bg-white dark:bg-gray-700 rounded-3xl shadow h-full relative">
                  <AnimatePresence>
                    {isLocked && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-red-500 absolute pr-10 pl-8 leading-[1.2] text-sm min-[530px]:text-base inset-0 text-center py-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-3xl flex items-center justify-center"
                      >
                        You're sending messages too fast. Please wait{" "}
                        {timeoutRemaining}
                        s.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="h-full">
                    <button
                      disabled={isLocked}
                      ref={emojiTriggerRef}
                      type="button"
                      className="cursor-pointer py-2 h-full text-[#555E63] hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xl flex justify-center items-center rounded-3xl w-[44px]  duration-300 transition"
                    >
                      <Smile />
                    </button>
                  </div>
                  {/* <input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  ref={inputRef}
                  placeholder="Type your message..."
                  className="flex-1 min-w-20 py-2 rounded-lg bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition focus:outline-none"
                  autoComplete="off" // disables browser history suggestions
                  autoCorrect="off" // iOS autocorrect
                  autoCapitalize="off" // iOS auto‐capitalize
                  spellCheck="false" // no red underlines
                  /> */}
                  <div className="flex-1 flex items-center justify-center py-2 h-fit min-w-20">
                    <textarea
                      disabled={isLocked}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      ref={inputRef} // <-- or keep using inputRef if you rename it
                      rows={1}
                      placeholder="Type your message..."
                      className="
                      inputarea
                      w-full
                      min-w-20
                      py-0
                      bg-transparent
                    text-gray-800 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                      transition focus:outline-none
                      resize-none
                      overflow-y-auto
                      h-auto
                      max-h-[calc(1.5rem*6)]
                      " // max-h-[calc(1.5rem*6)] for 6 lines
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>

                  <button
                    disabled={isLocked}
                    onClick={handleSend}
                    className="px-4 py-2.5 h-full rounded-3xl text-[#555E63] hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 bg-transparent cursor-pointer transition duration-300 flex justify-center items-center"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
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
                      className="absolute top-0 right-0 w-72 bg-white dark:bg-[#303A4B] text-gray-900 dark:text-white h-full p-6 overflow-y-auto rounded-lg shadow-lg"
                      initial={{ x: "100%" }} // Initially off-screen to the right
                      animate={{ x: 0 }} // Sidebar slides in
                      exit={{ x: "100%" }} // Sidebar slides out to the right
                      transition={{ duration: 0.2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-xl flex items-center gap-1 text-blue-500 dark:text-white font-semibold mb-4">
                        {/* <HiStatusOnline className="text-3xl" />  */}
                        Active Users
                      </h2>
                      <ul className="space-y-2">
                        {activeUsers.map((user, idx) => (
                          <li
                            key={idx}
                            className="bg-blue-500 dark:bg-[#1E2939] px-4 py-2 rounded-lg text-white dark:text-white flex justify-between items-center"
                          >
                            <span>
                              {idx + 1}. {user}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute cursor-pointer dark:text-white top-4 right-4 text-white bg-blue-500 dark:bg-[#1E2939] dark:hover:bg-[#171e29] hover:bg-blue-600 w-[32px] flex justify-center items-center px-3 py-1 rounded-full transition"
                      >
                        ✕
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
