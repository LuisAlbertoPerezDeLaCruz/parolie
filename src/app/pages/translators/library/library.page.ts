import { Component, OnInit } from "@angular/core";
import { TranslatorsService } from "../../../services/translators.service";
import { ConfigService } from "../../../services/config.service";
import { ModalController } from "@ionic/angular";
import { TranslatorRatingDetailsPage } from "../../../modals/translator-rating-details/translator-rating-details.page";
import { ApiService } from "../../../services/api.service";

@Component({
  selector: "app-library",
  templateUrl: "./library.page.html",
  styleUrls: ["./library.page.scss"],
})
export class LibraryPage implements OnInit {
  translator = null;
  token = null;
  ready = false;

  constructor(
    private translatorsService: TranslatorsService,
    private configService: ConfigService,
    private apiService: ApiService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.translator = this.configService.getUserFB();
    this.token = this.translator.auth_api_token;
    this.ready = true;
  }

  async switchMode(mode) {
    await this.translatorsService.switchMode(mode);
  }

  async showMyReviews() {
    const result = await this.apiService.getTranslatorProfile().toPromise();
    let profile = result[0];
    profile.ratings.forEach(async (element) => {
      const client = await this.apiService
        .get_user_by_id(element.createdBy, this.token)
        .toPromise();
      element.creator_name = client.name;
      element.avatars = client.avatars;
    });
    const modal = await this.modalController.create({
      component: TranslatorRatingDetailsPage,
      cssClass: "full-screen-modal",
      componentProps: {
        profile: profile,
      },
    });
    modal.onDidDismiss().then((data: any) => {});
    modal.present();
  }
}
