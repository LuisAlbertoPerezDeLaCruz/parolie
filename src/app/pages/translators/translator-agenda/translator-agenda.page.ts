import { Component, OnInit } from "@angular/core";
import {
  MbscEventcalendarOptions,
  MbscCalendarEvent,
} from "@mobiscroll/angular5";
import { LanguageService } from "../../../services/language.service";
import { ApiService } from "../../../services/api.service";
import { Subscription } from "rxjs";
import { IUser } from "../../../interfaces/iuser";
import { IUserfb } from "../../../interfaces/iuserfb";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: "app-translator-agenda",
  templateUrl: "./translator-agenda.page.html",
  styleUrls: ["./translator-agenda.page.scss"],
})
export class TranslatorAgendaPage implements OnInit {
  myEvents: MbscCalendarEvent[] = [];
  user_fb: IUserfb;
  user_api: IUser = null;
  eventSettings: MbscEventcalendarOptions;
  ready = false;

  constructor(
    private apiService: ApiService,
    private languageService: LanguageService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.user_fb = this.configService.getUserFB();
    this.user_api = this.configService.getUserApi();
    this.loadReservations();
    this.ready = true;

    const languageSelected = this.languageService.getLanguage();
    const locale = this.languageService.getLocale(languageSelected);

    this.eventSettings = {
      locale: locale,
      theme: "ios",
      themeVariant: "light",
      view: {
        calendar: { type: "week" },
        agenda: { type: "day" },
      },
    };
  }

  async loadReservations() {
    const token = this.user_fb.auth_api_token;
    const result = await this.apiService
      .getReservationsByQuery(token, {
        translator: this.user_api._id,
        status: '{"$in":["APPROVED"]}',
      })
      .toPromise();
    let reservations: MbscCalendarEvent[] = [];
    result.forEach((element) => {
      let avatar = null;
      if (
        !element.creator.avatars.application &&
        !element.creator.avatars.google
      ) {
        avatar = "../../../../assets/imgs/blank-profile-picture.png";
      } else if (element.creator.avatars.application) {
        avatar = element.creator.avatars.application;
      } else {
        avatar = element.creator.avatars.google;
      }
      reservations.push({
        id: element._id,
        title: `Reserved to ${element.creator.name}`,
        editable: false,
        color: element.location.color,
        start: new Date(element.start),
        end: new Date(element.end),
        avatar: avatar,
        name: element.creator.name,
        locality: element.location.name,
        status: element.status,
      });
    });
    this.myEvents = reservations;
    return reservations;
  }
}
