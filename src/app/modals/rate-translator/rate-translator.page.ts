import { Component, Input, OnInit } from "@angular/core";
import { format } from "date-fns";
import { ApiService } from "../../services/api.service";
import { ModalController } from "@ionic/angular";
import { mobiscroll } from "@mobiscroll/angular";
import { enUS, es, fr, it, de, zhCN } from "date-fns/locale";
import { LanguageService } from "../../services/language.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-rate-translator",
  templateUrl: "./rate-translator.page.html",
  styleUrls: ["./rate-translator.page.scss"],
})
export class RateTranslatorPage implements OnInit {
  @Input("reservation") reservation;
  @Input("token") token;
  rating = 0;
  comments = "";
  message = null;

  constructor(
    private apiService: ApiService,
    private modalController: ModalController,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    let locale = this.languageService.getLocaleForDateFns();
    const date = new Date(this.reservation.start);
    const dateFormated = format(date, "PPPP", { locale: locale });
    this.message = `${this.translate.instant(
      "RATE.on"
    )} ${dateFormated}, ${this.translate.instant("RATE.youReceived")}.`;
  }

  updateRating($event) {
    this.rating = $event;
  }

  async send() {
    const result = await this.apiService
      .updateReservation(
        this.token,
        {
          rated: true,
          rating: {
            rate: this.rating,
            comments: this.comments,
            accounted: false,
          },
        },
        this.reservation._id
      )
      .toPromise();
    mobiscroll.toast({
      title: "Success",
      display: "center",
      color: "success",
      message: `${this.translate.instant("RATE.thankYou")} !!!`,
      callback: () => {
        this.modalController.dismiss();
      },
    });
  }
}
