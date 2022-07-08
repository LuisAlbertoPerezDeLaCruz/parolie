import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { MbscListviewOptions } from "@mobiscroll/angular";
import { formatDistance } from "date-fns";
import { LanguageService } from "../../services/language.service";
import { AuthService } from "../../services/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-translator-rating-details",
  templateUrl: "./translator-rating-details.page.html",
  styleUrls: ["./translator-rating-details.page.scss"],
})
export class TranslatorRatingDetailsPage implements OnInit, OnDestroy {
  @Input() profile: any;
  user_role = null;
  subscriptions: Subscription = new Subscription();

  lvsettings: MbscListviewOptions = {
    theme: "mobiscroll",
    themeVariant: "light",
    enhance: true,
    swipe: false,
  };

  constructor(
    private modalController: ModalController,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  today = new Date();
  locale = null;

  ngOnInit() {
    const roleSub = this.authService.role$.subscribe((res) => {
      this.user_role = res;
      console.log(this.user_role);
    });
    this.subscriptions.add(roleSub);

    console.log("this.profile:", this.profile);
    let locale = this.languageService.getLocaleForDateFns();
    this.profile.ratings.forEach((element) => {
      const result = formatDistance(new Date(element.createdAt), this.today, {
        locale: locale,
        addSuffix: true,
      });
      element.createdAtHumanized = `${result}`;
    });
  }

  close() {
    this.modalController.dismiss();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
