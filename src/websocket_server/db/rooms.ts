import { IRoom, IUser } from '../models';

const rooms: IRoom[] = [];

const getRoomsLength = () => rooms.length;

export const getRooms = () => rooms;

export const getRoomsWithOneUser = () =>
  rooms.filter(({ roomUsers }) => roomUsers.length === 1);

export const getUsersByRoomId = (roomId: number): [number, number] => {
  const roomsUsers = rooms.find((room) => room.roomId === roomId)?.roomUsers;
  return [roomsUsers[0].index, roomsUsers[1].index];
};

export const createNewRoom = (roomUser: IUser) =>
  rooms.push({ roomId: getRoomsLength(), roomUsers: [roomUser] });

export const addSecondUserToRoom = (indexRoom: number, roomUser: IUser) => {
  const roomIndex = rooms.findIndex(({ roomId }) => roomId === indexRoom);
  if (roomIndex >= 0)
    rooms[roomIndex].roomUsers = [...rooms[roomIndex].roomUsers, roomUser];
};
