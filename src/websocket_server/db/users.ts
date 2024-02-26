import { WebSocket } from 'ws';
import { IUserWithWS } from '../models';

const users: IUserWithWS[] = [];

export const getUsers = () => users;

export const getUsersLength = () => users.length;

export const getOpponentsWs = ([firstUserIndex, secondUserIndex]: [number, number]): [
  WebSocket,
  WebSocket,
] => {
  const firstWs = users.find(({ index }) => index === firstUserIndex).ws;
  const secondWs = users.find(({ index }) => index === secondUserIndex).ws;
  return [firstWs, secondWs];
};

export const createNewUser = (user: IUserWithWS) => users.push(user);

export const getNameByIndexUser = (index: number) => {
  return users.find((user) => user.index === index).name;
};
