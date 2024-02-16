import { IUser } from '../models'

const users: IUser[] = [];

export const createNewUser = (user: IUser) => users.push(user);

export const getUserLength = () => users.length;
