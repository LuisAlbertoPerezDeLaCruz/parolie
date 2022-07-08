import { IUser } from "./iuser";

export interface ICountryOfResidence {
  alpha3Code: string;
  callingCode: string;
  flag: string;
  name: string;
  region: string;
  timezone: string;
}

export interface INationality {
  alpha3Code: string;
  callingCode: string;
  flag: string;
  name: string;
  region: string;
  timezone: string;
}

export interface ITranslatorProfile {
  types_of_services: string[];
  languages: string[];
  first_name: string;
  last_name: string;
  middle_name: string;
  date_of_birth: Date;
  gender: string;
  nationality: string;
  nationality_obj: INationality;
  country_of_residence: string;
  country_of_residence_obj: ICountryOfResidence;
  city: string;
  zip_code: string;
  address: string;
  picture: string;
  phone_number: string;
  occupation: string;
  description: string;
  photo: string;
  creator: IUser;
  createdAt: Date;
  updatedAt: Date;
  average_rate: number;
}
