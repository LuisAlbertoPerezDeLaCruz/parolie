import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  user_fb: any = null;
  user_api: any = null;

  public loaded: boolean = false;
  public fromLanding: boolean = false;
  public has_new_info: boolean;

  constructor() {}

  setUserApi(value) {
    this.user_api = value;
  }

  getUserApi() {
    return this.user_api;
  }

  setUserFB(value) {
    this.user_fb = value;
  }

  getUserFB() {
    return this.user_fb;
  }
}
