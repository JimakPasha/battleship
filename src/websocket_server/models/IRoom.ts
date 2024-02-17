import { IUser } from "./IUser";

export interface IRoom {
  roomId: number;
  roomUsers: IUser[];
}
