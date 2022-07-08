import { Component, OnInit } from "@angular/core";
import { NavParams, LoadingController, ToastController } from "@ionic/angular";
import { ModalController } from "@ionic/angular";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import { PaymentsService } from "../../services/payments.service";
import { ApiService } from "../../services/api.service";

declare var Stripe;

@Component({
  selector: "app-checkout-select-card",
  templateUrl: "./checkout-select-card.page.html",
  styleUrls: ["./checkout-select-card.page.scss"],
})
export class CheckoutSelectCardPage implements OnInit {
  stripe: any = null;
  pms: any[] = [];
  amount = null;
  reservation = null;
  user = null;
  ready = false;

  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private apiService: ApiService,
    private navParams: NavParams,
    private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.stripe = Stripe(environment.stripe_key);
    this.pms = this.navParams.get("cards");
    this.reservation = this.navParams.get("reservationd");
    this.amount = this.navParams.get("amount");
    this.user = await this.authService.getCurrentUserData();
  }

  newCard() {
    this.modalController.dismiss({ newCard: true });
  }

  async payReservation(pm: any) {
    const amountToPayJSON = this.paymentsService.getAmountToPay(
      this.reservation
    );

    const loading = await this.loadingCtrl.create();
    await loading.present();
    const result = await this.paymentsService.payReservation(
      pm,
      this.reservation._id,
      amountToPayJSON.amount,
      amountToPayJSON.down_payment
    );
    await loading.dismiss();
    let message = "";
    if (result.paymentIntent.status == "succeeded") {
      message = `Thanks for your payment`;
    } else {
      message = `Couldn't process payment, please try again later`;
    }
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
    });
    await toast.present();
    this.close(result);
  }

  close(result) {
    this.modalController.dismiss(result);
  }
}
