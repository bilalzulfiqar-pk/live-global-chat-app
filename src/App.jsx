import { useState, useEffect } from "react";
import socket from "./socket";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";
import { Toaster } from "react-hot-toast";

function App() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("chatapp-username");
    if (savedUsername) setUsername(savedUsername);
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
      {username ? (
        <ChatRoom
          username={username}
          handleChangeUsername={handleChangeUsername}
          setUsername={setUsername}
        />
      ) : (
        <JoinScreen onJoin={handleJoin} />
      )}
    </>
  );
}

export default App;