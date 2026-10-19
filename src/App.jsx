import { useState, useEffect } from "react";
import socket from "./socket";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [username, setUsername] = useState(null);

  // Initialize directly from localStorage to prevent flicker:
  // const [username, setUsername] = useState(() => {
  //   return localStorage.getItem("chatapp-username") || "";
  // });

  useEffect(() => {
    // Use requestAnimationFrame to allow animation setup before setting username
    requestAnimationFrame(() => {
      const savedUsername = localStorage.getItem("chatapp-username");
      setTimeout(() => {
        setUsername(savedUsername || "");
      }, 300);
    });
  }, []);

  // useEffect(() => {
  //   // let clientId = localStorage.getItem("chatapp-ClientId");
  //   // if (!clientId) {
  //   //   clientId = uuidv4();
  //   //   localStorage.setItem("chatapp-ClientId", clientId);
  //   // }

  //   const savedUsername = localStorage.getItem("chatapp-username");
  //   if (savedUsername) {
  //     // Rename scenario
  //     // socket.emit("change-username", { clientId, oldName: savedUsername, newName: savedUsername });

  //     setUsername(savedUsername);
  //   }
  // }, []);

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

  if (username === null) {
    // Avoid rendering anything on first frame
    return (
      <div className="h-[100vh] h-dvh-100 bg-white dark:bg-gray-900 transition-colors duration-300"></div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="h-[100vh] h-dvh-100 bg-white dark:bg-gray-900 transition-colors duration-300">
        {username ? (
          <div key="chat" className="h-full animate-view-fade">
            <ChatRoom
              username={username}
              handleChangeUsername={handleChangeUsername}
              setUsername={setUsername}
            />
          </div>
        ) : (
          <div key="join" className="h-full animate-view-fade">
            <JoinScreen onJoin={handleJoin} />
          </div>
        )}
      </div>

      <Analytics />
    </>
  );
}

export default App;
