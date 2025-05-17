import { useState, useEffect } from "react";
import socket from "./socket";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";
import { Toaster } from "react-hot-toast";
// import { v4 as uuidv4 } from "uuid";

function App() {
  const [username, setUsername] = useState(null);

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
