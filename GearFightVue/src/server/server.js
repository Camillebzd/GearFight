const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemoryRoomStore } = require("./roomStore");
const roomStore = new InMemoryRoomStore();
var rooms = [];

Http.listen(3222, () => {
  console.log("Listening at :3222...");
});

// Middleware
Socketio.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("invalid userId"));
  }
  socket.userId = userId;
  next();
});

Socketio.on("connection", socket => {
  console.log("1 user connecting: ", socket.userId);

  socket.on("initFight", data => {
    console.log("a client request init fight: ", data);
    let roomId = randomId();
    // rooms.push({id: roomId, data: data}); // remove
    let roomData = {};
    roomData.id = roomId;
    roomData.lead = data.leadAllies
    // launch fight system.
    roomStore.saveRoom(roomId, {
      leadAllies: data.leadAllies,
      allies: data.allies,
      enemies: data.enemies,
    });
    Socketio.emit("roomCreated", roomData);
  });
  socket.on("getRoomData", roomId => {
    console.log("Asking for room data: ", roomId);
    // let pos = rooms.findIndex(room => room.id == roomId);
    // if (pos > - 1) {
    //   socket.emit("roomData", rooms[pos]);
    // }
    socket.emit("roomData", roomStore.findRoom(roomId));
  });
  socket.on("launchSpell", data => {
    console.log(`spell launched -> user: ${data.user.name} | spell: ${data.spell.name} | target: ${data.target.name}, id: ${data.target.id}`);

  });
  // socket.on("disconnection")
});