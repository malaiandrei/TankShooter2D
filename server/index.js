const io = require("socket.io"),
  server = io.listen(8000);

let connectedPlayers = new Map();

const RequestType = Object.freeze({
  CONNECT: 0,
  DISCONNECT: 1,
  GETCONNECTEDPLAYERS: 2,
  SETUSERNAME: 3,
  USERNAMEEXIST: 4,
  GETPLAYERS: 5,
  SENDPLAYERS: 6,
  CHANGEPOSITION: 7,
  CHANGEROTATION: 8,
  SENDPOSITION: 9,
  SENDROTATION: 10,
  KILLPLAYER: 11,
  ADDBULLET: 12,
  UPDATEHEAL: 13,
});

const findInMap = (map, val, idSocket) => {
  for (let [k, v] of map) {
    if (v === val) {
      return k;
    }
  }
  return idSocket;
};

function sendConnectedPlayers() {
  for (const [client, sequenceNumber] of connectedPlayers.entries()) {
    client.emit(RequestType.GETCONNECTEDPLAYERS, connectedPlayers.size);
  }
}

server.on("connection", (socket) => {
  socket.on("disconnect", () => {
    let tempUser;
    connectedPlayers.forEach((value, key) => {
      if (key.id === socket.id) {
        tempUser = value.username;
      }
    });
    connectedPlayers.delete(socket);

    if (tempUser) {
      for (const [client, value] of connectedPlayers.entries()) {
        client.emit(RequestType.DISCONNECT, { username: tempUser });
        client.emit(RequestType.GETCONNECTEDPLAYERS, connectedPlayers.size);
      }
    }
  });
  socket.on(RequestType.SETUSERNAME, (data) => {
    const username = data.username;
    const x = data.x;
    const y = data.y;
    if (findInMap(connectedPlayers, username, socket.id) != socket.id) {
      socket.emit(RequestType.USERNAMEEXIST, connectedPlayers.size);
      connectedPlayers.delete(socket);
      socket.disconnect(true);
    } else
      connectedPlayers.set(socket, {
        username: username,
        x: x,
        y: y,
        rotationTank: 0,
        rotationTun: 0,
      });
    sendConnectedPlayers();
  });

  socket.on(RequestType.ADDBULLET, (data) => {
    for (const [client, value] of connectedPlayers.entries()) {
      client.emit(RequestType.ADDBULLET, {
        username: data.username,
        x: data.x,
        y: data.y,
        rotation: data.rotation,
      });
    }
  });
  socket.on(RequestType.CHANGEROTATION, (data) => {
    const rotationTank = data.rotationTank;
    const rotationTun = data.rotationTun;
    const username = data.username;
    connectedPlayers.forEach((value, key) => {
      if (value.username === username) {
        value.rotationTank = rotationTank;
        value.rotationTun = rotationTun;
      }
    });
    sendRotation(username, rotationTank, rotationTun);
  });
  socket.on(RequestType.UPDATEHEAL, (data) => {
    connectedPlayers.forEach((value, key) => {
      key.emit(RequestType.UPDATEHEAL, {
        health: data.health,
        username: data.username,
      });
    });
  });

  socket.on(RequestType.KILLPLAYER, (data) => {
    const username = data.username;
    let tempKey;
    connectedPlayers.forEach((value, key) => {
      if (value.username === username) {
        tempKey = key;
      }
      key.emit(RequestType.KILLPLAYER, { username: username });
    });
    if (tempKey) {
      connectedPlayers.delete(tempKey);
      sendConnectedPlayers();
    }
  });

  socket.on(RequestType.CHANGEPOSITION, (data) => {
    const x = data.x;
    const y = data.y;
    const username = data.username;
    connectedPlayers.forEach((value, key) => {
      if (value.username === username) {
        value.x = x;
        value.y = y;
      }
    });
    sendPosition(username, x, y);
  });
  socket.on(RequestType.GETPLAYERS, () => {
    sendPlayers();
  });
});

function sendRotation(username, rotationTank, rotationTun) {
  for (const [client, value] of connectedPlayers.entries()) {
    client.emit(RequestType.SENDROTATION, {
      rotationTank: rotationTank,
      rotationTun: rotationTun,
      username: username,
    });
  }
}

function sendPosition(username, x, y) {
  for (const [client, value] of connectedPlayers.entries()) {
    client.emit(RequestType.SENDPOSITION, {
      y: y,
      x: x,
      username: username,
    });
  }
}

function sendPlayers() {
  const values = Array.from(connectedPlayers.values());
  for (const [client, value] of connectedPlayers.entries()) {
    client.emit(RequestType.SENDPLAYERS, values);
  }
}
