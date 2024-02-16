import { WebSocketServer, createWebSocketStream } from 'ws';

export const initWebSocketServer = (serverPort: number | string) => {
  const sockets = [];
  
  const webSocketServer = new WebSocketServer({ port: serverPort}, () => console.log(`Web Socket server on the ${serverPort} port!`) );
  
  webSocketServer.on('connection', (ws, req) => {
    sockets.push(ws);
    const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false });
  
    console.log((`WS_params:${JSON.stringify(req.socket.address())}`))
  
    wsStream.on('data', async (rawData) => {
      const { type, data, id } = JSON.parse(rawData);
      console.log(rawData);

      switch (type) {
        case 'reg': {
          const resData = JSON.stringify({
            type,
            id,
            data: JSON.stringify({
              name: data.name,
              index: 0,
              error: false,
              errorText: "",
            })
          })

          ws.send(resData);
        }
        case 'create_room': {
          const resData = JSON.stringify({
            type,
            id,
            data: JSON.stringify({
              idGame: 0,
              idPlayer: 0,
            })
          })

          ws.send(resData);
        }
        case 'update_room': {
          console.log('update_room');
        }
      }
    });
    
  });
}
