const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const users = new Map(); // socket.id => username
const clientMap = new Map(); // clientId ⇒ username
const clientSockets = new Map(); // clientId ⇒ Set of socket.ids

// // Sample fake names (you can add more if needed) for testing
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

// let count = 1;

io.on("connection", (socket) => {
  // console.log("🔌 A user connected ");

  socket.on("join", ({ clientId, desiredName }) => {
    // socket.username = username;
    // users.set(socket.id, username);
    // io.emit("user-joined", `${username} joined the chat`);
    // io.emit("active-users", Array.from(users.values())); // broadcast updated list

    // // pick a unique one
    // const uniqueName = getUniqueUsername(username);
    // // console.log("Unique name:", uniqueName);

    // // assign and store
    // socket.username = uniqueName;
    // users.set(socket.id, uniqueName);

    // // let *this* client know their final name
    // socket.emit("username-assigned", uniqueName);

    // // announce join under the final name
    // io.emit("user-joined", `${uniqueName} joined the chat`);
    // io.emit("active-users", Array.from(users.values()));

    let finalName;

    // If we’ve already seen this clientId, re-use their name:
    // if (clientMap.has(clientId)) {
    //   finalName = clientMap.get(clientId);

    //   // Otherwise, pick a fresh unique name for them:
    // } else {
    //   finalName = getUniqueUsername(desiredName);
    //   clientMap.set(clientId, finalName);
    // }

    if (clientMap.has(clientId)) {
      const previousName = clientMap.get(clientId);

      // Only reassign if name is still unused
      const isNameTaken = Array.from(users.values()).includes(previousName);

      if (!isNameTaken) {
        finalName = previousName;
      } else {
        finalName = getUniqueUsername(previousName); // fall back to Bilal-1 etc
        clientMap.set(clientId, finalName); // update to new name
      }
    } else {
      finalName = getUniqueUsername(desiredName);
      clientMap.set(clientId, finalName);
    }

    // 1️⃣ Track this socket under clientId
    let set = clientSockets.get(clientId);
    if (!set) {
      set = new Set();
      clientSockets.set(clientId, set);
    }
    const wasEmpty = set.size === 0;
    set.add(socket.id);

    // 2️⃣ Only announce if it’s the first tab for that clientId
    if (wasEmpty && !socket.isRenaming) {
      io.emit("user-joined", `${finalName} joined the chat`);
    }

    socket.isRenaming = false;

    // Store under the new socket.id, announce, etc.
    socket.username = finalName;
    users.set(socket.id, finalName);

    // stash it on the socket
    socket.clientId = clientId;

    // let *this* client know their final name
    socket.emit("username-assigned", finalName);

    // io.emit("user-joined", `${finalName} joined the chat`);
    // Dedupe so that two tabs don’t show up twice:
    const uniqueUsers = Array.from(new Set(users.values()));
    io.emit("active-users", uniqueUsers);
  });

  socket.on("change-username", ({ clientId, oldName, newName }) => {
    // 1️⃣ Update the master clientMap
    const finalName = getUniqueUsername(newName);

    if (finalName === newName && finalName === oldName) {
      // No change needed
      return;
    }

    clientMap.set(clientId, finalName);

    // 2️⃣ Propagate to all open sockets/tabs for that client
    const socketsSet = clientSockets.get(clientId) || new Set();
    for (const sid of socketsSet) {
      // Find the Socket instance and update its .username
      const sock = io.sockets.sockets.get(sid);
      if (sock) {
        sock.username = finalName;
        users.set(sid, finalName);
      }
    }

    // 3️⃣ Broadcast to everyone:
    //   • a system event so clients can show “Alice changed name to Alicia”
    //   • the updated active-users roster

    socket.isRenaming = true;

    // if (oldName !== finalName) {
    //   io.emit("username-changed", { clientId, oldName, newName: finalName });
    // }

    io.emit("username-changed", { clientId, oldName, newName: finalName });

    io.emit("active-users", Array.from(new Set(users.values())));

    // 4️⃣ let the renaming client know their assigned name
    // socket.emit("username-assigned", finalName);
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
    // console.log("🔌 A user disconnected ");
    // console.log("Disconnected socket id:", socket.id);
    // console.log("Disconnected username:", socket.username);  //-

    const clientId = socket.clientId;
    const set = clientSockets.get(clientId);

    // console.log("Disconnected clientId:", clientId);
    if (set) {
      set.delete(socket.id);
      users.delete(socket.id);

      // console.log("Size:", set.size);  //-

      // 4️⃣ Only announce if that was the *last* tab
      if (set.size === 0) {
        clientSockets.delete(clientId);
        io.emit("user-left", `${socket.username} left the chat`);
      }

      io.emit("active-users", Array.from(new Set(users.values())));
    }

    // if (socket.username) {
    //   users.delete(socket.id);
    //   io.emit("user-left", `${socket.username} left the chat`);

    //   const uniqueUsers = Array.from(new Set(users.values()));
    //   io.emit("active-users", uniqueUsers); // update on leave
    // }
  });
});

/**
 * Given a desired name, return it if unused,
 * otherwise append “-1”, “-2”, … until it’s unique.
 */
function getUniqueUsername(desired) {
  const existing = Array.from(users.values());
  if (!existing.includes(desired)) return desired;

  let counter = 1;
  let candidate = `${desired}-${counter}`;
  while (existing.includes(candidate)) {
    counter++;
    candidate = `${desired}-${counter}`;
  }
  return candidate;
}

server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on PORT:${process.env.PORT || 5000}`);
});
