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
    roomData.lead = data.roomLeader;
    // launch fight system.
    // let fightInterval = setInterval(() => {(roomId)}, 10000);
    roomStore.saveRoom(roomId, {
      roomLeader: data.roomLeader,
      group1: data.group1,
      group2: data.group2,
      fightSystem: {turn: 1},
    });
    console.log(`Room created with id: ${roomId}, roomLeader: ${data.roomLeader}, group1: ${data.group1}, group2: ${data.group2}`);
    Socketio.emit("roomCreated", roomData);
  });
  socket.on("getRoomData", roomId => {
    console.log("Asking for room data: ", roomId);
    socket.emit("roomData", JSON.stringify(roomStore.findRoom(roomId)));
  });
  socket.on("launchSpell", action => {
    console.log(`spell launched -> user: ${action.user.name} | spell: ${action.spell.name} | target: ${action.target.name}, id: ${action.target.id}`);
    updateRoomWithAction(action.roomId, action);
    if (everyPlayersPlayed(action.roomId)) {
      autoSpellMonsters(action.roomId)
      resolveTurn(action.roomId);
    }

    // let roomData = roomStore.findRoom(action.roomId);
    // console.log(roomData.group2[0].action.user);
  });
  // socket.on("disconnection")
});

// -- export this
function determineOrder(room, actions) {
  actions.sort((a, b) => {
    return getEntitieFromRoom(room, {id: b.user.id, isNPC: b.user.isNPC, side: b.user.side}).speed - getEntitieFromRoom(room, {id: a.user.id, isNPC: a.user.isNPC, side: a.user.side}).speed;
  });
}

// useless atm
function createEntities(data) {
  let entities = {};

  entities.monsters = [];
  entities.players = [];
  data.group2.map(enemy => {
    if (enemy.isNPC)
      entities.monsters.push({id: enemy.id, played: false, action: {}});
    else
      entities.players.push({id: enemy.id, played: false, action: {}});
  });
  data.group1.map(ally => {
    if (ally.isNPC)
      entities.monsters.push({id: ally.id, played: false, action: {}});
    else
      entities.players.push({id: ally.id, played: false, action: {}});
  });
  return entities;
}

function updateRoomWithAction(roomId, action) {
  let room = roomStore.findRoom(roomId);

  room[action.user.side].map(entity => {
    if (entity.id === action.user.id && entity.isNPC === action.user.isNPC) {
      entity.action = {
        user: {id: action.user.id, isNPC: action.user.isNPC, side: action.user.side},
        spell: action.spell,
        target: {id: action.target.id, isNPC: action.target.isNPC, side: action.target.side}
      };
      entity.played = true;
    }
  });
  roomStore.saveRoom(action.roomId, room);
}

function everyPlayersPlayed(roomId) {
  let room = roomStore.findRoom(roomId);
  let allPlayed = true;

  room.group1.map(entity => {
    if (!entity.played && !entity.isNPC)
      allPlayed = false;
  });
  room.group2.map(entity => {
    if (!entity.played && !entity.isNPC)
      allPlayed = false;
  });
  return allPlayed;
}

var spells = require('../data/spells.json');
const { resolveAction, getEntitieFromRoom } = require("./fightsystem/fight");

function getSpell(spellName) {
  return spells.find(spell => spell.name === spellName);
}

function autoSpellMonsters(roomId) {
  let room = roomStore.findRoom(roomId);

  room.group1.map(entity => {
    if (entity.isNPC) {
      let action = {user: {id: entity.id, isNPC: true, side: 'group1'}, spell: getSpell(entity.skills[0]), target: room.group2[0]};
      updateRoomWithAction(roomId, action);
    }
  });
  room.group2.map(entity => {
    if (entity.isNPC) {
      let action = {user: {id: entity.id, isNPC: true, side: 'group2'}, spell: getSpell(entity.skills[0]), target: room.group1[0]};
      updateRoomWithAction(roomId, action);
    }
  });
}

function resolveTurn(roomId) {
  let actions = [];
  let room = roomStore.findRoom(roomId);

  room.group1.map(entity => {
    actions.push(entity.action);
  });
  room.group2.map(entity => {
    actions.push(entity.action);
  });
  determineOrder(room, actions);
  // do spells
  actions.map(action => {
    console.log(`${action.user.id} launch ${action.spell.name} on ${action.target.id}`);
    resolveAction(room, action);
  });
  console.log(room.group1[0].life);
  room.fightSystem.turn += 1;
  roomStore.saveRoom(roomId, room);
}