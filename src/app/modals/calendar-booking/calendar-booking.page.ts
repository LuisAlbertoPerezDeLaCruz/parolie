import { ModalController, NavParams } from "@ionic/angular";
import { Component, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { set, sub, add } from "date-fns";
import { LanguageService } from "../../services/language.service";

import {
  MbscCalendarEvent,
  MbscDatepickerOptions,
  MbscEventcalendarOptions,
  MbscEventcalendarView,
  MbscPopup,
  MbscPopupOptions,
  Notifications,
  setOptions,
} from "@mobiscroll/angular5";

import { ApiService } from "../../services/api.service";
import { NotificationsService } from "src/app/services/notifications.service";
import { CalBookPopPage } from "../cal-book-pop/cal-book-pop.page";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const DOUBLE_BOOK_MSG = "Make sure not to double book";
const OUTTER_CONFLICT_MSG = "You have another reservation ath this time";

const CLIENT = 0,
  OWNER = 1,
  ADMINISTRATOR = 2;
@Component({
  selector: "app-calendar-booking",
  templateUrl: "./calendar-booking.page.html",
  styleUrls: ["./calendar-booking.page.scss"],
})
export class CalendarBookingPage implements OnInit {
  view = "week";
  calView: MbscEventcalendarView = {
    schedule: { type: "week" },
  };
  calendarSelectedDate: any = new Date();
  switchLabel: any = "All-day";
  tempEvent!: MbscCalendarEvent;
  calendarOptions: MbscEventcalendarOptions;
  isEdit = false;
  isCreating = false;
  ready = false;

  locations: any[] = [];
  defaultLocation = null;
  selectedLocation = null;

  params: any = null;
  myEvents: MbscCalendarEvent[] = [];
  otherUserReservations: any[] = [];

  eventStartTime: string = "";
  eventEndTime: string = "";

  event: MbscCalendarEvent = null;

  services: any[] = [];

  @ViewChild("popup", { static: false })
  popup!: MbscPopup;
  popupEventTitle: string | undefined;
  popupEventRequirement = "";
  popupEventDates: any;
  popupHeaderText!: string;
  popupAnchor: HTMLElement | undefined;
  popupAddButtons = [
    "cancel",
    {
      handler: () => {
        this.saveEvent();
      },
      keyCode: "enter",
      text: "Add",
      cssClass: "mbsc-popup-button-primary",
    },
  ];
  popupEditButtons = [
    {
      handler: () => {
        if (this.isCreating) {
          this.cancelEventCreation();
        } else {
          this.popup.close();
        }
      },
      keyCode: "cancel",
      text: "Cancel",
      cssClass: "mbsc-popup-button-close mbsc-popup-button-primary",
    },
    {
      handler: () => {
        if (this.isCreating) {
          this.saveEventCreation();
        } else {
          this.saveEvent();
        }
      },
      keyCode: "enter",
      text: "Save",
      cssClass: "mbsc-popup-button-primary",
      disabled: false,
    },
  ];
  popupButtons: any = [];
  popupOptions: MbscPopupOptions = {
    display: "bottom",
    contentPadding: false,
    fullScreen: true,
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

  loadPopupForm(event: MbscCalendarEvent): void {
    this.popupEventTitle = event.title;
    this.popupEventRequirement = event.requirements;
    this.popupEventDates = [event.start, event.end];
  }

  datePickerControls = ["time"];
  datePickerResponsive: any = {
    medium: {
      controls: ["calendar"],
      touchUi: false,
    },
  };
  datetimePickerControls = ["time"];
  datetimePickerResponsive = {
    medium: {
      controls: ["calendar", "time"],
      touchUi: false,
    },
  };
  datePickerOptions: MbscDatepickerOptions;

  selectedDate: Date;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private notify: Notifications,
    private cdref: ChangeDetectorRef,
    private apiService: ApiService,
    private languageService: LanguageService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.params = this.navParams.get("params");
    let event = this.params.event;
    this.event = event;

    this.selectedDate = event.start;

    this.eventStartTime = this.params.startTime;
    this.eventEndTime = this.params.endTime;

    this.loadTranslatorServices();
    this.setUpDatePickerOptions();
    this.loadTranslatorReservations();
    this.loadClientReservations();
    this.setCalendarOptions();
  }

  async loadTranslatorServices() {
    const services = await this.apiService.getTranslatorServices().toPromise();
    this.services = services;
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  hasOverlap(args) {
    console.log({ args });
    const events = this.myEvents.filter((element) => {
      return element.id != "mbsc_1";
    });
    const newEvent = args.event;
    const newEventStart = newEvent.start;
    const newEventEnd = newEvent.end;

    for (let i = 0; i < events.length; ++i) {
      const event = events[i];
      const eventStart = event.start;
      const eventEnd = event.end;

      if (
        ((newEventStart <= eventStart && newEventEnd > eventStart) ||
          (newEventStart >= eventStart && newEventStart < eventEnd)) &&
        event.id != newEvent.id
      ) {
        return true;
      }
    }
    return false;
  }

  outterOverLap(args) {
    const events = this.otherUserReservations;

    const newEvent = args.event;
    const newEventStart = newEvent?.start;
    const newEventEnd = newEvent?.end;

    for (let i = 0; i < events.length; ++i) {
      const event = events[i].element;
      console.log({ event });
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (
        ((newEventStart <= eventStart && newEventEnd > eventStart) ||
          (newEventStart >= eventStart && newEventStart < eventEnd)) &&
        event.id != newEvent.id
      ) {
        return true;
      }
    }
    return false;
  }

  setCalendarOptions() {
    const languageSelected = this.languageService.getLanguage();
    const locale = this.languageService.getLocale(languageSelected);

    this.calendarOptions = {
      locale: locale,
      showControls: false,
      selectedDate: this.selectedDate,
      min: this.selectedDate,
      max: this.selectedDate,
      view: {
        schedule: {
          type: "day",
          allDay: false,
          startTime: this.eventStartTime,
          endTime: this.eventEndTime,
        },
      },
      clickToCreate: this.params.viewBy == CLIENT,
      dragToCreate: this.params.viewBy == CLIENT,
      dragToMove: this.params.viewBy == CLIENT,
      dragToResize: this.params.viewBy == CLIENT,
      dragTimeStep: 15,
      newEventText: "New Reservation",
      onEventClick: (args) => {
        if (!args.event.editable) return;
        this.isEdit = true;
        this.tempEvent = args.event;
        // fill popup form with event data
        this.loadPopupForm(args.event);
        // set popup options
        this.popupHeaderText = "Edit reservation";
        this.popupButtons = this.popupEditButtons;
        this.popupAnchor = args.domEvent.currentTarget;
        // open the popup
        // this.popup.open();
        this.openCalBookPop();
      },
      onEventCreate: (args, inst) => {
        args.event.color = this.params.location.color;

        if (this.outterOverLap(args)) {
          this.notify.toast({
            message: OUTTER_CONFLICT_MSG,
          });
          return false;
        }
        if (this.hasOverlap(args)) {
          this.notify.toast({
            message: DOUBLE_BOOK_MSG,
          });
          return false;
        }

        setTimeout(() => {
          let tempEvent: MbscCalendarEvent = args.event;
          tempEvent.editable = true;
          tempEvent.title = `Reserved to ${this.params.user.name}`;
          tempEvent.text = `Name:${this.params.user.name}, email:${this.params.user.email}`;
          // this.myEvents = [...this.myEvents, tempEvent];
          this.isEdit = false;
          this.isCreating = true;
          this.isEdit = false;
          this.tempEvent = args.event;
          // fill popup form with event data
          this.loadPopupForm(args.event);
          // set popup options
          this.popupHeaderText = "Edit reservation";
          this.popupButtons = this.popupEditButtons;
          this.popupAnchor = args.domEvent.currentTarget;
          // open the popup
          // this.popup.open();
          this.openCalBookPop();
        });
      },
      onEventCreated: async (args, inst) => {
        args.event.color = this.params.location.color;
        this.isCreating = true;
      },
      onEventUpdate: (args, inst) => {
        if (this.outterOverLap(args)) {
          this.notify.toast({
            message: OUTTER_CONFLICT_MSG,
          });
          return false;
        }
        if (this.hasOverlap(args)) {
          this.notify.toast({
            message: DOUBLE_BOOK_MSG,
          });
          return false;
        }
        let tempEvent: MbscCalendarEvent = args.event;
        const idx = this.myEvents.findIndex((element) => {
          return element.id === tempEvent.id;
        });
        this.myEvents.splice(idx, 1);
        this.myEvents = [...this.myEvents, tempEvent];
        this.isEdit = true;
        this.updateReservation(tempEvent);
      },
    };
    this.ready = true;
  }

  setUpDatePickerOptions() {
    let min: Date = new Date(this.selectedDate);
    min.setHours(Number(this.eventStartTime.slice(0, 2)));
    min.setMinutes(Number(this.eventStartTime.slice(-2)));

    let max = new Date(this.selectedDate);
    max.setHours(Number(this.eventEndTime.slice(0, 2)));
    max.setMinutes(Number(this.eventEndTime.slice(-2)));

    this.datePickerOptions = {
      select: "range",
      showRangeLabels: false,
      touchUi: true,
      stepMinute: 15,
      min: min,
      max: max,
    };
  }

  async loadTranslatorReservations() {
    const token = this.params.user.auth_api_token;
    const translator = this.params.translator._id;
    const user = this.params.user;
    const result = await this.apiService
      .getReservationsByQuery(token, {
        translator: translator,
        status: '{"$nin":["EXPIRED","DISAPPROVED","CANCELLED"]}',
      })
      .toPromise();
    let reservations: MbscCalendarEvent[] = [];
    result.forEach((element) => {
      const editable = user.api_user_id == element.creator._id;
      let blocked = "Blocked";
      if (this.params.viewBy == ADMINISTRATOR) {
        blocked += ` by ${element.creator.name}  (${element.creator.email})`;
      }
      reservations.push({
        id: element._id,
        title: editable ? `Reserved to ${user.name}` : blocked,
        editable: editable,
        color: editable ? element.location.color : "#454545",
        start: new Date(element.start),
        end: new Date(element.end),
        requirements: element.requirements,
        service: element.service,
      });
    });
    this.myEvents = reservations;
    return reservations;
  }

  async loadClientReservations() {
    const token = this.params.user.auth_api_token;
    const translator = this.params.translator;
    const user = this.params.user;
    const result = await this.apiService
      .getReservationsByQuery(token, {
        creator: user.api_user_id,
        status: '{"$nin":["EXPIRED","DISAPPROVED","CANCELLED"]}',
      })
      .toPromise();
    let reservations: any[] = [];
    result.forEach((element) => {
      console.log({ element });
      if (element.translator._id != translator._id) {
        reservations.push({
          element,
        });
      }
    });
    this.otherUserReservations = reservations;
    return reservations;
  }

  async saveEventCreation() {
    if (this.outterOverLap(this.tempEvent)) {
      this.notify.toast({
        message: OUTTER_CONFLICT_MSG,
      });
      return;
    }
    this.tempEvent.requirements = this.popupEventRequirement;
    const r: any = await this.createReservation(this.tempEvent);
    const n: any = await this.notificationsService
      .createMessage(
        "You have a new reservation",
        "NOTIFICATION",
        this.params.translator._id,
        {
          title: "Reservation created",
          subtype: "RESERVATION",
          action: "CREATE",
          _id: r,
        }
      )
      .toPromise();
    this.popup.close();
  }

  cancelEventCreation() {
    const idx = this.myEvents.length - 1;
    this.myEvents.splice(idx, 1);
    this.popup.close();
  }

  saveEvent(): void {
    if (this.isEdit) {
      this.tempEvent.title = this.popupEventTitle;
      this.tempEvent.start = this.popupEventDates[0];
      this.tempEvent.end = this.popupEventDates[1];
      this.calendarSelectedDate = this.popupEventDates[0];
      this.tempEvent.requirements = this.popupEventRequirement;
    }
    const args = {
      event: {
        id: this.tempEvent.id,
        start: this.tempEvent.start,
        end: this.tempEvent.end,
      },
    };

    if (this.outterOverLap(args)) {
      this.notify.toast({
        message: OUTTER_CONFLICT_MSG,
      });
      return;
    }

    if (!this.hasOverlap(args)) {
      if (this.isEdit) {
        // update the event in the list
        this.myEvents = [...this.myEvents];
        this.updateReservation(this.tempEvent);
        // here you can update the event in your storage as well
        // ...
      } else {
        // add the new event to the list
        this.myEvents = [...this.myEvents, this.tempEvent];
        // here you can add the event to your storage as well
        // ...
      }
      // navigate the calendar
      // close the popup
      this.popup.close();
    } else {
      this.notify.toast({
        message: DOUBLE_BOOK_MSG,
      });
    }
  }

  async deleteEvent(event: MbscCalendarEvent) {
    this.myEvents = this.myEvents.filter((item) => item.id !== event.id);
    this.notify.toast({
      message: "Event deleted",
    });
    this.deleteReservation(event);
  }

  onDeleteClick(): void {
    this.deleteEvent(this.tempEvent);
    this.popup.close();
  }

  close() {
    this.modalController.dismiss({ events: this.myEvents });
  }

  padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  async createReservation(event: MbscCalendarEvent) {
    const fields = {
      start: event.start,
      end: event.end,
      translator: this.params.translator._id,
      location: this.params.location,
      requirements: event.requirements,
      service: event.service,
    };
    const result = await this.apiService
      .createReservation(this.params.user.auth_api_token, fields)
      .toPromise();
    event.id = result._id;

    await this.notificationsService
      .createMessage(
        "You have a new reservation",
        "NOTIFICATION",
        this.params.translator._id,
        {
          title: "Reservation created",
          subtype: "RESERVATION",
          action: "CREATE",
          _id: event.id,
        }
      )
      .toPromise();

    return event.id;
  }

  async updateReservation(event: MbscCalendarEvent) {
    const fields = {
      start: event.start,
      end: event.end,
      requirements: event.requirements,
      service: event.service,
    };
    const result = await this.apiService
      .updateReservation(this.params.user.auth_api_token, fields, event.id)
      .toPromise();
    const n: any = await this.notificationsService
      .createMessage(
        "Reservation on you has changed",
        "NOTIFICATION",
        this.params.translator._id,
        {
          title: "Reservation changed",
          subtype: "RESERVATION",
          action: "UPDATE",
          _id: event.id,
        }
      )
      .toPromise();
  }

  async deleteReservation(event: MbscCalendarEvent) {
    const result = await this.apiService
      .deleteReservation(this.params.user.auth_api_token, event.id)
      .toPromise();
    const n: any = await this.notificationsService
      .createMessage(
        `Reservation on you was deleted by the client
        <br/>
        Client: ${event.title.replace("Reserved to", "")}
        <br/> 
        Date: ${event.start}`,
        "NOTIFICATION",
        this.params.translator._id,
        {
          title: "Reservation deleted",
          subtype: "RESERVATION",
          action: "DELETE",
          _id: event.id,
        }
      )
      .toPromise();
  }
  onChangeRequirements($event) {
    if (this.popupEventRequirement.length > 5) {
      this.popupEditButtons[1].disabled = false;
    } else {
      this.popupEditButtons[1].disabled = true;
    }
  }

  async openCalBookPop() {
    let modal = await this.modalController.create({
      component: CalBookPopPage,
      breakpoints: [0.5, 0.6, 0.7],
      cssClass: "cal-book-modal",
      initialBreakpoint: 0.6,
      backdropDismiss: false,
      componentProps: {
        services: this.services,
        tempEvent: this.tempEvent,
        isEdit: this.isEdit,
        popupEventTitle: this.popupEventTitle,
        popupEventRequirement: this.popupEventRequirement,
        datePickerOptions: this.datePickerOptions,
        popEventDates: this.popupEventDates,
      },
    });
    await modal.present();

    modal.onDidDismiss().then(async (data: any) => {
      console.log({ data });
      const saved: boolean = data.data.canSave;
      const forceDelete: boolean = data.data?.forceDelete;
      const tempEvent = data.data.tempEvent;
      const creating: boolean = !this.isEdit;
      if (creating) {
        if (saved) {
          await this.createReservation(tempEvent);
          await this.loadTranslatorReservations();
          // this.myEvents = [...this.myEvents, this.tempEvent];
        } else {
          this.myEvents = [...this.myEvents];
        }
      } else {
        if (forceDelete) {
          await this.deleteEvent(tempEvent);
        } else {
          if (this.hasOverlap({ event: tempEvent })) {
            this.notify.toast({
              message: DOUBLE_BOOK_MSG,
            });
            return false;
          }
          if (this.outterOverLap({ event: tempEvent })) {
            this.notify.toast({
              message: OUTTER_CONFLICT_MSG,
            });
            return;
          } else {
            await this.updateReservation(tempEvent);
          }
        }
        await this.loadTranslatorReservations();
      }
    });
  }
}
