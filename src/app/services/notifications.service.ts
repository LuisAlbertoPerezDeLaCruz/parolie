import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GlobalConstants } from "../common/global-constants";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import { ChangesService } from "./changes.service";

export interface Note {
  to: string;
  message: string;
  type: string;
  read?: boolean;
  dontShow?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class NotificationsService implements OnDestroy {
  apiUrl = GlobalConstants.apiURL;
  currentUser = null;
  userRef = null;

  auth_api_token = null;
  uid = null;
  api_user_id = null;

  notis: any[] = [];
  subscriptions: Subscription = new Subscription();

  new_notis_subject = new BehaviorSubject(false);
  unread_notis_subject = new BehaviorSubject(false);

  constructor(
    private httpClient: HttpClient,
    private changesService: ChangesService
  ) {}

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async setUpService() {
    const infoSub = this.changesService
      .receiveChange()
      .subscribe((info: string) => {
        this.manageNotesChange(info);
      });
    this.subscriptions.add(infoSub);
    const notis: any = await this.getNotiMessages().toPromise();
    this.notis = notis;
    this.unread_notis_subject.next(notis.length > 0);
  }

  getNotiMessages(type: string = "unread"): Observable<any> {
    let endPoint = "notes/findByQuery";
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    let fields = {
      to: this.api_user_id,
      type: "NOTIFICATION",
      dontShow: "false",
    };
    if (type == "unread") {
      fields["read"] = false;
    } else if (type == "read") {
      fields["read"] = true;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };

    return this.httpClient.get(apiUrl, options);
  }

  getMessageById(id: string): Observable<any> {
    let endPoint = `notes/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.get(apiUrl, options);
  }

  createMessage(
    message: string,
    type: string,
    to: string,
    metadata: Object = {}
  ): Observable<any> {
    let endPoint = "notes/";
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const fields = {
      to: to,
      type: type,
      message: message,
      metadata: metadata,
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.post(apiUrl, fields, options);
  }

  async manageNotesChange(info) {
    if (info.collection == "notes" && info.action == "create") {
      const result: any = await this.getMessageById(info.id).toPromise();
      const user_id = this.api_user_id;
      if (result.to._id == user_id && result.type != "CHAT") {
        result.date = new Date(result.createdAt);
        this.notis.unshift(result);
      }
    }
  }

  setUnreadNotiToRead(noti_id: string): Observable<any> {
    let endPoint = `notes/${noti_id}`;
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const fields = {
      read: "true",
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }

  setNoteToUnShow(noti_id: string): Observable<any> {
    let endPoint = `notes/${noti_id}`;
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const fields = {
      dontShow: "true",
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.patch(apiUrl, fields, options);
  }
}
