const socket = io();
const messageContainer = document.getElementById("message-content");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendSystemMessage("You joined", "black");

  const encodedRoomName = encodeURIComponent(roomName);
  socket.emit("new-user", encodedRoomName, name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage("You", message, "black");
    socket.emit("send-chat-message", encodedRoomName, message);
    messageInput.value = "";
  });
}

socket.on("room-created", (room) => {
  const decodedRoom = decodeURIComponent(room);
  const roomElement = document.createElement("div");
  roomElement.innerText = decodedRoom;

  const roomLink = document.createElement("a");
  roomLink.href = `/${encodeURIComponent(decodedRoom)}`;
  roomLink.innerText = "Join";

  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
});

socket.on("chat-message", (data) => {
  appendMessage(data.name, data.message, data.color);
});

socket.on("user-connected", (data) => {
  appendSystemMessage(`${data.name} connected`, "black");
});

socket.on("user-disconnected", (name) => {
  appendSystemMessage(`${name} disconnected`, "black");
});

socket.on("room-deleted", (room) => {
  const decodedRoom = decodeURIComponent(room);
  const roomElements = [...roomContainer.children];

  roomElements.forEach((element) => {
    if (
      element.innerText === decodedRoom ||
      element.href?.endsWith(`/${encodeURIComponent(decodedRoom)}`)
    ) {
      element.remove();
    }
  });
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
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendSystemMessage(message, color) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.style.color = color;
  messageElement.style.fontWeight = "bold";

  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
