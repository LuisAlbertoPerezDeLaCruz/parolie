import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public onlineOffline: boolean = navigator.onLine;
  constructor(
    private platform: Platform,
    private languageService: LanguageService,
    private toastController: ToastController,
    private alertController: AlertController,
    private swUpdate: SwUpdate
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    if (!navigator.onLine) {
      const toast = await this.toastController.create({
        header: 'Offline',
        message: 'You are offline, check your internet connection',
        position: 'bottom',
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
            handler: () => {},
          },
        ],
      });
      toast.present();
    }

    window.addEventListener('online', async () => {
      this.toastController.dismiss();
    });
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(async (event) => {
        console.log('Current version is', event.current);
        console.log('Available version is', event.available);
        const alert = this.alertController.create({
          header: 'Update now',
          message: 'Refresh your parolie app to get an updated version',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Update',
              handler: () => {
                window.location.reload();
              },
            },
          ],
        });
        (await alert).present();
      });
      this.swUpdate.activated.subscribe((event) => {
        console.log('Old version was', event.previous);
        console.log('New version was', event.current);
      });
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.languageService.setInitialAppLanguage();
      this.checkForPwaToast();
    });
  }

  async checkForPwaToast() {
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isInStandaloneMode = () =>
      'standalone' in window.navigator && window.navigator['standalone'];

    if (isIos() && !isInStandaloneMode()) {
      const toast = await this.toastController.create({
        message:
          '<b>Install Parolie on your iPhone:</b><br/>Tap the share icon <b><ion-icon name="share-outline"></ion-icon></b> below and then select <b>Add to Home Screen.</b>',
        position: 'bottom',
        buttons: [
          {
            text: 'Done',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
        ],
      });
      toast.present();
    }
  }
}
