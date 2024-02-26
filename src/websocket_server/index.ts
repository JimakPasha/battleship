import { WebSocketServer, createWebSocketStream } from 'ws';
import { getUsersLength, createNewRoom } from './db';
import { ISocket, IUser } from './models';
import { EventType } from './enums';
import {
  addShips,
  addUserToRoom,
  randomAttack,
  regestrationUser,
  updateRoom,
  userAttack,
} from './handlers';

export const initWebSocketServer = (serverPort: number) => {
  const sockets: ISocket[] = [];

  const webSocketServer = new WebSocketServer({ port: serverPort }, () =>
    console.log(`Web Socket server on the ${serverPort} port!`)
  );

  webSocketServer.on('connection', (ws, req) => {
    sockets.push({ ws, userIndex: getUsersLength() });
    const wsStream = createWebSocketStream(ws, {
      encoding: 'utf8',
      decodeStrings: false,
    });
    let currentUser: IUser;

    wsStream.on('data', async (rawData) => {
      const { id, type, data } = JSON.parse(rawData);
      const parsedData = data ? JSON.parse(data) : data;

      switch (type) {
        case EventType.REG: {
          const newUser = {
            name: parsedData.name,
            index: getUsersLength(),
          };
          regestrationUser({ id, newUser, type, ws, sockets });
          currentUser = newUser;
          break;
        }

        case EventType.CREATE_ROOM: {
          createNewRoom(currentUser);
          updateRoom(sockets);
          break;
        }

        case EventType.ADD_USER_TO_ROOM: {
          addUserToRoom({ currentUser, id, indexRoom: parsedData.indexRoom, sockets });
          break;
        }

        case EventType.ADD_SHIPS: {
          addShips({ currentUser, id, parsedData });
          break;
        }

        case EventType.ATTACK: {
          userAttack({ id, parsedData, sockets });
          break;
        }

        case EventType.RANDOM_ATTACK: {
          randomAttack({ id, parsedData, sockets });
          break;
        }
      }
    });

    ws.on('close', () => {
      const removedIndex = sockets.findIndex((socket) => socket.ws === ws);
      if (removedIndex > -1) {
        sockets.splice(removedIndex, 1);
      }
    });
  });
};
