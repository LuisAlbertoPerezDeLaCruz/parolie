import { Component, OnInit, LOCALE_ID, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { AuthService } from "../../../services/auth.service";
import { ApiService } from "../../../services/api.service";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.page.html",
  styleUrls: ["./list.page.scss"],
})
export class ListPage implements OnInit, OnDestroy {
  constructor(
    private auth: AuthService,
    private administratorService: AdministratorService,
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  allTranslators: Observable<any>;
  translators: any = null;

  defaultPhoto = "../../../../assets/imgs/blank-profile-picture.png";

  administrator = null;
  token = null;

  subscriptions: Subscription = new Subscription();

  ready = false;

  ngOnInit() {
    this.administrator = this.configService.getUserFB();
    this.token = this.administrator.auth_api_token;
  }

  async ionViewWillEnter() {
    await this.setUp();
    this.ready = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async setUp() {
    return new Promise((resolve) => {
      const showType = this.administratorService.get_translators_list_show();

      if (showType == "pending") {
        this.administratorService.listPendingTranslators().then((res) => {
          this.translators = res;
          this.translators.forEach(async (element: any) => {
            this.extendTranslatorInfo(element);
          });
          resolve(true);
        });
      } else if (showType == "approved") {
        this.administratorService
          .listApprovedTranslators()
          .then(async (res) => {
            this.translators = res;
            this.translators.forEach(async (element: any) => {
              this.extendTranslatorInfo(element);
            });
            resolve(true);
          });
      }
    });
  }

  async extendTranslatorInfo(element) {
    let profile = null;
    let user_api = await this.apiService
      .get_user_by_email(element.email, this.token)
      .toPromise();
    const result = await this.apiService
      .getTranslatorProfile(this.token, { creator: user_api._id })
      .toPromise();
    if ("availability" in element) {
      element.has_availability = true;
    } else {
      element.has_availability = false;
    }
    if ("reservations" in element) {
      element.has_reservations = true;
    } else {
      element.has_reservations = false;
    }
    if (result.length > 0) {
      profile = result[0];
      element["photo"] = profile.picture;
    } else {
      element["photo"] = this.defaultPhoto;
    }
  }
}
