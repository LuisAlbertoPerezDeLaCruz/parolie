import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  LoadingController,
  NavParams,
  ModalController,
  ToastController,
} from "@ionic/angular";
import { AuthService } from "../../services/auth.service";
import { environment } from "../../../environments/environment";
import { PaymentsService } from "../../services/payments.service";
import { ConfigService } from "src/app/services/config.service";

declare var Stripe;

@Component({
  selector: "app-checkout-new-card",
  templateUrl: "./checkout-new-card.page.html",
  styleUrls: ["./checkout-new-card.page.scss"],
  providers: [FormBuilder],
})
export class CheckoutNewCardPage implements OnInit {
  dataForm: FormGroup;

  stripe: any = null;
  card: any = null;
  cardErrors: any = null;

  user_fb = null;

  @ViewChild("cardElement", { static: true }) cardElement: ElementRef;

  reservation = null;

  ready = false;

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalController: ModalController,
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private configService: ConfigService,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.reservation = this.navParams.get("reservation");

    this.user_fb = this.configService.getUserFB();
    this.dataForm = this.fb.group({
      name: ["Luis Alberto Parolie", Validators.required],
      zip: ["8082", Validators.required],
      street: ["Calle San Pablo #38", Validators.required],
      city: ["Caracas", Validators.required],
      country: ["VE", Validators.required],
    });

    this.stripe = Stripe(environment.stripe_key);
    const elements = this.stripe.elements();

    this.card = elements.create("card");
    this.card.mount(this.cardElement.nativeElement);

    this.card.addEventListener("change", ({ error }) => {
      console.log("error:", error);
      this.cardErrors = error && error.message;
    });

    this.ready = true;
  }

  getTotal() {
    const amountToPayJSON = this.paymentsService.getAmountToPay(
      this.reservation
    );
    return amountToPayJSON.amount / 100;
  }

  close(result) {
    this.modalController.dismiss(result);
  }

  async buyNow() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    const amountToPayJSON = this.paymentsService.getAmountToPay(
      this.reservation
    );

    const stripeData = {
      payment_method_data: {
        billing_details: {
          name: this.dataForm.get("name").value,
          address: {
            line1: this.dataForm.get("street").value,
            city: this.dataForm.get("city").value,
            postal_code: this.dataForm.get("zip").value,
            country: this.dataForm.get("country").value,
          },
          email: this.authService.getEmail(),
        },
      },
      receipt_email: this.authService.getEmail(),
    };

    console.log("stripeData: ", stripeData);

    this.paymentsService
      .startPaymentIntent(
        amountToPayJSON.amount,
        {
          reservation: this.reservation._id,
        },
        amountToPayJSON.currency
      )
      .subscribe(
        async (paymentIntent) => {
          console.log("my payment intent: ", paymentIntent);
          const secret = paymentIntent.client_secret;

          console.log("secret: ", secret);

          console.log("this.card: ", this.card);

          this.stripe.handleCardPayment(secret, this.card, stripeData).then(
            async (result) => {
              console.log("result: ", result);
              await loading.dismiss();
              const toast = await this.toastCtrl.create({
                message: `Thanks for your payment`,
                duration: 3000,
              });
              await toast.present();
              this.close(result);
            },
            async (err) => {
              if (err) {
                await loading.dismiss();
                const toast = await this.toastCtrl.create({
                  message: `Couldn't process payment, please try again later`,
                  duration: 3000,
                });
                await toast.present();
              } else {
              }
            }
          );
        },
        async (err) => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: `Couldn't process payment, please try again later`,
            duration: 3000,
          });
          await toast.present();
        }
      );
  }
}
