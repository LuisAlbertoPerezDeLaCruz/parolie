import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { ChangesService } from '../../services/changes.service';
import { ChatsService } from '../../services/chats.service';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { Subscription } from 'rxjs';
import { InboxPage } from '../../modals/inbox/inbox.page';
import { ApiService } from '../../services/api.service';
import { PaymentsService } from '../../services/payments.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  user = null;
  user_role = null;
  has_new_notis: boolean;
  has_unread_notis: boolean;
  has_new_chats: boolean;
  has_new_info: boolean;

  subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private changesService: ChangesService,
    private chatsService: ChatsService,
    private notificationsService: NotificationsService,
    private router: Router,
    private modalController: ModalController,
    private apiService: ApiService,
    private paymentsService: PaymentsService,
    private alertCtrl: AlertController,
    private swUpdate: SwUpdate
  ) {
    setInterval(() => {
      this.checkUpdate();
    }, 10000);
    const newNoteSub = this.notificationsService.new_notis_subject.subscribe(
      (res) => {
        this.has_new_notis = res;
      }
    );
    const chatSub = this.chatsService.new_chats_subject.subscribe((res) => {
      this.has_new_chats = res;
      if (!this.has_new_notis) {
        // this.has_new_info = res;
      }
    });

    const unreadNoteSub =
      this.notificationsService.unread_notis_subject.subscribe((res) => {
        this.has_unread_notis = res;
      });

    const infoSub = this.changesService
      .receiveChange()
      .subscribe((info: string) => {
        this.manageChatsChange(info);
        this.manageNotesChange(info);
      });

    const roleSub = this.authService.role$.subscribe((res) => {
      this.user_role = res;
    });

    this.subscriptions.add(newNoteSub);
    this.subscriptions.add(unreadNoteSub);
    this.subscriptions.add(chatSub);
    this.subscriptions.add(infoSub);
    this.subscriptions.add(roleSub);
  }

  async ngOnInit() {
    this.user = await this.authService.getCurrentUserData();
    if (!this.user) {
      this.router.navigateByUrl('/login');
    } else if (this.router.url == '/') {
      this.setUpServices();
      this.navigateByRole(this.user.role);
    } else {
      this.setUpServices();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setUpServices() {
    this.notificationsService.auth_api_token = this.user.auth_api_token;
    this.notificationsService.uid = this.user.uid;
    this.notificationsService.api_user_id = this.user.api_user_id;
    this.notificationsService.setUpService();
    this.chatsService.auth_api_token = this.user.auth_api_token;
    this.chatsService.uid = this.user.uid;
    this.chatsService.api_user_id = this.user.api_user_id;
    this.chatsService.setUpService();
  }

  async manageChatsChange(info) {
    if (info.collection == 'chats' && info.action == 'create') {
      if (info.object.to._id == this.user.api_user_id) {
        this.chatsService.new_chats_subject.next(true);
      }
    }
  }

  async manageNotesChange(info) {
    console.log({ info });
    if (info.collection == 'notes' && info.action == 'create') {
      if (info.object.to == this.user.api_user_id) {
        this.notificationsService.new_notis_subject.next(true);
        if (info.object.message == 'Your reservation was APPROVED') {
          await this.checkUnpaidReservations();
        }
        if (info.object.message == 'Your reservation was DELIVERED') {
          await this.completePayment(info.object.metadata._id);
        }
      }
    }
  }

  async completePayment(reservation_id) {
    const reservation = await this.apiService
      .getReservationsById(this.user.auth_api_token, reservation_id)
      .toPromise();
    const pm = { id: reservation.payments[0].paymentIntent.payment_method };
    const result = await this.paymentsService.payReservation(
      pm,
      reservation_id,
      233
    );
    console.log('>>>', { result });
  }

  async checkUnpaidReservations() {
    let unpaidReservations: any[] = [];
    const approvedReservations = await this.apiService
      .getReservationsByQuery(this.user.auth_api_token, {
        creator: this.user.api_user_id,
        status: 'APPROVED',
      })
      .toPromise();
    approvedReservations.forEach((element) => {
      if (element.payments.length == 0) {
        unpaidReservations.push(element);
      }
    });
    if (unpaidReservations.length > 0) {
      console.log(unpaidReservations);
      let inputAlert = await this.alertCtrl.create({
        header: 'Payment needed',
        message: `You have ${unpaidReservations.length} reservation(s) with pending payments. Please go to "My Agenda" to apply payments.`,
        buttons: [
          {
            text: 'Later',
            role: 'cancel',
          },
          {
            text: 'Pay now',
            handler: () => {
              this.router.navigateByUrl('/client-library');
            },
          },
        ],
      });
      inputAlert.present();
    }
  }

  tabChanged(event) {
    this.router.navigateByUrl(`/${event.tab}`);
  }

  navigateByRole(role) {
    if (role == 'CLIENT') {
      this.router.navigateByUrl('/client-home');
    } else if (role == 'TRANSLATOR') {
      this.router.navigateByUrl('/translator-home');
    } else if (role == 'ADMINISTRATOR') {
      this.router.navigateByUrl('/administrator-home');
    }
  }

  async openInbox() {
    const modal = await this.modalController.create({
      component: InboxPage,
      cssClass: 'full-screen-modal',
      componentProps: {},
    });
    modal.onDidDismiss().then((data: any) => {});
    modal.present();
  }

  checkUpdate() {
    this.swUpdate.checkForUpdate();
  }
}
