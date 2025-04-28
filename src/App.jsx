import { useState, useEffect } from "react";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";
import { Toaster } from "react-hot-toast";

function App() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("chatapp-username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleJoin = (name) => {
    setUsername(name);
    localStorage.setItem("chatapp-username", name);
  };

  const handleChangeUsername = () => {
    localStorage.removeItem("chatapp-username");
    localStorage.removeItem("chatapp-ClientId");
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
