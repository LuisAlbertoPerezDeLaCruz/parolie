import { CalendarBookingPage } from "./../../../modals/calendar-booking/calendar-booking.page";
import { IUser } from "../../../interfaces/iuser";
import { ILocation } from "../../../interfaces/ilocation";
import { IAvailability } from "../../../interfaces/iavailability";
import { ModalController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import {
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { ApiService } from "../../../services/api.service";
import {
  MbscCalendarEvent,
  MbscDatepickerOptions,
  MbscEventcalendarOptions,
  MbscEventcalendarView,
  MbscPopup,
  MbscPopupOptions,
  Notifications,
  setOptions,
  MbscSelectOptions,
} from "@mobiscroll/angular5";
import { LanguageService } from "../../../services/language.service";
import { ConfigService } from "../../../services/config.service";
import { TranslatorsService } from "../../../services/translators.service";
import { TranslateService } from "@ngx-translate/core";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const CLIENT = 0,
  OWNER = 1,
  ADMINISTRATOR = 2;

@Component({
  selector: "app-translator-schedulle",
  templateUrl: "./translator-schedulle.page.html",
  styleUrls: ["./translator-schedulle.page.scss"],
})
export class TranslatorSchedullePage implements OnInit {
  user_fb = null;
  user_api = null;
  translator_id = null;
  selectedTranslator: IUser = null;

  subscriptions: Subscription = new Subscription();

  currLocale = null;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private notify: Notifications,
    private apiService: ApiService,
    private cdref: ChangeDetectorRef,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private configService: ConfigService,
    private translatorsService: TranslatorsService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    const languageSelected = this.languageService.getLanguage();
    this.currLocale = this.languageService.getLocale(languageSelected);
  }

  async ionViewWillEnter() {
    this.ready = false;
    const uid = this.activatedRoute.snapshot.paramMap.get("id");

    this.selectedTranslator = null;

    this.user_fb = this.configService.getUserFB();
    this.user_api = this.configService.getUserApi();

    if (uid) {
      const result = await this.apiService
        .get_user_by_query({ uid: uid }, this.user_fb.auth_api_token)
        .toPromise();

      try {
        this.selectedTranslator = result[0];
      } catch (error) {
        this.selectedTranslator = null;
      }
    }

    if (!this.selectedTranslator) this.selectedTranslator = this.user_api;

    this.setUpPage(this.selectedTranslator).then(() => {
      this.ready = true;
    });
  }

  async setUpPage(selectedTranslator: IUser) {
    if (this.user_fb.role == "CLIENT") {
      this.viewBy = CLIENT;
    } else if (this.user_fb.role == "TRANSLATOR") {
      this.viewBy = OWNER;
    } else {
      this.viewBy = ADMINISTRATOR;
    }
    this.setCalendarOptions();
    this.locations = await this.loadLocations(selectedTranslator);
    this.defaultLocation = this.locations[0];
    const result = await this.loadAvailabilities(selectedTranslator);
    this.myEvents = result;
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  @ViewChild("popup", { static: false })
  popup!: MbscPopup;
  popupEventTitle: string | undefined;
  popupEventLocation: number = 0;
  popupEventAllDay = true;
  popupEventDates: any;
  popupHeaderText!: string;
  popupAnchor: HTMLElement | undefined;
  popupAddButtons = [
    {
      handler: () => {
        this.popup.close();
      },
      keyCode: "cancel",
      text: this.translate.instant("TRANSLATORS.schedulle.createEdit.cancel"),
      cssClass: "mbsc-popup-button-close",
    },
    {
      handler: () => {
        this.saveEvent();
      },
      keyCode: "enter",
      text: this.translate.instant("TRANSLATORS.schedulle.createEdit.add"),
      cssClass: "mbsc-popup-button-primary",
    },
  ];
  popupEditButtons = [
    {
      handler: () => {
        this.popup.close();
      },
      keyCode: "cancel",
      text: this.translate.instant("TRANSLATORS.schedulle.createEdit.cancel"),
      cssClass: "mbsc-popup-button-close",
    },
    {
      handler: () => {
        this.saveEvent();
      },
      keyCode: "enter",
      text: this.translate.instant("TRANSLATORS.schedulle.createEdit.save"),
      cssClass: "mbsc-popup-button-primary",
    },
  ];
  popupButtons: any = [];
  popupOptions: MbscPopupOptions = {
    locale: this.currLocale,
    display: "bottom",
    contentPadding: false,
    fullScreen: false,
    onClose: () => {
      if (!this.isEdit) {
        // refresh the list, if add popup was canceled, to remove the temporary event
        this.myEvents = [...this.myEvents];
      }
    },
    responsive: {
      medium: {
        display: "anchored",
        width: 400,
        fullScreen: false,
        touchUi: false,
      },
    },
  };

  datePickerControls = ["date"];
  datePickerResponsive: any = {
    medium: {
      controls: ["calendar"],
      touchUi: false,
    },
  };
  datetimePickerControls = ["datetime"];
  datetimePickerResponsive = {
    medium: {
      controls: ["calendar", "time"],
      touchUi: false,
    },
  };
  datePickerOptions: MbscDatepickerOptions = {
    locale: this.currLocale,
    select: "range",
    showRangeLabels: false,
    touchUi: true,
    stepMinute: 15,
  };

  selectOptions: MbscSelectOptions = {
    display: "bubble",
    label: this.translate.instant("TRANSLATORS.schedulle.createEdit.location"),
    onChange: (event, inst) => {
      this.popupEventLocation = event.value;
    },
  };

  view = "week";
  calView: MbscEventcalendarView;
  calendarSelectedDate: any = new Date();
  switchLabel: any = "All-day";
  tempEvent!: MbscCalendarEvent | any;
  calendarOptions: MbscEventcalendarOptions;
  isEdit = false;
  ready = false;
  myEvents: MbscCalendarEvent[];
  locations: any[] = [];
  defaultLocation = null;
  selectedLocation = null;
  viewBy: number = CLIENT;

  setCalendarOptions() {
    if (this.viewBy === OWNER) {
      this.view = "week";
    } else {
      this.view = "month";
    }
    this.changeView();

    this.calendarOptions = {
      locale: this.currLocale,
      clickToCreate: this.viewBy == OWNER ? "double" : undefined,
      dragToCreate: this.viewBy == OWNER ? true : false,
      dragToMove: this.viewBy == OWNER ? true : false,
      dragToResize: this.viewBy == OWNER ? true : false,
      newEventText: this.translate.instant(
        "TRANSLATORS.schedulle.createEdit.newAvailability"
      ),

      onEventClick: (args) => {
        if (this.viewBy == OWNER) {
          this.isEdit = true;
          this.tempEvent = args.event;
          // fill popup form with event data
          this.loadPopupForm(args.event);
          // set popup options
          this.popupHeaderText = this.translate.instant(
            "TRANSLATORS.schedulle.createEdit.editAvailability"
          );
          this.popupButtons = this.popupEditButtons;
          this.popupAnchor = args.domEvent.currentTarget;
          // open the popup
          this.popup.open();
        } else if (this.viewBy == CLIENT) {
          this.openBookingModal(args.event);
        } else if ((this.viewBy = ADMINISTRATOR)) {
          this.openBookingModal(args.event);
        }
      },
      onEventCreated: (args) => {
        setTimeout(() => {
          this.isEdit = false;
          this.tempEvent = args.event;
          // fill popup form with event data
          this.loadPopupForm(args.event);
          // set popup options
          (this.popupHeaderText = this.translate.instant(
            "TRANSLATORS.schedulle.createEdit.newAvailability"
          )),
            (this.popupEventTitle = this.defaultLocation.text);
          this.popupEventLocation = this.defaultLocation.value;
          this.popupButtons = this.popupAddButtons;
          this.popupAnchor = args.target;
          // open the popup
          this.popup.open();
        });
      },
      onEventDeleted: (args) => {
        setTimeout(() => {
          this.deleteEvent(args.event);
        });
      },
      onEventUpdated: (args) => {
        const tempEvent = args.event;
        this.isEdit = true;
        this.saveOnDragDrop(tempEvent);
      },
    };
  }

  async loadAvailabilities(selectedTranslator: IUser) {
    const result = await this.apiService
      .getTranslatorAvailabilities(this.user_fb.auth_api_token, {
        creator: selectedTranslator._id,
      })
      .toPromise();

    let response = [];

    result.forEach((element: IAvailability) => {
      response.push({
        id: element._id,
        start: new Date(element.startTime), // This forces UTC to local time
        end: new Date(element.endTime), // This forces UTC to local time
        title: element.title,
        color: element.location.color,
        location: element.location._id,
      });
    });
    return response;
  }

  async loadLocations(selectedTranslator: IUser) {
    const result = await this.apiService
      .getLocationsByQuery(this.user_fb.auth_api_token, {
        creator: selectedTranslator._id,
      })
      .toPromise();

    let response = [];

    result.forEach((element: ILocation) => {
      response.push({
        value: element._id,
        text: element.name,
        color: element.color,
      });
    });

    return response;
  }

  loadPopupForm(event: MbscCalendarEvent): void {
    this.popupEventTitle = event.title;
    this.popupEventLocation = event.location;
    this.popupEventDates = [event.start, event.end];
    this.popupEventAllDay = event.allDay || false;
  }

  async saveEvent() {
    const location = this.locations.find((element) => {
      return element.value == this.popupEventLocation;
    });
    this.tempEvent.color = location.color;
    this.tempEvent.title = this.popupEventTitle;
    this.tempEvent.location = this.popupEventLocation;
    this.tempEvent.start = this.popupEventDates[0];
    this.tempEvent.end = this.popupEventDates[1];
    this.tempEvent.allDay = this.popupEventAllDay;

    if (this.isEdit) {
      // update the event in the list
      this.myEvents = [...this.myEvents];
      const fields: IAvailability = {
        startTime: this.tempEvent.start,
        endTime: this.tempEvent.end,
      };
      const result = await this.apiService
        .updateAvailability(
          this.user_fb.auth_api_token,
          fields,
          this.tempEvent.id
        )
        .toPromise()
        .catch((err) => {
          console.log({ err });
          return;
        });

      // here you can update the event in your storage as well
      // ...
    } else {
      // add the new event to the list
      this.myEvents = [...this.myEvents, this.tempEvent];
      this.createAvailability(this.tempEvent);
      // here you can add the event to your storage as well
      // ...
    }
    // navigate the calendar
    this.calendarSelectedDate = this.popupEventDates[0];

    // close the popup
    this.popup.close();
  }

  async saveOnDragDrop(tempEvent: any) {
    console.log({ tempEvent });
    this.myEvents = [...this.myEvents];
    const fields: IAvailability = {
      startTime: tempEvent.start,
      endTime: tempEvent.end,
    };
    const result = await this.apiService
      .updateAvailability(this.user_fb.auth_api_token, fields, tempEvent.id)
      .toPromise()
      .catch((err) => {
        console.log({ err });
        return;
      });
  }

  async createAvailability(tempEvent: any) {
    const availability: IAvailability = {
      creator: this.user_api._id,
      startTime: tempEvent.start,
      endTime: tempEvent.end,
      location: tempEvent.location,
      title: tempEvent.title,
      allDay: tempEvent.allDay,
      startTimeStr: "",
      endTimeStr: "",
      createdAt: null,
      updatedAt: null,
      _id: null,
    };
    const result = await this.apiService
      .createAvailability(this.user_fb.auth_api_token, availability)
      .toPromise()
      .catch((err) => {
        this.notify.toast({ message: err });
      });
    this.loadAvailabilities(this.selectedTranslator);
    this.notify.toast({ message: "Availability created" });
    await this.translatorsService.updateStatus("created_availability", true);
  }

  deleteEvent(event: MbscCalendarEvent): void {
    const id = event.id;
    if (id.toString().includes("mbsc")) {
      this.myEvents = this.myEvents.filter((item) => item.id !== event.id);
    } else {
      this.notify.confirm({
        title: "Delete Availability",
        message: "Do you want to delete this availability ?",
        callback: async (confirmed) => {
          if (confirmed) {
            this.myEvents = this.myEvents.filter(
              (item) => item.id !== event.id
            );
            const result = await this.apiService
              .deleteAvailability(this.user_fb.auth_api_token, event.id)
              .toPromise()
              .catch((err) => {
                console.log({ err });
                this.notify.toast({ message: err });
                return;
              });
            this.notify.toast({ message: "Availability deleted" });
          }
        },
      });
    }
  }

  onDeleteClick(): void {
    this.deleteEvent(this.tempEvent);
    this.popup.close();
  }

  changeView(): void {
    setTimeout(() => {
      switch (this.view) {
        case "month":
          this.calView = {
            calendar: { labels: true },
          };
          break;
        case "week":
          this.calView = {
            schedule: { type: "week" },
          };
          break;
        case "day":
          this.calView = {
            schedule: { type: "day" },
          };
          break;
        case "agenda":
          this.calView = {
            calendar: { type: "week" },
            agenda: { type: "week" },
          };
          break;
      }
    });
  }

  locationChange() {
    if (this.popupEventLocation == 0) return;
    const location = this.locations.find((element) => {
      return element.value == this.popupEventLocation;
    });
    this.popupEventTitle = location.text;
  }

  async openBookingModal(event: any) {
    let day = event.start.getDate();
    let month = event.start.getMonth();
    let year = event.start.getYear() + 1900;
    let hours = event.start.getHours();
    let minutes = event.start.getMinutes();
    const d0 = new Date(year, month, day);
    const startTime = `${this.padLeadingZeros(hours, 2)}:${this.padLeadingZeros(
      minutes,
      2
    )}`;

    day = event.end.getDate();
    month = event.end.getMonth();
    year = event.end.getYear() + 1900;
    hours = event.end.getHours();
    minutes = event.end.getMinutes();
    const d1 = new Date(year, month, day);
    const endTime = `${this.padLeadingZeros(hours, 2)}:${this.padLeadingZeros(
      minutes,
      2
    )}`;

    let event2: MbscCalendarEvent = {
      title: event.title,
      start: d0,
      end: d1,
    };

    let modal = await this.modalController.create({
      component: CalendarBookingPage,
      cssClass: "booking-modal",
      backdropDismiss: false,
      componentProps: {
        params: {
          event: event2,
          user: this.user_fb,
          translator: this.selectedTranslator,
          startTime: startTime,
          endTime: endTime,
          location: event.location,
          viewBy: this.viewBy,
        },
      },
    });
    await modal.present();

    modal.onDidDismiss().then((result: any) => {
      modal = null;
    });
  }

  padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }
}
