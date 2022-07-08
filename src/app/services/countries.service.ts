import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GlobalConstants } from "../common/global-constants";

@Injectable({
  providedIn: "root",
})
export class CountriesService {
  apiUrl = GlobalConstants.apiURL;

  constructor(private httpClient: HttpClient) {}

  // This function is here for refference only
  getAllCountries(): Observable<any> {
    let params = new HttpParams();
    const fields = "alpha3Code;name;capital;flag;region;timezones;callingCodes";
    params = params.set("fields", fields);
    return this.httpClient.get("https://restcountries.com/v2/all", {
      params: params,
    });
  }

  // This function was build with data from our mongo database
  getCountries(): Observable<any> {
    let endPoint = `countries`;
    const apiUrl = this.apiUrl + endPoint;
    const options = {
      headers: {},
      params: {},
    };
    return this.httpClient.get(apiUrl, options);
  }
}
