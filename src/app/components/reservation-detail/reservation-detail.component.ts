import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { IReservation, IReservationX } from "../../interfaces/ireservation";
import { IUserX } from "../../interfaces/iuser";
import { ApiService } from "../../services/api.service";
import { ModalController } from "@ionic/angular";
import { ChatModalPage } from "../../modals/chat-modal/chat-modal.page";
import { NotificationsService } from "../../services/notifications.service";
import { AdministratorService } from "../../services/administrator.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-reservation-detail",
  templateUrl: "./reservation-detail.component.html",
  styleUrls: ["./reservation-detail.component.scss"],
})
export class ReservationDetailComponent implements OnInit, OnDestroy {
  @Input() reservation: IReservationX;
  @Input() token: string;
  @Input() canEdit: boolean;

  creator: IUserX = null;
  avatar: string = "";
  startDate: Date = null;
  ready = false;
  unchanged = true;
  administrators: any[] = [];
  timeOver = false;

  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private modalController: ModalController,
    private notificationsService: NotificationsService,
    private administratorService: AdministratorService
  ) {}

  async ngOnInit() {
    this.creator = this.reservation.creator;
    if (this.creator.avatars.application) {
      this.creator.avatar = this.creator.avatars.application;
    } else if (this.creator.avatars.google) {
      this.creator.avatar = this.creator.avatars.google;
    } else {
      this.creator.avatar = "../../../assets/imgs/blank-profile-picture.png";
    }
    this.reservation.startDate = new Date(this.reservation.start);
    this.administrators = await this.administratorService.listAdministrators();
    const endTime = new Date(this.reservation.end);
    const today = new Date();
    if (today > endTime) {
      this.timeOver = true;
    }
    this.ready = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async change_status(reservation: IReservation, status) {
    const result = await this.apiService
      .updateReservation(this.token, { status: status }, reservation._id)
      .toPromise();
    this.apiService.reload_page.emit(status);
    const notiClient1 = this.notificationsService
      .createMessage(
        `Your reservation was ${status}`,
        "NOTIFICATION",
        result.creator._id,
        {
          subtype: "RESERVATION",
          _id: result._id,
          title: `Reservation ${status}`,
        }
      )
      .toPromise();
    if (status == "APPROVED") {
      const notiClient2 = this.notificationsService
        .createMessage(
          `Reservation payment pending`,
          "NOTIFICATION",
          result.creator._id,
          {
            subtype: "RESERVATION",
            _id: result._id,
            title: `Reservation Payment`,
          }
        )
        .toPromise();
    }

    this.administrators.forEach((administrator) => {
      const notiAdmon = this.notificationsService
        .createMessage(
          `Reservation ${status}`,
          "NOTIFICATION",
          administrator.api_user_id,
          {
            subtype: "RESERVATION",
            _id: result._id,
            title: `Reservation ${status}`,
          }
        )
        .toPromise();
    });
  }

  startChat(creator_id: string, creator_name: string) {
    this.openChatModal(creator_id, creator_name);
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
}
