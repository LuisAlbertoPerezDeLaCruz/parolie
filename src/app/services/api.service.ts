import { EventEmitter, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { GlobalConstants } from "../common/global-constants";
import { Firestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  apiUrl = GlobalConstants.apiURL;
  auth_api_token = null;
  uid = null;
  api_user_id = null;
  reload_page: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private db: Firestore
  ) {
    this.authService.getCurrentUserData().then((user) => {
      if (user) {
        this.auth_api_token = user.auth_api_token;
        this.uid = user.uid;
        this.api_user_id = user.api_user_id;
      }
    });
  }

  getToken(email: string, password: string): Observable<any> {
    let endPoint = "auth/";
    const apiUrl = this.apiUrl + endPoint;
    return this.httpClient.post(apiUrl, { email: email, password: password });
  }

  get_user_by_email(email: string, token: string): Observable<any> {
    let endPoint = `users/email`;
    const apiUrl = this.apiUrl + endPoint;
    return this.httpClient.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
      params: { email: email },
    });
  }

  get_user_by_id(id: string, token: string): Observable<any> {
    let endPoint = `users/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    return this.httpClient.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  get_user_by_query(fields: any = {}, token: string): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `users/findByQuery`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  updateUser(token: any = null, fields, id): Observable<any> {
    let endPoint = `users/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }

  check_email(email: string): Observable<any> {
    let endPoint = `users/check-email`;
    const apiUrl = this.apiUrl + endPoint;
    return this.httpClient.get(apiUrl, { params: { "check-email": email } });
  }

  getTranslatorProfile(token: any = null, fields: any = {}): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `translator-profile/findByFilter`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  createTranslatorProfile(token: any = null, fields): Observable<any> {
    let endPoint = `translator-profile`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.post(apiUrl, fields, options);
  }

  updateTranslatorProfile(token: any = null, fields, id): Observable<any> {
    let endPoint = `translator-profile/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }

  createLocation(token: any = null, fields): Observable<any> {
    fields = this.transLatLng(fields);
    let endPoint = `locations`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    fields["color"] = this.getRandomColor();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.post(apiUrl, fields, options);
  }

  getTranslatorLocations(token: any = null, fields: any = {}): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `locations/findByQuery`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  updateLocation(token: any = null, fields, id): Observable<any> {
    fields = this.transLatLng(fields);
    let endPoint = `locations/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }

  deleteLocation(token: any = null, id): Observable<any> {
    let endPoint = `locations/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.delete(apiUrl, options);
  }

  deleteTranslatorLocations(user_api_id: string = null): Promise<any> {
    if (!user_api_id) {
      user_api_id = this.api_user_id;
    }
    return new Promise(async (resolve) => {
      const fields = { creator: user_api_id };
      const locations = await this.getTranslatorLocations(
        null,
        fields
      ).toPromise();
      let promises = [];
      locations.forEach((location) => {
        promises.push(this.deleteLocation(null, location._id).toPromise());
      });
      Promise.all(promises).then((res) => {
        resolve(res);
      });
    });
  }

  getTranslatorAvailabilities(
    token: any = null,
    fields: any = {}
  ): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `availabilities/findByQuery`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };

    return this.httpClient.get(apiUrl, options);
  }

  async setUserLocations(locations: any[]) {
    const result = await this.deleteTranslatorLocations();
    const currentLocations = await locations.forEach((fields) => {
      fields = this.transLatLng(fields);
      this.createLocation(null, fields).toPromise();
    });
  }

  createAvailability(token: any = null, fields): Observable<any> {
    let endPoint = `availabilities`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.post(apiUrl, fields, options);
  }

  updateAvailability(token: any = null, fields, _id: any): Observable<any> {
    let endPoint = `availabilities/${_id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }

  deleteAvailability(token: any = null, _id: any): Observable<any> {
    let endPoint = `availabilities/${_id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.delete(apiUrl, options);
  }

  deleteTranslatorAvailabilities(
    token: any = null,
    fields: any = {}
  ): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `availabilities/removeByFilter`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${this.auth_api_token}`,
      },
      params: fields,
    };
    return this.httpClient.delete(apiUrl, options);
  }

  setUserAvailabilities(availabilities: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let promises = [];
      await this.deleteTranslatorAvailabilities().toPromise();
      const locations: any[] = await this.getTranslatorLocations().toPromise();
      availabilities.forEach(async (availability) => {
        const availabilityLocation = locations.find((element) => {
          return (
            element.name == availability.location.name &&
            element.latitude == availability.location.latitude &&
            element.longitude == availability.location.longitude
          );
        });
        promises.push(
          this.createAvailability(null, {
            allDay: availability.allDay,
            title: availability.title,
            startTime: availability.startTime,
            endTime: availability.endTime,
            startTimeStr: availability.startTimeStr,
            endTimeStr: availability.endTimeStr,
            location: availabilityLocation._id,
          }).toPromise()
        );
      });
      Promise.all(promises).then((res) => {
        resolve(res);
      });
    });
  }

  transLatLng(fields: any): any {
    if (typeof fields.latitude === "string") {
      fields.latitude = Number(fields.latitude.replace("+", ""));
    }
    if (typeof fields.longitude === "string") {
      fields.longitude = Number(fields.longitude.replace("+", ""));
    }
    return fields;
  }

  empty_object(obj) {
    return Object.keys(obj).length == 0;
  }

  getLocationsByQuery(token: any = null, fields: any = {}): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `locations/findByQuery`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  getLocationsBySearch(
    token: any = null,
    searchString: string
  ): Observable<any> {
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `locations/findBySearch`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { searchString: searchString },
    };
    return this.httpClient.get(apiUrl, options);
  }

  getTranslatorsBySearch(
    token: any = null,
    searchString: string,
    criteria: any
  ): Observable<any> {
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `translators/findBySearch`;
    const apiUrl = this.apiUrl + endPoint;
    criteria["searchString"] = searchString;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: criteria,
    };
    return this.httpClient.get(apiUrl, options);
  }

  getReservationsById(token: any = null, id: string): Observable<any> {
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `reservations/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.get(apiUrl, options);
  }

  getReservationsByQuery(token: any = null, fields: any = {}): Observable<any> {
    if (this.empty_object(fields)) {
      fields = { creator: this.api_user_id };
    }
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `reservations/findByQuery`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  createReservation(token: any = null, fields: any): Observable<any> {
    fields.status = "BLOCKED";
    let endPoint = `reservations`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.post(apiUrl, fields, options);
  }

  updateReservation(token: any = null, fields, _id: any): Observable<any> {
    let endPoint = `reservations/${_id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }

  getLatestAvailability(token: any = null): Observable<any> {
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `availabilities/findLatest`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.get(apiUrl, options);
  }

  deleteReservation(token: any = null, _id: any): Observable<any> {
    let endPoint = `reservations/${_id}`;
    const apiUrl = this.apiUrl + endPoint;
    if (!token) {
      token = this.auth_api_token;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.delete(apiUrl, options);
  }

  getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getTranslatorServices(token: any = null): Observable<any> {
    if (!token) {
      token = this.auth_api_token;
    }
    let endPoint = `translator-services`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.get(apiUrl, options);
  }
}
