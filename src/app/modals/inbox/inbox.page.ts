import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ChatsService } from "../../services/chats.service";
import { ConfigService } from "../../services/config.service";
import { ChatModalPage } from "../chat-modal/chat-modal.page";
import { NotificationsService } from "src/app/services/notifications.service";

@Component({
  selector: "app-inbox",
  templateUrl: "./inbox.page.html",
  styleUrls: ["./inbox.page.scss"],
})
export class InboxPage implements OnInit {
  ready = false;
  currentTab = "messages";
  segment = "messages";
  chatUsers: any;
  user_api = null;
  token = null;
  notis = null;
  count: number = null;
  viewed_notifications = false;

  constructor(
    private modalController: ModalController,
    private chatsService: ChatsService,
    private notificationsService: NotificationsService,
    private configService: ConfigService
  ) {}

  async ngOnInit() {
    this.user_api = this.configService.user_api;
    this.token = this.configService.user_fb.auth_api_token;
    const result = await this.chatsService
      .getChatWith(this.user_api._id, this.token)
      .toPromise();
    this.chatUsers = result;
    this.chatUsers.forEach(async (element: any) => {
      element.photo = "../../../assets/imgs/blank-profile-picture.png";
      if (element.user.avatars.application) {
        element.photo = element.user.avatars.application;
      } else if (element.avatars.application) {
        element.photo = element.user.avatars.google;
      }
    });
    const notis: any = await this.notificationsService
      .getNotiMessages()
      .toPromise();
    this.notis = notis;
    this.count = notis.length;
    this.ready = true;
  }

  onClickView(tab) {}

  async close() {
    if (this.viewed_notifications) {
      let promises = [];
      this.notis.forEach((element) => {
        const prom = this.notificationsService
          .setUnreadNotiToRead(element._id)
          .toPromise();
        promises.push(prom);
      });
      await Promise.all(promises);
      this.notificationsService.unread_notis_subject.next(false);
      this.notificationsService.new_notis_subject.next(false);
    }
    this.modalController.dismiss();
  }

  segmentChanged(ev: any) {
    if (ev.detail.value == "notifications") {
      this.viewed_notifications = true;
    }
  }

  startChat(creator_id: string, creator_name: string) {
    this.openChatModal(creator_id, creator_name);
    this.chatUsers.forEach((element) => {
      if (element.user._id == creator_id) {
        element.unreads = 0;
      }
    });
  }

  async openChatModal(creator_id: string, creator_name: string) {
    const modal = await this.modalController.create({
      component: ChatModalPage,
      cssClass: "chat-modal",
      backdropDismiss: false,
      componentProps: {
        to: creator_id,
        toName: creator_name,
      },
    });
    await modal.present();

    modal.onDidDismiss().then((result: any) => {});
  }

  async onChangeSelect($event) {
    const type = $event.detail.value;
    const notis: any = await this.notificationsService
      .getNotiMessages(type)
      .toPromise();
    this.notis = notis;
    this.count = notis.length;
  }

  updateCount($event) {
    console.log({ $event });
    this.count--;
  }
}
