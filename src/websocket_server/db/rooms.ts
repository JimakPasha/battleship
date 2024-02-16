import { IRoom, IRoomUser } from '../models'

const rooms: IRoom[] = [];

const roomsLength = rooms.length;

export const getRoomsWithOneUser = () => rooms.filter(({ roomUsers })=> roomUsers.length === 1);

export const createNewRoom = (roomUser: IRoomUser) => rooms.push({roomId: roomsLength, roomUsers: [ roomUser ]});

export const addSecondUserToRoom = (indexRoom: number, roomUser: IRoomUser) => {
  const roomIndex = rooms.findIndex(({ roomId }) => roomId === indexRoom);

  //TODO: error roomId !== indexRoom
  if (roomIndex <= 0) rooms[roomIndex].roomUsers = [...rooms[roomIndex].roomUsers, roomUser];
}
