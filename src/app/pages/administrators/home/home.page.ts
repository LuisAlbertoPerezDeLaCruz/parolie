import { Component, OnInit } from "@angular/core";

import { Storage } from "@ionic/storage-angular";

import { NotificationsService } from "../../../services/notifications.service";

import { AuthService } from "../../../services/auth.service";
import { Router } from "@angular/router";
import { AlertController, LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AdministratorService } from "src/app/services/administrator.service";
import { ApiService } from "src/app/services/api.service";
import { ConfigService } from "src/app/services/config.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  pendingTranslators: any = null;
  approvedTranslators: any = null;
  ready = false;
  administrator: any = null;

  constructor(
    private auth: AuthService,
    private alertCtrl: AlertController,
    private administratorService: AdministratorService,
    private router: Router,
    private translate: TranslateService,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    let loading = await this.loadingCtrl.create({
      message: this.translate.instant("CONTROLS.loading"),
    });
    await loading.present();
    const user = await this.auth.getCurrentUserData();
    this.notificationsService.auth_api_token = user.auth_api_token;
    this.notificationsService.uid = user.uid;
    this.notificationsService.api_user_id = user.api_user_id;
    this.administrator = user;
    let user_api = await this.apiService
      .get_user_by_email(user.email, user.auth_api_token)
      .toPromise();
    this.configService.setUserApi(user_api);
    this.configService.setUserFB(user);
    this.configService.loaded = true;
    this.configService.fromLanding = true;
    await this.storage.set("PAROLIE.USER_API", user_api);
    await this.storage.set("PAROLIE.USER_FB", user);
    loading.dismiss();
    this.setUp().then(() => {
      this.ready = true;
    });
  }

  ionViewWillEnter() {
    this.setUp();
  }

  async setUp() {
    this.administratorService.listPendingTranslators().then((res) => {
      this.pendingTranslators = res;
    });
    this.administratorService.listApprovedTranslators().then((res) => {
      this.approvedTranslators = res;
    });
  }

  async signOut() {
    let inputAlert = await this.alertCtrl.create({
      header: "Log out ?",
      buttons: [
        {
          text: this.translate.instant("BUTTONS.cancel"),
          role: "cancel",
        },
        {
          text: this.translate.instant("BUTTONS.ok"),
          handler: () => {
            this.auth.logout();
          },
        },
      ],
    });
    inputAlert.present();
  }

  linkToTranslatorsList(type) {
    this.administratorService.set_translators_list_show(type);
    this.router.navigateByUrl("administrator-home/translators-list");
  }
}
