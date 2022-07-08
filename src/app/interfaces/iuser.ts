export interface IUser {
  email: string;
  password: string;
  name: string;
  uid: string;
  createdAt: Date;
  updatedAt: Date;
  avatars: any;
  _id: any;
}

export interface IUserX extends IUser {
  avatar?: string;
}
