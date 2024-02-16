import { IRoom } from '../models'

const rooms: IRoom[] = [];

export const getRoomsWithOneUser = () => rooms.filter(({ roomUsers })=> roomUsers.length === 1);
