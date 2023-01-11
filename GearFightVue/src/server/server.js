const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http);

var counter = -1;

Http.listen(3222, () => {
  console.log("Listening at :3222...");
});

Socketio.on("connection", socket => {
  console.log("1 user connecting.");
  socket.emit("counter", counter);
  socket.on("click", data => {
    console.log("a client clicked: ", data);
    counter++;
    Socketio.emit("counter", counter);
  });
});