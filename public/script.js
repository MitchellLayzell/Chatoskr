const socket = io();
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendSystemMessage("You joined", "gray"); // Full system message in color
  socket.emit("new-user", roomName, name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage("You", message, "blue"); // Only username is colored
    socket.emit("send-chat-message", roomName, message);
    messageInput.value = "";
  });
}

socket.on("room-created", (room) => {
  const roomElement = document.createElement("div");
  roomElement.innerText = room;
  const roomLink = document.createElement("a");
  roomLink.href = `/${room}`;
  roomLink.innerText = "Join";
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
});

socket.on("chat-message", (data) => {
  appendMessage(data.name, data.message, data.color);
});

socket.on("user-connected", (data) => {
  appendSystemMessage(`${data.name} connected`, "green"); // Full text in color
});

socket.on("user-disconnected", (name) => {
  appendSystemMessage(`${name} disconnected`, "red"); // Full text in color
});

function appendMessage(name, message, color = "black") {
  const messageElement = document.createElement("div");

  const nameSpan = document.createElement("span");
  nameSpan.innerText = name;
  nameSpan.style.color = color;
  nameSpan.style.fontWeight = "bold";
  nameSpan.style.paddingRight = "5px";

  messageElement.appendChild(nameSpan);
  messageElement.appendChild(document.createTextNode(`: ${message}`));

  messageContainer.append(messageElement);

  // Auto-scroll to the bottom
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendSystemMessage(message, color) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.style.color = color;
  messageElement.style.fontWeight = "bold";

  messageContainer.append(messageElement);

  // Auto-scroll to the bottom
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
