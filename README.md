Chat App README
Overview
This is a simple chat application where users can join different chat rooms and communicate with each other in real-time. Built using Node.js, Express, and Socket.io, the app features dynamic room creation and live messaging.

Features
Room creation: Users can create and join chat rooms.
Real-time messaging: Messages are instantly transmitted to all users in a room.
User notifications: Displays when users join or leave the chat.
Socket.io integration: Handles real-time bidirectional communication between users and the server.
Folder Structure
bash
Copy
Edit
├── public
│   ├── favicon.ico
│   ├── main.css
│   ├── room.css
│   ├── index.css
│   └── script.js
├── views
│   ├── index.ejs
│   └── room.ejs
├── server.js
└── package.json
Key Files
index.ejs
The homepage where users can view and join existing rooms, or create a new room. It dynamically lists available rooms.

room.ejs
The page representing each chat room. Users can send messages in real-time, and the chat window updates live with messages from other users.

script.js
Handles the logic for the frontend interactions:

Prompting users for their name
Sending and receiving chat messages via Socket.io
Handling user connections and disconnections
Displaying messages in the chat container
server.js
The backend that:

Serves the chat app via Express
Manages rooms and users
Handles Socket.io connections for real-time communication
Emits events when users join, send messages, or disconnect
Installation
Prerequisites
Node.js (v14 or higher)
Steps
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-repo/chat-app.git
cd chat-app
Install dependencies:

bash
Copy
Edit
npm install
Start the server:

bash
Copy
Edit
npm start
Open your browser and navigate to http://localhost:3000 to start using the chat app.

Usage
Create a Room: On the homepage, type a room name and click "New Room" to create a room.
Join a Room: Click on an existing room to join.
Send Messages: Type a message in the input field at the bottom and click "Send" to communicate with others in the room.
Real-Time Updates: Messages sent by users in the same room will appear immediately for all connected users.
Development
Adding Styles
You can modify or add custom styles in the public folder. The app is linked to main.css, index.css, and room.css.

Adding New Features
Add new routes in server.js to create new endpoints or handle different actions.
Modify script.js to add new interactivity or features like private messaging or user avatars.
Contributing
Feel free to fork the repository and submit pull requests for bug fixes, improvements, or new features.

License
This project is open-source and available under the MIT License.

