// TODO: определиться с тем, что сначала в базе меняем а потом на фронт или наоборот?
import { WebSocketServer, createWebSocketStream, WebSocket } from 'ws';
import {
  getUsersLength,
  getGameLength,
  createNewRoom,
  addSecondUserToRoom,
  createNewUser,
  getUsersByRoomId,
  getOpponentsWs,
  getRooms,
  getUsers,
  createNewGame,
  addShipsForGame,
  isAllUsersInGameAddShips,
  getShipsUserInGame,
  getUsersByGameId,
  games,
  getGameById,
  attack,
  getIndexEnemyByGameIdByUserId,
  getGameTurnByGameId,
  setGameTurn,
  checkIsMyTurn,
  checkIsFinishGame,
  getNameByIndexUser,
  updateWinnersInDb,
  deleteGameById,
} from './db';
import { IUser } from './models';
import { EventType } from './enums';
import { updateRoom, updateWinners } from './handlers';

export const initWebSocketServer = (serverPort: number) => {
  
  const sockets: WebSocket[] = [];

  const webSocketServer = new WebSocketServer({ port: serverPort }, () =>
    console.log(`Web Socket server on the ${serverPort} port!`)
  );

  webSocketServer.on('connection', (ws, req) => {
    sockets.push(ws);
    const wsStream = createWebSocketStream(ws, {
      encoding: 'utf8',
      decodeStrings: false,
    });
    let currentUser: IUser;

    console.log(`WS_params:${JSON.stringify(req.socket.address())}`);

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
              errorText: '',
            }),
          });
          ws.send(resRegData);

          currentUser = newUser;
          createNewUser({ ...newUser, ws });
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
          
          const usersIndexesInRoom = getUsersByRoomId(parsedData.indexRoom);
          const opponentsWs = getOpponentsWs(usersIndexesInRoom);

          opponentsWs.forEach((socket, index) => {
            const newGame = {
              idGame,
              idPlayer: usersIndexesInRoom[index],
            };
            const resCreateGameData = JSON.stringify({
              type: EventType.CREATE_GAME,
              id,
              data: JSON.stringify(newGame),
            });

            socket.send(resCreateGameData);
          });

          createNewGame({ idGame });

          break;
        }

        case EventType.ADD_SHIPS: {
          const { gameId, indexPlayer, ships } = parsedData;
          addShipsForGame({ gameId, indexPlayer, ships });

          if (isAllUsersInGameAddShips(gameId)) {
            const usersIndexesInGame = getUsersByGameId(parsedData.gameId);
            const opponentsWs = getOpponentsWs(usersIndexesInGame);

            opponentsWs.forEach((socket, index) => {
              const resGameData = JSON.stringify({
                type: EventType.START_GAME,
                id,
                data: JSON.stringify({
                  ships: getShipsUserInGame({ idGame: gameId, indexPlayer: usersIndexesInGame[index] }),
                  currentPlayerIndex: currentUser.index,
                }),
              });

              socket.send(resGameData);
            });


            const turnGameData = JSON.stringify({
              type: EventType.TURN,
              id,
              data: JSON.stringify({
                currentPlayer: getGameTurnByGameId(gameId),
              }),
            });

            opponentsWs.forEach((socket) => {
              socket.send(turnGameData);
            });
          }

          break;
        }

        case EventType.ATTACK: {
          const { gameId, x, y, indexPlayer } = parsedData;

          const isMyTurn = checkIsMyTurn({idGame: gameId, indexPlayerWantAttack: indexPlayer});

          if (isMyTurn) {
            const shotStatus = attack({ gameId, x, y, indexPlayer });
            const usersIndexesInGame = getUsersByGameId(parsedData.gameId);
            const opponentsWs = getOpponentsWs(usersIndexesInGame);
            const enemyIndexInGame = getIndexEnemyByGameIdByUserId({ idGame: parsedData.gameId, indexPlayer });
  
            const nextPlayerIndex = shotStatus === 'miss' ? enemyIndexInGame : indexPlayer;
  
            let isFinishGame = false;
            
            if (shotStatus !== 'miss') {
              isFinishGame = checkIsFinishGame({ idGame: gameId, currentUserIndex: indexPlayer });
            }
            
            // TODO: Если игра финиш, то тут лишняя переменная. 
            const turnGameData = JSON.stringify({
              type: EventType.TURN,
              id,
              data: JSON.stringify({
                currentPlayer: nextPlayerIndex,
              }),
            });

            // TODO: Если игра не финиш, то тут лишняя переменная.
            const finishGameData = JSON.stringify({
              type: EventType.FINISH,
              id,
              data: JSON.stringify({
                winPlayer: indexPlayer,
              }),
            });
  
            opponentsWs.forEach((socket, index) => {
              const attackData = JSON.stringify({
                type: EventType.ATTACK,
                id,
                data: JSON.stringify({
                  position: { x, y },
                  currentPlayer: indexPlayer,
                  status: shotStatus,
                }),
              });
              socket.send(attackData);

              if (isFinishGame) {
                socket.send(finishGameData);
              } else {
                socket.send(turnGameData);
              } 
            });
  

            if (isFinishGame) {
              const nameUser = getNameByIndexUser(indexPlayer);
              updateWinnersInDb(nameUser);
              deleteGameById(gameId);
              updateWinners(sockets);
            } else {
              setGameTurn({idGame: gameId, nextPlayerIndex});
            }

          } 

          break;

        }

      }
    });
  });
};
