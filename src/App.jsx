import { useState, useEffect } from "react";
import socket from "./socket";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";
import { Toaster } from "react-hot-toast";
// import { v4 as uuidv4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [username, setUsername] = useState(null);

  // Initialize directly from localStorage to prevent flicker:
  // const [username, setUsername] = useState(() => {
  //   return localStorage.getItem("chatapp-username") || "";
  // });

  useEffect(() => {
    // let clientId = localStorage.getItem("chatapp-ClientId");
    // if (!clientId) {
    //   clientId = uuidv4();
    //   localStorage.setItem("chatapp-ClientId", clientId);
    // }

    const savedUsername = localStorage.getItem("chatapp-username");
    if (savedUsername) {
      // Rename scenario
      // socket.emit("change-username", { clientId, oldName: savedUsername, newName: savedUsername });

      setUsername(savedUsername);
    }
  }, []);

  const handleJoin = (name) => {
    const oldName = localStorage.getItem("chatapp-username");
    const clientId = localStorage.getItem("chatapp-ClientId");
    if (oldName) {
      // Rename scenario
      socket.emit("change-username", { clientId, oldName, newName: name });
    }
    setUsername(name);
    localStorage.setItem("chatapp-username", name);
  };

  const handleChangeUsername = () => {
    // Show join screen without clearing clientId
    setUsername("");
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="h-[100vh] h-dvh-100 bg-white dark:bg-gray-900 transition-colors duration-300">
        <AnimatePresence mode="wait">
          {username ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <ChatRoom
                username={username}
                handleChangeUsername={handleChangeUsername}
                setUsername={setUsername}
              />
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <JoinScreen onJoin={handleJoin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
