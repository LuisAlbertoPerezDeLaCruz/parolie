import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { IonContent, ModalController, NavParams } from "@ionic/angular";
import { Subscription, BehaviorSubject } from "rxjs";
import { ChatsService } from "src/app/services/chats.service";
import { AuthService } from "src/app/services/auth.service";
import { ChangesService } from "src/app/services/changes.service";

@Component({
  selector: "app-chat-modal",
  templateUrl: "./chat-modal.page.html",
  styleUrls: ["./chat-modal.page.scss"],
})
export class ChatModalPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;

  messages = new BehaviorSubject([]);

  newMsg = "";
  to: string = "";
  toName: string = "";

  subscriptions: Subscription = new Subscription();
  currentUser = null;

  auth_api_token = null;
  uid = null;
  api_user_id = null;

  constructor(
    private chatsService: ChatsService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private auth: AuthService,
    private changesService: ChangesService
  ) {}

  async ngOnInit() {
    this.to = this.navParams.get("to");
    this.toName = this.navParams.get("toName");
    const user: any = await this.auth.getCurrentUserData();
    if (user) {
      this.api_user_id = user.api_user_id;
      this.chatsService.auth_api_token = user.auth_api_token;
      this.chatsService.uid = user.uid;
      this.chatsService.api_user_id = user.api_user_id;
      this.loadMessages();
    }
    const infoSub = this.changesService
      .receiveChange()
      .subscribe((info: string) => {
        this.manageNotesChange(info);
      });
    this.subscriptions.add(infoSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadMessages() {
    let messages: any = await this.chatsService
      .getChatMessages(this.to)
      .toPromise();
    messages.sort((obj1, obj2) => {
      if (obj1.createdAt > obj2.createdAt) {
        return 1;
      }
      if (obj1.createdAt < obj2.createdAt) {
        return -1;
      }
      return 0;
    });
    let promises = [];
    messages.forEach(async (element) => {
      element.myMsg = element.creator._id == this.chatsService.api_user_id;
      element.date = new Date(element.createdAt);
      if (!element.read) {
        const promise = await this.chatsService
          .setUnreadChatToRead(element._id)
          .toPromise();
        promises.push(promise);
      }
    });
    await Promise.all(promises);
    this.messages.next(messages);
    this.chatsService.new_chats_subject.next(false);
  }

  async sendMessage() {
    const result = await this.chatsService
      .addChatMessage(this.to, this.newMsg)
      .toPromise();
    this.content.scrollToBottom();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async manageNotesChange(info) {
    if (info.collection == "chats" && info.action == "create") {
      const user_id = this.chatsService.api_user_id;
      const chatObject = info.object;
      if (chatObject.to._id == user_id || chatObject.creator._id == user_id) {
        if (chatObject.creator._id == user_id) {
          chatObject.myMsg = true;
        }
        chatObject.date = new Date(chatObject.createdAt);
        const messages: any[] = this.messages.getValue();
        messages.push(chatObject);
        this.messages.next(messages);
      }
    }
  }
}
