import { WebSocketServer, createWebSocketStream, WebSocket } from 'ws';
import { getUsersLength, getGameLength, createNewRoom, addSecondUserToRoom, createNewUser, getUsersByRoomId, getOpponentsWs, getRooms, getUsers, createNewGame, addShipsForGame } from './db';
import { IUser } from './models';
import { EventType } from './enums';
import { updateRoom, updateWinners } from './handlers';

export const initWebSocketServer = (serverPort: number) => {
  const sockets: WebSocket[] = [];

  const webSocketServer = new WebSocketServer({ port: serverPort}, () => console.log(`Web Socket server on the ${serverPort} port!`) );
  
  webSocketServer.on('connection', (ws, req) => {
    sockets.push(ws);
    const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false });
    let currentUser: IUser;
  
    console.log((`WS_params:${JSON.stringify(req.socket.address())}`))
  
    // TODO: переименовтаь название rawData
    wsStream.on('data', async (rawData) => {
      const { id, type, data } = JSON.parse(rawData);
      const parsedData = data ? JSON.parse(data) : data;
      
      switch (type) {
        case EventType.REG: {
          const newUser = {
            name: parsedData.name,
            index: getUsersLength(),
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
          createNewUser({...newUser, ws});
          updateRoom(sockets);
          updateWinners(sockets);

          break;
        }

        case EventType.CREATE_ROOM: {
          createNewRoom(currentUser);
          updateRoom(sockets);

          break;
        }

        case EventType.ADD_USER_TO_ROOM: {
          addSecondUserToRoom(parsedData.indexRoom, currentUser);
          updateRoom(sockets);
          const idGame = getGameLength();

          const newGame = {
            idGame,
            idPlayer: currentUser.index,
          };
          const resCreateGameData = JSON.stringify({
            type: EventType.CREATE_GAME,
            id,
            data: JSON.stringify(newGame),
          });

          const usersIndexesInRoom = getUsersByRoomId(parsedData.indexRoom);
          const opponentsWs = getOpponentsWs(usersIndexesInRoom);

          opponentsWs.forEach((socket) => {
            socket.send(resCreateGameData);
          });

          createNewGame({ idGame });
          
          break;
        }

        case EventType.ADD_SHIPS: {
          const { gameId, indexPlayer, ships} = parsedData;
          addShipsForGame({ gameId, indexPlayer, ships });

          // TODO: если есть позиции кораблей двух игроков, то начинать игру
        }
      }
    });
    
  });
}
