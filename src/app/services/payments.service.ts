import { Injectable } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/compat/functions";
import { Auth } from "@angular/fire/auth";
import { ConfigService } from "./config.service";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiService } from "./api.service";
import { differenceInMinutes } from "date-fns";
import { CurrencyPipe } from "@angular/common";

declare var Stripe;

@Injectable({
  providedIn: "root",
})
export class PaymentsService {
  stripe: any = null;

  constructor(
    private functions: AngularFireFunctions,
    private configService: ConfigService,
    private apiService: ApiService,
    private auth: Auth
  ) {
    this.stripe = Stripe(environment.stripe_key);
  }

  startPaymentIntent(amount, reservation, currency) {
    const callable = this.functions.httpsCallable("startPaymentIntent");
    const obs = callable({
      userId: this.auth.currentUser.uid,
      amount: amount,
      currency: currency,
      reservation: reservation,
      setup_future_usage: "off_session",
    });
    return obs;
  }

  getPaymentMethods(customerId) {
    const callable = this.functions.httpsCallable("customerPaymentMethods");
    const obs = callable({
      customerId: customerId,
    });
    return obs;
  }

  getStripeCustomerData(customerId) {
    const callable = this.functions.httpsCallable("getStripeCustomerData");
    const obs = callable({
      customer_id: customerId,
    });
    return obs;
  }

  getStripeCustomerPaymentMethods(customerId): Observable<any> {
    const callable = this.functions.httpsCallable("getCustomerPaymentMethods");
    const obs = callable({
      customer_id: customerId,
    });
    return obs;
  }

  getIcon(brand) {
    const path = "../../assets/cards72/";
    let icon = "";
    switch (brand) {
      case "amex":
        icon = "american_express.png";
        break;
      case "visa":
        icon = "visa.png";
        break;
      case "mastercard":
        icon = "mastercard.png";
        break;
      default:
        icon = "credit_card.png";
        break;
    }
    return `${path}${icon}`;
  }

  async payReservation(pm: any, reservation_id, amount, down_payment = false) {
    const user_fb = this.configService.getUserFB();
    const reservation = await this.apiService
      .getReservationsById(user_fb.auth_api_token, reservation_id)
      .toPromise();
    let payments: any[] = reservation.payments;
    const paymentIntent = await this.startPaymentIntent(
      amount * 100,
      {
        reservation_id: reservation_id,
      },
      "USD"
    ).toPromise();

    const secret = paymentIntent.client_secret;

    const result = await this.stripe.confirmCardPayment(secret, {
      payment_method: pm.id,
    });

    if (result) {
      const paymentIntent = result.paymentIntent;
      payments.push({
        amount: paymentIntent.amount,
        down_payment: down_payment,
        total_payment: !down_payment,
        comments: "",
        createdAt: new Date(),
        paymentIntent: paymentIntent,
      });
      if (paymentIntent.status == "succeeded") {
        await this.apiService
          .updateReservation(
            user_fb.auth_api_token,
            {
              payments: payments,
            },
            reservation_id
          )
          .toPromise();
      }
    }

    return result;
  }

  getAmountToPay(reservation) {
    console.log({ reservation });
    let serviceInfo = reservation.service.metadata;
    let start = new Date(reservation.start);
    let end = new Date(reservation.end);
    let slots = Math.round(differenceInMinutes(end, start) / 15);
    let amount = 0;
    let down_payment = false;
    let total_payment = false;
    const currency = serviceInfo.currency;

    if (reservation.payments.length == 0) {
      amount = serviceInfo.down_payment_required + serviceInfo.platform_fee;
      down_payment = true;
    } else {
      amount = serviceInfo.total_slot_price * slots;
      if (amount < serviceInfo.metadata.minumum_charge) {
        amount = serviceInfo.minumum_charge;
      }
      total_payment = true;
    }

    return {
      down_payment: down_payment,
      total_payment: total_payment,
      amount: amount,
      currency: currency,
    };
  }
}
