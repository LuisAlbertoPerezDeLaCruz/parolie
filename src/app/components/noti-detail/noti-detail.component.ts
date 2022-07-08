import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ConfigService } from '../../services/config.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TranslatorsService } from '../../services/translators.service';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-noti-detail',
  templateUrl: './noti-detail.component.html',
  styleUrls: ['./noti-detail.component.scss'],
})
export class NotiDetailComponent implements OnInit {
  @Input() noti: any;
  showMore = true;
  isTheClient = false;
  user_fb: any = null;
  reservation: any = null;
  canShow = true;
  @Output() notiDeletedEvent = new EventEmitter<boolean>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private router: Router,
    private modalController: ModalController,
    private translatorsService: TranslatorsService,
    private notificationsService: NotificationsService
  ) {}
  async ngOnInit() {
    const token = this.configService.getUserFB().auth_api_token;
    const user_api = this.configService.getUserApi();
    this.user_fb = this.configService.getUserFB();
    if (this.noti.metadata.subtype == 'RESERVATION') {
      this.noti.title = this.noti.metadata.title;
      if (this.noti.metadata.action != 'DELETE') {
        const reservation = await this.apiService
          .getReservationsById(token, this.noti.metadata._id)
          .toPromise();
        this.isTheClient = user_api._id == reservation.creator._id;
        this.noti.date = new Date(this.noti.createdAt);
        this.noti.reservation_date = new Date(reservation.start);
        this.noti.location = reservation.location.name;
        this.noti.client = reservation.creator.name;
        this.noti.translator = reservation.translator.name;
        this.noti.requirements = reservation.requirements;
        this.reservation = reservation;
      } else {
        this.showMore = false;
      }
    }
  }
  linkToReservations() {
    if (!this.isTheClient) {
      if (this.user_fb.role == 'ADMINISTRATOR') {
        this.translatorsService.setSelectedTranslator(
          this.reservation.translator
        );
        this.router.navigateByUrl(
          '/administrator-home/translator-reservations'
        );
        this.modalController.dismiss();
      } else {
        this.router.navigateByUrl('translator-reservations');
        this.modalController.dismiss();
      }
    } else {
      this.router.navigateByUrl('client-agenda');
      this.modalController.dismiss();
    }
  }

  async donShow(noti) {
    await this.notificationsService.setNoteToUnShow(noti._id).toPromise();
    await this.notificationsService.setUnreadNotiToRead(noti._id).toPromise();
    this.canShow = false;
    this.notiDeletedEvent.emit(true);
  }
}
