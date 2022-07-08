import { Component, OnInit } from "@angular/core";
import { IReservation } from "../../../interfaces/ireservation";
import { ApiService } from "../../../services/api.service";
import { IUserfb } from "../../../interfaces/iuserfb";
import { ReservationStatus } from "../../../enums/reservation-status.enum";
import { ChangesService } from "../../../services/changes.service";
import { ConfigService } from "../../../services/config.service";
import { TranslatorsService } from "../../../services/translators.service";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-translator-reservations",
  templateUrl: "./translator-reservations.page.html",
  styleUrls: ["./translator-reservations.page.scss"],
})
export class TranslatorReservationsPage implements OnInit {
  translator: IUserfb = null;
  reservations_list: IReservation[] = [];
  blocked_list: IReservation[] = [];
  approved_list: IReservation[] = [];
  disapproved_list: IReservation[] = [];
  cancelled_list: IReservation[] = [];
  expired_list: IReservation[] = [];
  delivered_list: IReservation[] = [];
  scrollable: boolean = false;
  ready: boolean = false;
  tab = "BLOCKED";
  reservation_changes: any = null;
  canEdit = true;

  public users: number = 0;
  public info: string = "";
  public infos: string[] = [];

  constructor(
    private apiService: ApiService,
    private changesService: ChangesService,
    private configService: ConfigService,
    private translatorsService: TranslatorsService,
    private auth: AuthService
  ) {
    this.apiService.reload_page.subscribe((status: string) => {
      this.ready = false;
      this.setUpPage();
      this.select_data(status);
      this.tab = status;
    });
  }

  async ngOnInit() {
    const user_fb = this.configService.getUserFB();
    if (user_fb.role == "ADMINISTRATOR") {
      const translator_user_api =
        this.translatorsService.getSelectedTranslator();
      this.canEdit = false;
      if (translator_user_api) {
        this.auth
          .getUserByEmail(translator_user_api.email)
          .subscribe((res: any) => {
            this.translator = res[0];
            this.setUpPage();
            this.reservations_list = this.blocked_list;
          });
      }
    } else {
      this.translator = this.configService.getUserFB();
      console.log("this.translator in ts:", this.translator);
      console.log("this.ready:", this.ready);
      await this.setUpPage();
      this.reservations_list = this.blocked_list;
      // console.log("this.ready:", this.ready);
      console.log("this.reservations_list:", this.reservations_list);
    }

    this.changesService.receiveChange().subscribe((info: string) => {
      this.infos.push(info);
      this.setUpPage();
    });
  }

  async setUpPage() {
    const result = await this.apiService
      .getReservationsByQuery(this.translator.auth_api_token, {
        translator: this.translator.api_user_id,
      })
      .toPromise();
    let qtyType = 1;
    this.approved_list.length = 0;
    this.blocked_list.length = 0;
    this.cancelled_list.length = 0;
    this.delivered_list.length = 0;
    this.disapproved_list.length = 0;
    this.expired_list.length = 0;
    result.forEach((element) => {
      switch (element.status) {
        case ReservationStatus.APPROVED:
          this.approved_list.push(element);
          qtyType++;
          break;
        case ReservationStatus.DISAPPROVED:
          this.disapproved_list.push(element);
          qtyType++;
          break;
        case ReservationStatus.BLOCKED:
          this.blocked_list.push(element);
          qtyType++;
          break;
        case ReservationStatus.CANCELLED:
          this.cancelled_list.push(element);
          qtyType++;
          break;
        case ReservationStatus.DELIVERED:
          this.delivered_list.push(element);
          qtyType++;
          break;
        case ReservationStatus.EXPIRED:
          this.expired_list.push(element);
          qtyType++;
          break;
        default:
          break;
      }
    });
    this.scrollable = qtyType > 3 ? true : false;
    this.ready = true;
  }

  segmentChanged(event) {
    const tab = event.detail.value;
    this.tab = tab;
    this.select_data(tab);
  }

  select_data(tab) {
    switch (tab) {
      case ReservationStatus.BLOCKED:
        this.reservations_list = this.blocked_list;
        break;
      case ReservationStatus.APPROVED:
        this.reservations_list = this.approved_list;
        break;
      case ReservationStatus.CANCELLED:
        this.reservations_list = this.cancelled_list;
        break;
      case ReservationStatus.DELIVERED:
        this.reservations_list = this.delivered_list;
        break;
      case ReservationStatus.DISAPPROVED:
        this.reservations_list = this.disapproved_list;
        break;
      case ReservationStatus.EXPIRED:
        this.reservations_list = this.expired_list;
        break;
      default:
        break;
    }
  }
}
