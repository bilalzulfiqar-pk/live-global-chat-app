**Global Chat App**

A real-time global chat application built with Socket.IO, Express, and React. Users can join with a unique username, send and receive messages instantly, view active users, and toggle between light and dark themes.

---

## Live Demo

https://live-global-chat-app.vercel.app/

---

## Features

- Real-time messaging powered by Socket.IO  
- Unique username assignment and rename capability  
- Typing indicators  
- Active users list with sidebar view  
- Notification sound for incoming messages  
- Light / Dark theme toggle with system preference support  
- Smooth animations via Framer Motion  
- Emoji picker integration

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Socket.IO Client  
- **Backend:** Node.js, Express, Socket.IO  
- **Utilities:** react-hot-toast, uuid, emoji-button, lucide-react, react-icons

---

## Prerequisites

- Node.js (v14 or later)  
- npm (v6 or later)

---

## Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/bilalzulfiqar-pk/live-global-chat-app.git
   cd global-chat-app
   ```
2. **Install dependencies**  
   ```bash
   npm install
   ```

---

## Running Locally

### 1. Start the Backend Server  
In the project root, run:
```bash
node server.js
```  
_The server runs on port `5000` by default._

### 2. Start the Frontend Dev Server  
In a separate terminal, run:
```bash
npm run dev
```  
_The frontend dev server runs on `http://localhost:5173`._

### 3. Access the App  
Open your browser and navigate to `http://localhost:5173` to start chatting.

---

## Environment Variables

The client expects an environment variable to locate the API:

```env
VITE_API_BASE_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

---

## Project Structure

```
LIVE-GLOBAL-CHAT-APP
├── global-chat-server
│   ├── index.js
│   └── package.json
├── src
│   ├── assets
│   ├── components
│   │   ├── ChatRoom.jsx
│   │   ├── JoinScreen.jsx
│   │   ├── Message.jsx
│   │   └── ThemeToggle.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── socket.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---



## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/XYZ`)
3. Commit your changes (`git commit -m "Add XYZ feature"`)
4. Push to the branch (`git push origin feature/XYZ`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. Feel free to use and modify it as you wish.

