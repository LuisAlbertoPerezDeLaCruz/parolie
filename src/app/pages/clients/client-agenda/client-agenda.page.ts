import { Component, OnInit } from "@angular/core";
import {
  MbscEventcalendarOptions,
  MbscCalendarEvent,
} from "@mobiscroll/angular5";
import { LanguageService } from "../../../services/language.service";
import { ApiService } from "../../../services/api.service";
import { IUser } from "../../../interfaces/iuser";
import { IUserfb } from "../../../interfaces/iuserfb";
import { LoadingController, ModalController } from "@ionic/angular";
import { ChatModalPage } from "../../../modals/chat-modal/chat-modal.page";
import { ConfigService } from "../../../services/config.service";
import { NotificationsService } from "../../../services/notifications.service";
import { CheckoutSelectCardPage } from "../../../modals/checkout-select-card/checkout-select-card.page";
import { CheckoutNewCardPage } from "../../../modals/checkout-new-card/checkout-new-card.page";
import { PaymentsService } from "../../../services/payments.service";

@Component({
  selector: "app-client-agenda",
  templateUrl: "./client-agenda.page.html",
  styleUrls: ["./client-agenda.page.scss"],
})
export class ClientAgendaPage implements OnInit {
  myEvents: MbscCalendarEvent[] = [];
  user_fb: IUserfb;
  user_api: IUser = null;
  eventSettings: MbscEventcalendarOptions;
  ready = false;

  constructor(
    private apiService: ApiService,
    private languageService: LanguageService,
    private modalController: ModalController,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit(): void {
    this.user_fb = this.configService.getUserFB();
    this.user_api = this.configService.getUserApi();
    this.loadReservations();
    const languageSelected = this.languageService.getLanguage();
    const locale = this.languageService.getLocale(languageSelected);

    this.ready = true;

    this.eventSettings = {
      locale: locale,
      theme: "ios",
      themeVariant: "light",
      view: {
        calendar: { type: "week" },
        agenda: { type: "day" },
      },
    };
  }

  async loadReservations() {
    const token = this.user_fb.auth_api_token;
    const result = await this.apiService
      .getReservationsByQuery(token, { creator: this.user_api._id })
      .toPromise();
    let reservations: MbscCalendarEvent[] = [];
    result.forEach((element) => {
      reservations.push({
        id: element._id,
        _id: element._id,
        service: element.service,
        title: `Reserved to ${this.user_api.name}`,
        editable: false,
        color: element.location.color,
        start: new Date(element.start),
        end: new Date(element.end),
        avatar: element.translator.avatars.application,
        name: element.translator.name,
        translator_id: element.translator._id,
        translator_name: element.translator.name,
        locality: element.location.name,
        payments: element.payments,
        unpaid: element.payments.length == 0 ? true : false,
        status: element.status,
      });
    });
    this.myEvents = reservations;
    return reservations;
  }

  startChat(translator_id: string, translator_name: string) {
    this.openChatModal(translator_id, translator_name);
  }

  async openChatModal(translator_id: string, translator_name: string) {
    const modal = await this.modalController.create({
      component: ChatModalPage,
      cssClass: "chat-modal",
      backdropDismiss: false,
      componentProps: { to: translator_id, toName: translator_name },
    });
    await modal.present();

    modal.onDidDismiss().then((result: any) => {});
  }

  async cancel(reservation) {
    const result = await this.apiService
      .updateReservation(null, { status: "CANCELLED" }, reservation.id)
      .toPromise();
    const n: any = await this.notificationsService
      .createMessage(
        `Reservation on you was cancelled by the client
      <br/>
      Client: ${reservation.title.replace("Reserved to", "")}
      <br/>
      Date: ${reservation.start}`,
        "NOTIFICATION",
        reservation.translator_id,
        {
          title: "Reservation cencelled",
          subtype: "RESERVATION",
          action: "CANCEL",
          _id: reservation.id,
        }
      )
      .toPromise();
    reservation.status = result.status;
  }

  async callForCheckout(reservation) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let cards = await this.getPaymentMethods();
    loading.dismiss();
    console.log("cards: ", cards);
    if (cards.length == 0) {
      await this.callCheckoutNewCard(reservation);
    } else {
      await this.callCheckoutSelectCard(reservation, cards);
    }
  }

  async callCheckoutSelectCard(reservation, cards) {
    const modal = await this.modalController.create({
      component: CheckoutSelectCardPage,
      breakpoints: [0, 0.6, 0.8, 1],
      cssClass: "custom-modal",
      initialBreakpoint: 0.6,
      componentProps: {
        reservation: reservation,
        cards: cards,
      },
    });
    modal.onDidDismiss().then(async (data: any) => {
      if (data.data?.newCard) {
        this.callCheckoutNewCard(reservation);
      }
    });
    modal.present();
  }

  async callCheckoutNewCard(reservation) {
    const reservation_id = reservation.id;
    const modal = await this.modalController.create({
      component: CheckoutNewCardPage,
      breakpoints: [0, 0.6, 0.8, 1],
      cssClass: "custom-modal",
      initialBreakpoint: 0.6,
      componentProps: { reservation: reservation },
    });
    modal.onDidDismiss().then(async (data: any) => {
      const paymentIntent = data.data?.paymentIntent;
      if (paymentIntent) {
        let payments: any[] = reservation.payments;
        payments.push({
          amount: paymentIntent.amount,
          down_payment: true,
          total_payment: false,
          comments: "",
          createdAt: new Date(),
          paymentIntent: paymentIntent,
        });
        if (paymentIntent.status == "succeeded") {
          await this.apiService
            .updateReservation(
              this.user_fb.auth_api_token,
              {
                payments: payments,
              },
              reservation_id
            )
            .toPromise();
        }
      }
    });
    modal.present();
  }

  async getPaymentMethods() {
    const customerId = this.user_fb.customerId;
    console.log({ customerId });
    const paymentMethods = await this.paymentsService
      .getStripeCustomerPaymentMethods(customerId)
      .toPromise();
    let cards = paymentMethods?.data;
    cards.forEach((element) => {
      element.card.icon = this.paymentsService.getIcon(element.card.brand);
    });
    return cards;
  }
}
