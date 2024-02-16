import 'dotenv/config';
import { httpServer } from './src/http_server';
import { initWebSocketServer } from './src/websocket_server';

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const SERVER_PORT = process.env.SERVER_PORT || 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

initWebSocketServer(SERVER_PORT);
