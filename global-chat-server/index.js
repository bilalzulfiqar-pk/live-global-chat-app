const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const users = new Map(); // socket.id => username

// // Sample fake names (you can add more if needed)
// const fakeNames = [
//   "John Doe",
//   "Jane Smith",
//   "Alice Johnson",
//   "Bob Brown",
//   "Charlie Davis",
//   "Eve Wilson",
//   "Frank Harris",
//   "Grace Lee",
//   "Hank Clark",
//   "Ivy Martinez",
//   "Jack White",
//   "Lily Taylor",
//   "Mike Anderson",
//   "Nancy Thomas",
//   "Oscar Green",
// ];

// // Function to simulate adding fake users to the users map
// const addFakeUsers = () => {
//   // Create fake socket ids (or you can use real socket ids if you have them)
//   for (let i = 0; i < fakeNames.length; i++) {
//     const socketId = `socket_${i + 1}`; // Fake socket id
//     const username = fakeNames[i % fakeNames.length]; // Assign a fake name in a loop
//     users.set(socketId, username); // Map socket.id to username
//   }
// };

// // Add fake users for testing
// addFakeUsers();

const io = new Server(server, {
  cors: {
    origin: "*", // For dev only; restrict in production
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let count = 1;

io.on("connection", (socket) => {
  console.log("🔌 A user connected " + count++);

  socket.on("join", (username) => {
    socket.username = username;
    users.set(socket.id, username);
    io.emit("user-joined", `${username} joined the chat`);
    io.emit("active-users", Array.from(users.values())); // broadcast updated list
  });

  socket.on("typing", () => {
    socket.broadcast.emit("user-typing", socket.username);
  });

  socket.on("stop-typing", () => {
    socket.broadcast.emit("user-stop-typing", socket.username);
  });

  socket.on("send-message", (message) => {
    io.emit("receive-message", message); // Send full message object with time
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      users.delete(socket.id);
      io.emit("user-left", `${socket.username} left the chat`);
      io.emit("active-users", Array.from(users.values())); // update on leave
    }
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
