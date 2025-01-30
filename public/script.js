const socket = io();
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendMessage("System", "You joined", "gray"); // System message
  socket.emit("new-user", roomName, name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage("You", message, "blue"); // Your own messages
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
  appendMessage("System", `${data.name} connected`, "green");
});

socket.on("user-disconnected", (name) => {
  appendMessage("System", `${name} disconnected`, "red");
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
