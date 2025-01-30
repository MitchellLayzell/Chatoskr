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

app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  // Send message that new room was created
  io.emit("room-created", req.body.room);
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.render("room", { roomName: req.params.room });
});

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  socket.on("new-user", (room, name) => {
    console.log(`${name} joined room: ${room}`);
    socket.join(room);
    if (!rooms[room]) rooms[room] = { users: {} };

    const randomColor = getRandomColor();

    rooms[room].users[socket.id] = { name, color: randomColor };
    socket.to(room).emit("user-connected", { name, color: randomColor });
  });

  socket.on("send-chat-message", (room, message) => {
    if (!rooms[room]?.users[socket.id]) return;

    const user = rooms[room].users[socket.id];
    console.log(`Message from ${user.name} in room ${room}: ${message}`);

    socket.to(room).emit("chat-message", {
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
          io.emit("room-deleted", room);
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
  } while (isGrayish(color)); // Avoid grayish colors
  return color;
}

function isGrayish(hex) {
  // Convert hex to RGB
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Check if color is too close to black, white, or gray
  const brightness = r * 0.299 + g * 0.587 + b * 0.114; // Standard luminance formula
  const isGray =
    Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;

  return brightness > 220 || brightness < 50 || isGray; // Avoid too bright, too dark, or gray colors
}
