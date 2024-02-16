import { WebSocketServer, createWebSocketStream } from 'ws';
import { getUserLength } from './db';
import { ISocket } from './models';
import { Event } from './enums';
import { updateRoom, updateWinners } from './handlers';

export const initWebSocketServer = (serverPort: number) => {
  const sockets: ISocket[] = [];

  const webSocketServer = new WebSocketServer({ port: serverPort}, () => console.log(`Web Socket server on the ${serverPort} port!`) );
  
  webSocketServer.on('connection', (ws, req) => {
    sockets.push({ id: sockets.length + 1, socket: ws });
    const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false });
    let currentPlayerId: number
  
    console.log((`WS_params:${JSON.stringify(req.socket.address())}`))
  
    wsStream.on('data', async (rawData) => {
      const { type, data, id } = JSON.parse(rawData);

      switch (type) {
        case Event.REG: {
          const resRegData = JSON.stringify({
            type,
            id,
            data: JSON.stringify({
              name: data.name,
              index: getUserLength(),
              error: false,
              errorText: "",
            })
          });

          currentPlayerId = getUserLength();

          ws.send(resRegData);
          updateRoom(sockets);
          updateWinners(sockets);

          break;
        }
        // case 'create_room': {
        //   const resData = JSON.stringify({
        //     type: 'create_game',
        //     id,
        //     data: JSON.stringify({
        //       idGame: getGameLength(),
        //       idPlayer: currentPlayerId,
        //     })
        //   })

        //   ws.send(resData);

        //   break; 
        // }
        // case 'update_room': {
        //   console.log('update_room');

        //   break;
        // }
      }
    });
    
  });
}
