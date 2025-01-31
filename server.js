const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path");

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "images")));

const rooms = {};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  const roomData = Object.entries(rooms).map(([roomName, room]) => ({
    name: roomName,
    userCount: Object.keys(room.users).length,
  }));
  res.render("index", { rooms: roomData });
});

// Function to sanitize room names
const sanitizeRoomName = (room) => room.replace(/[^a-zA-Z0-9-_]/g, "_");

app.post("/room", (req, res) => {
  let roomName = sanitizeRoomName(req.body.room);

  if (rooms[roomName] != null) {
    return res.redirect("/");
  }
  rooms[roomName] = { users: {} };

  res.redirect(`/${encodeURIComponent(roomName)}`);
  io.emit("room-created", encodeURIComponent(roomName));
});

app.get("/:room", (req, res) => {
  let roomName = decodeURIComponent(req.params.room);
  roomName = sanitizeRoomName(roomName);

  if (rooms[roomName] == null) {
    return res.redirect("/");
  }
  res.render("room", { roomName });
});

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  socket.on("new-user", (room, name) => {
    const decodedRoom = sanitizeRoomName(decodeURIComponent(room));

    console.log(`${name} joined room: ${decodedRoom}`);
    socket.join(decodedRoom);
    if (!rooms[decodedRoom]) rooms[decodedRoom] = { users: {} };

    const randomColor = getRandomColor();

    rooms[decodedRoom].users[socket.id] = { name, color: randomColor };
    socket.to(decodedRoom).emit("user-connected", { name, color: randomColor });
  });

  socket.on("send-chat-message", (room, message) => {
    const decodedRoom = sanitizeRoomName(decodeURIComponent(room));

    if (!rooms[decodedRoom]?.users[socket.id]) return;

    const user = rooms[decodedRoom].users[socket.id];
    console.log(`Message from ${user.name} in room ${decodedRoom}: ${message}`);

    socket.to(decodedRoom).emit("chat-message", {
      message,
      name: user.name,
      color: user.color,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    getUserRooms(socket).forEach((room) => {
      if (!rooms[room]) return;
      const user = rooms[room].users[socket.id];
      if (user) {
        socket.to(room).emit("user-disconnected", user.name);
        delete rooms[room].users[socket.id];

        if (Object.keys(rooms[room].users).length === 0) {
          delete rooms[room];
          console.log(`Room ${room} deleted due to no users.`);
          io.emit("room-deleted", encodeURIComponent(room));
        }
      }
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}

function getRandomColor() {
  let color;
  do {
    color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  } while (isInvalidColor(color)); // Keep generating until a valid color is found
  return color;
}

function isInvalidColor(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const brightness = r * 0.299 + g * 0.587 + b * 0.114; // Standard luminance formula
  const isGray =
    Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;

  // Ensure the color is neither too bright (>200) nor too dark (<80) and is not grayish
  return brightness > 200 || brightness < 80 || isGray;
}
