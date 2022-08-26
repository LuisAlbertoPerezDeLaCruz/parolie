import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LanguagePopoverPage } from '../../language-popover/language-popover.page';
import {
  PopoverController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
// import { MapsService } from "../../../services/maps.service";
import { Subscription } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ConfigService } from '../../../services/config.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElement: ElementRef;

  translator = null;
  translator_statuses = null;

  ready = false;
  show_wellcome = false;
  pending_reservations: any;

  notis: any[] = [];

  subscriptions: Subscription = new Subscription();

  constructor(
    private auth: AuthService,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private translate: TranslateService,
    // private mapsService: MapsService,
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    private configService: ConfigService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    const statSub = this.auth.statuses$.subscribe((res) => {
      this.translator_statuses = res;
    });
    this.subscriptions.add(statSub);
    let loading = await this.loadingCtrl.create({
      message: this.translate.instant('CONTROLS.loading'),
    });
    await loading.present();
    const user = await this.auth.getCurrentUserData();
    this.translator = user;
    let user_api = await this.apiService
      .get_user_by_email(user.email, user.auth_api_token)
      .toPromise()
      .catch((err) => {
        console.log({ err });
        loading.dismiss();
      });

    this.configService.setUserApi(user_api);
    this.configService.setUserFB(user);
    this.configService.loaded = true;
    this.configService.fromLanding = true;
    await this.storage.set('PAROLIE.USER_API', user_api);
    await this.storage.set('PAROLIE.USER_FB', user);

    this.pending_reservations = await this.getPendingReservations();
    loading.dismiss();
    this.show_wellcome = !this.translator.statuses.created_availability;
    this.setUpPage();
    this.ready = true;
    // this.mapsService.loadUserPosition();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async setUpPage() {}

  async signOut() {
    let inputAlert = await this.alertCtrl.create({
      header: 'Log out ?',
      buttons: [
        {
          text: this.translate.instant('BUTTONS.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('BUTTONS.ok'),
          handler: () => {
            this.subscriptions.unsubscribe();
            this.auth.logout();
          },
        },
      ],
    });
    inputAlert.present();
  }

  async openLanguagePopover(ev) {
    const popover = await this.popoverCtrl.create({
      component: LanguagePopoverPage,
      event: ev,
    });
    await popover.present();
  }

  findPlace(e: CustomEvent) {
    let request = {
      query: e.detail.value,
    };

    // let service = new google.maps.places.PlacesService(this.mapsService.map);

    // service.textSearch(
    //   request,
    //   (
    //     results: google.maps.places.PlaceResult[] | null,
    //     status: google.maps.places.PlacesServiceStatus
    //   ) => {
    //     if (status === google.maps.places.PlacesServiceStatus.OK && results) {
    //       this.mapsService.map.setCenter(results[0].geometry.location);
    //     }
    //   }
    // );
  }

  getPendingReservations(): Promise<any> {
    return new Promise(async (resolve) => {
      const result: any = await this.apiService
        .getReservationsByQuery(this.translator.auth_api_token, {
          status: 'BLOCKED',
        })
        .toPromise();
      resolve(result);
    });
  }
}
