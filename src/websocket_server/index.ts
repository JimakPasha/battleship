import { WebSocketServer, createWebSocketStream } from 'ws';
import { getUserLength, getGameLength, createNewRoom, addSecondUserToRoom } from './db';
import { ISocket, IUser } from './models';
import { EventType } from './enums';
import { updateRoom, updateWinners } from './handlers';

export const initWebSocketServer = (serverPort: number) => {
  const sockets: ISocket[] = [];

  const webSocketServer = new WebSocketServer({ port: serverPort}, () => console.log(`Web Socket server on the ${serverPort} port!`) );
  
  webSocketServer.on('connection', (ws, req) => {
    sockets.push({ id: sockets.length + 1, socket: ws });
    const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false });
    let currentUser: IUser;
  
    console.log((`WS_params:${JSON.stringify(req.socket.address())}`))
  
    // TODO: переименовтаь название rawData
    wsStream.on('data', async (rawData) => {
      const { id, type, data } = JSON.parse(rawData);

      switch (type) {
        case EventType.REG: {
          const newUser = {
            name: data.name,
            index: getUserLength(),
          };
          const resRegData = JSON.stringify({
            type,
            id,
            data: JSON.stringify({
              ...newUser,
              error: false,
              errorText: "",
            })
          });
          ws.send(resRegData);

          currentUser = newUser;
          updateRoom(sockets);
          updateWinners(sockets);

          break;
        }

        case EventType.CREATE_ROOM: {
          createNewRoom(currentUser);
          break;
        }

        case EventType.ADD_USER_TO_ROOM: {
          addSecondUserToRoom(data.indexRoom, currentUser);
          updateRoom(sockets);

          const newGame = {
            idGame: getGameLength(),
            idPlayer: currentUser.index,
          };
          const resCreateGameData = JSON.stringify({
            type: EventType.CREATE_GAME,
            id,
            data: JSON.stringify(newGame),
          });

          ws.send(resCreateGameData);
          // TODO: по идее нужно в bd создать игру
          
          break;
        }
      }
    });
    
  });
}
