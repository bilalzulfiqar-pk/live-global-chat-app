import { useState, useEffect } from "react";
import JoinScreen from "./components/JoinScreen";
import ChatRoom from "./components/ChatRoom";

function App() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleJoin = (name) => {
    setUsername(name);
    localStorage.setItem("username", name);
  };

  const handleChangeUsername = () => {
    localStorage.removeItem("username");
    setUsername("");
  };

  return (
    <>
      {username ? (
        <ChatRoom username={username} handleChangeUsername={handleChangeUsername} />
      ) : (
        <JoinScreen onJoin={handleJoin} />
      )}
    </>
  );
}

export default App;
