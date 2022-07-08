import { IUser } from './iuser';
import { ILocation } from './ilocation';

export interface IAvailability {
  allDay?: boolean;
  title?: string;
  startTime: Date;
  endTime: Date;
  startTimeStr?: string;
  endTimeStr?: string;
  location?: ILocation;
  creator?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: any;
}
