import { IUser } from './iuser';

export interface ILocation {
  name: string;
  locality: string;
  address: string;
  latitude: number;
  longitude: number;
  keywords: string;
  primary: boolean;
  color: string;
  creator?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: any;
}
