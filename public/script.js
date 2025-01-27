const socket = io();
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendMessage("You joined");
  socket.emit("new-user", roomName, name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
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
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

window.addEventListener("beforeunload", () => {
  socket.disconnect(); // Ensure cleanup when the user leaves or refreshes
});

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  const messageContainer = document.getElementById("message-container");
  messageContainer.append(messageElement);

  // Scroll to bottom unconditionally
  messageContainer.scrollTop = messageContainer.scrollHeight;

  // Optional: If you want to keep the "isAtBottom" logic
  const isAtBottom =
    messageContainer.scrollTop + messageContainer.clientHeight >=
    messageContainer.scrollHeight - 1; // Tolerate 1px rounding errors

  if (isAtBottom) {
    scrollToBottom(messageContainer);
  }
}

function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}
