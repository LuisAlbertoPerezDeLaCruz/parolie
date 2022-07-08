import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  AlertController,
  LoadingController,
  PopoverController,
  ToastController,
} from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "../../services/auth.service";
import { LanguagePopoverPage } from "../language-popover/language-popover.page";

import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { mobiscroll } from "@mobiscroll/angular";

GoogleAuth.init();

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  @ViewChild("flipcontainer") flipcontainer: ElementRef;

  registerForm: FormGroup;
  loginForm: FormGroup;

  submitting: any = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      name: ["", [Validators.required]],
      role: ["CLIENT", [Validators.required]],
    });
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  async register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.signup(this.registerForm.value).then(
      (realUser) => {
        loading.dismiss();
        this.toggleRegister();
      },
      async (err) => {
        await loading.dismiss();

        const alert = await this.alertCtrl.create({
          header: "Signup failed",
          message: "Please try again later. Reason: " + err,
          buttons: ["OK"],
        });
        await alert.present();
      }
    );
  }

  async login() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.login(this.loginForm.value).then(
      async (user) => {
        loading.dismiss();
        if (user.user.emailVerified) {
          this.router.navigateByUrl("/", { replaceUrl: true });
        } else {
          const alert = await this.alertCtrl.create({
            cssClass: "my-custom-class",
            header: "Email not verified",
            message:
              "Do you want us to resend the verification email once again ?",
            buttons: [
              {
                text: "Cancel",
                role: "cancel",
                cssClass: "secondary",
                id: "cancel-button",
                handler: (blah) => {},
              },
              {
                text: "Resend",
                id: "confirm-button",
                handler: async () => {
                  await this.authService.resendEmail(user);
                  const toast = await this.toastCtrl.create({
                    message:
                      "Verification email already sent. Please open it to verify and then try to login again",
                    position: "bottom",
                    duration: 3500,
                  });
                  await toast.present();
                },
              },
            ],
          });
          await alert.present();
        }
      },
      async (err) => {
        await loading.dismiss();

        const alert = await this.alertCtrl.create({
          header: "Error",
          message: "Please check your email and password",
          buttons: ["OK"],
        });
        await alert.present();
      }
    );
  }

  async googleSignin() {
    let googleUserInfo = await GoogleAuth.signIn();
    this.authService.signIn_FB_Google(googleUserInfo).then(
      async (credentials) => {
        let currentUserData = await this.authService.getCurrentUserData();
        if (currentUserData) {
          this.router.navigateByUrl("/", { replaceUrl: true });
        } else {
          await this.authService.createFireStoreUser(credentials);
          currentUserData = await this.authService.getCurrentUserData();
          if (currentUserData) {
            this.router.navigateByUrl("/", { replaceUrl: true });
          }
        }
      },
      async (err) => {
        const alert = await this.alertCtrl.create({
          header: "Error",
          message: err.message,
          buttons: ["OK"],
        });
        await alert.present();
      }
    );
  }

  async openLanguagePopover(ev) {
    const popover = await this.popoverCtrl.create({
      component: LanguagePopoverPage,
      event: ev,
    });
    await popover.present();
  }

  delay(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  toggleRegister() {
    this.flipcontainer.nativeElement.classList.toggle("flip");
  }

  async openReset() {
    let inputAlert = await this.alertCtrl.create({
      header: "Reset Password",
      inputs: [
        {
          name: "email",
          placeholder: "Email",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Reset",
          handler: (data) => {
            this.resetPw_FB(data.email);
          },
        },
      ],
    });
    inputAlert.present();
  }

  resetPw_FB(email) {
    this.authService.resetPw_FB(email).then(
      (res) => {
        mobiscroll.toast({
          title: "Success",
          display: "center",
          color: "success",
          message: "Check your email for more information",
          callback: () => {},
        });
      },
      async (err) => {
        mobiscroll.toast({
          title: "Error",
          display: "center",
          color: "danger",
          message: err,
          callback: () => {},
        });
      }
    );
  }
}
