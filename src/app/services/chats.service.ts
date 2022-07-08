import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GlobalConstants } from "../common/global-constants";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import { ChangesService } from "./changes.service";

export interface Chat {
  to: string;
  message: string;
  type: string;
}

@Injectable({
  providedIn: "root",
})
export class ChatsService implements OnDestroy {
  apiUrl = GlobalConstants.apiURL;
  currentUser = null;
  userRef = null;

  auth_api_token = null;
  uid = null;
  api_user_id = null;

  subscriptions: Subscription = new Subscription();

  new_chats_subject = new BehaviorSubject(false);

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
    const chats: any = await this.getUnreadChatMessages(
      this.api_user_id
    ).toPromise();
    this.new_chats_subject.next(chats.length > 0);
  }

  async manageNotesChange(info) {
    if (info.collection == "chats" && info.action == "create") {
      const result: any = await this.getMessageById(info.id).toPromise();
    }
  }

  getChatMessages(to): Observable<any> {
    let endPoint = "chats/findByQuery";
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const fields = {
      to: to,
      creator: this.api_user_id,
      type: "CHAT",
      any: "true",
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  getUnreadChatMessages(to): Observable<any> {
    let endPoint = "chats/findByQuery";
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    let fields = {
      to: to,
      read: "false",
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  getMessageById(id: string): Observable<any> {
    let endPoint = `chats/${id}`;
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.get(apiUrl, options);
  }

  addChatMessage(to, msg): Observable<any> {
    let endPoint = "chats";
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const fields = {
      to: to,
      message: msg,
      type: "CHAT",
      metadata: {
        subtype: "CHAT",
      },
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpClient.post(apiUrl, fields, options);
  }

  getChatWith(id: string, token: string): Observable<any> {
    let endPoint = "chats/findChatWith";
    const apiUrl = this.apiUrl + endPoint;
    const fields = {
      user: id,
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };
    return this.httpClient.get(apiUrl, options);
  }

  setUnreadChatToRead(chat_id: string): Observable<any> {
    let endPoint = `chats/${chat_id}`;
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

  getUnReadChats(): Observable<any> {
    let endPoint = "Chats/findByQuery";
    const apiUrl = this.apiUrl + endPoint;
    const token = this.auth_api_token;
    const fields = {
      to: this.api_user_id,
      type: "CHAT",
      read: "false",
      dontShow: "false",
    };
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: fields,
    };

    return this.httpClient.get(apiUrl, options);
  }
}
