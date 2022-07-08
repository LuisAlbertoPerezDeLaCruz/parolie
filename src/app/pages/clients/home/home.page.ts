import { Component, OnInit } from "@angular/core";
import {
  AlertController,
  ModalController,
  PopoverController,
} from "@ionic/angular";

import { AuthService } from "../../../services/auth.service";
import { LanguagePopoverPage } from "../../language-popover/language-popover.page";
import { ApiService } from "../../../services/api.service";
import { ConfigService } from "../../../services/config.service";
import { Storage } from "@ionic/storage-angular";
import { RateTranslatorPage } from "src/app/modals/rate-translator/rate-translator.page";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  client = null;
  ready = false;
  notis: any[] = [];
  auth_api_token = null;

  constructor(
    private auth: AuthService,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private apiService: ApiService,
    private configService: ConfigService,
    private storage: Storage,
    private modalController: ModalController,
    private router: Router
  ) {}

  async ngOnInit() {}

  async ionViewWillEnter() {
    // await this.storage.create();
    const user = await this.auth.getCurrentUserData();
    if (user) {
      this.client = user;
      let user_api = await this.apiService
        .get_user_by_email(user.email, user.auth_api_token)
        .toPromise();
      this.configService.setUserApi(user_api);
      this.configService.setUserFB(user);
      this.auth_api_token = user.auth_api_token;
      this.configService.loaded = true;
      this.configService.fromLanding = true;
      await this.storage.set("PAROLIE.USER_API", user_api);
      await this.storage.set("PAROLIE.USER_FB", user);
      const deliveredReservations = await this.apiService
        .getReservationsByQuery(this.auth_api_token, {
          creator: user_api._id,
          status: "DELIVERED",
        })
        .toPromise();
      if (deliveredReservations.length > 0) {
        if (!deliveredReservations[0]?.rated) {
          this.showRateTranslatorModal(deliveredReservations[0]);
        }
      }
      let unpaidReservations: any[] = [];
      const approvedReservations = await this.apiService
        .getReservationsByQuery(this.auth_api_token, {
          creator: user_api._id,
          status: "APPROVED",
        })
        .toPromise();
      approvedReservations.forEach((element) => {
        if (element.payments.length == 0) {
          unpaidReservations.push(element);
        }
      });
      if (unpaidReservations.length > 0) {
        console.log(unpaidReservations);
        let inputAlert = await this.alertCtrl.create({
          header: "Payment needed",
          message: `You have ${unpaidReservations.length} reservation(s) with pending payments. Please go to "My Agenda" to apply payments.`,
          buttons: [
            {
              text: "Later",
              role: "cancel",
            },
            {
              text: "Pay now",
              handler: () => {
                this.router.navigateByUrl("/client-library");
              },
            },
          ],
        });
        inputAlert.present();
      }
      this.ready = true;
    }
  }

  async openLanguagePopover(ev) {
    const popover = await this.popoverCtrl.create({
      component: LanguagePopoverPage,
      event: ev,
    });
    await popover.present();
  }

  async signOut() {
    let inputAlert = await this.alertCtrl.create({
      header: "Log out ?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "ok",
          handler: () => {
            this.auth.logout();
          },
        },
      ],
    });
    inputAlert.present();
  }

  async showRateTranslatorModal(reservation) {
    await this.openRateTranslatorModal(reservation);
  }

  async openRateTranslatorModal(reservation) {
    const modal = await this.modalController.create({
      component: RateTranslatorPage,
      cssClass: "rate-modal",
      backdropDismiss: true,
      componentProps: {
        reservation: reservation,
        token: this.auth_api_token,
      },
    });
    await modal.present();

    modal.onDidDismiss().then((result: any) => {});
  }
}
