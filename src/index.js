const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;
const { renderMessage, renderLocation } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const publicDir = path.join(__dirname, "../public/");

app.use(express.static(publicDir));

// app.get("/", (req, res) => {
//   res.sendFile(publicDir);
// });

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options,
    });

    if (error) {
      callback(error);
    }
    if (user) {
      socket.join(user.room);
      socket.emit("message", renderMessage("Admin", `welcome to ${user.room}`));
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          renderMessage("Admin", `${user.userName} has joined to ${user.room}`)
        );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    // console.log(user);

    io.to(user.room).emit("message", renderMessage(user.userName, message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    console.log(location);
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      renderLocation(
        user.userName,
        `http://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      socket
        .to(user.room)
        .emit("message", renderMessage("Admin", `${user.userName} has left`));

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("listening on port", port);
});
