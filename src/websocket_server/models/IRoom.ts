export interface IRoomUser {
  name: string;
  index: number;
}

export interface IRoom {
  roomId: number;
  roomUsers: IRoomUser[];
}
