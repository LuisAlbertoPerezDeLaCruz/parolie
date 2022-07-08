import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AdministratorService } from "src/app/services/administrator.service";
import { ToastController } from "@ionic/angular";
import { ApiService } from "../../../services/api.service";
import { AuthService } from "../../../services/auth.service";
import { Subscription } from "rxjs";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.page.html",
  styleUrls: ["./detail.page.scss"],
})
export class DetailPage implements OnInit, OnDestroy {
  user: any = null;
  profile: any = null;
  submitting = false;

  administrator = null;
  token = null;

  ready = false;

  subscriptions: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private administratorService: AdministratorService,
    private router: Router,
    private toastCtrl: ToastController,
    private apiService: ApiService,
    private auth: AuthService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    const uid = this.activatedRoute.snapshot.paramMap.get("id");
    this.administrator = this.configService.getUserFB();
    this.token = this.administrator.auth_api_token;
    const profSub = this.auth.getUserByUid(uid).subscribe(async (res) => {
      if (res.length > 0) {
        this.user = res[0];
        this.profile = await this.getProfile(this.user);
        this.ready = true;
      }
    });
    this.subscriptions.add(profSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async getProfile(element) {
    let profile = null;
    let user_api = await this.apiService
      .get_user_by_email(element.email, this.token)
      .toPromise();
    const result = await this.apiService
      .getTranslatorProfile(this.token, { creator: user_api._id })
      .toPromise();
    if (result.length > 0) {
      profile = result[0];
    }
    return profile;
  }

  getGender(g) {
    let genders = [
      {
        code: "f",
        desc: "Female",
      },
      {
        code: "m",
        desc: "Male",
      },
      {
        code: "o",
        desc: "Other",
      },
      {
        code: "x",
        desc: "I dont want to share",
      },
    ];
    let gender = "";
    genders.forEach((element) => {
      if (element.code == g) {
        gender = element.desc;
      }
    });
    return gender;
  }

  getLangDesc(langin) {
    var languages = [
      {
        code: "FR",
        desc: "French",
      },
      {
        code: "EN",
        desc: "English",
      },
      {
        code: "SP",
        desc: "Spanish",
      },
      {
        code: "DE",
        desc: "German",
      },
      {
        code: "ZH",
        desc: "Chinese",
      },
      {
        code: "O",
        desc: "Other",
      },
    ];
    let r = "";

    languages.forEach((lang) => {
      if (langin == lang.code) {
        r = lang.desc;
      }
    });

    return r;
  }

  getServiceDesc(servicein) {
    var services = [
      {
        code: "TR",
        desc: "Translations assistance",
      },
      {
        code: "DC",
        desc: "Document Translations",
      },
      {
        code: "O",
        desc: "Other",
      },
    ];
    let r = "";

    services.forEach((serv) => {
      if (servicein == serv.code) {
        r = serv.desc;
      }
    });

    return r;
  }
  doApprove() {
    this.submitting = true;
    this.administratorService
      .approveTranslator(this.user.uid)
      .then(async (res) => {
        let toast = await this.toastCtrl.create({
          duration: 3000,
          message: "Successfully approved.",
        });
        toast.onDidDismiss().then(() => {
          this.router.navigateByUrl("administrator-home");
        });
        toast.present();
      });
  }

  doReverseApproval() {
    this.submitting = true;
    this.administratorService
      .reverseApprovalTranslator(this.user.uid)
      .then(async (res) => {
        let toast = await this.toastCtrl.create({
          duration: 3000,
          message: "Successfully reversed approval.",
        });
        toast.onDidDismiss().then(() => {
          this.router.navigateByUrl("administrator-home");
        });
        toast.present();
      });
  }
}
