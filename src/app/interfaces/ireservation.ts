import { IUser } from './iuser';
import { ILocation } from './ilocation';
export interface IReservation {
  start: Date;
  end: Date;
  translator: IUser;
  location: ILocation;
  status: string;
  creator?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}

export interface IReservationX extends IReservation {
  startDate?: Date;
}
