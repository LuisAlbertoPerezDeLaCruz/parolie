import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { MbscCalendarEvent, MbscDatepickerOptions } from "@mobiscroll/angular5";

@Component({
  selector: "app-cal-book-pop",
  templateUrl: "./cal-book-pop.page.html",
  styleUrls: ["./cal-book-pop.page.scss"],
})
export class CalBookPopPage implements OnInit {
  popupEventTitle: any;
  startInput: any;
  endInput: any;
  popupEventRequirement: any;
  datePickerOptions: MbscDatepickerOptions;
  popupEventDates: any;
  tempEvent!: MbscCalendarEvent;
  isEdit = false;

  datetimePickerControls = ["time"];
  datetimePickerResponsive = {
    medium: {
      controls: ["calendar", "time"],
      touchUi: false,
    },
  };

  canSave = false;

  services = null;
  serviceSelected = null;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.services = this.navParams.get("services");
    console.log("this.tempEvent:", this.tempEvent);
    this.serviceSelected = this.tempEvent?.service?._id;
    if (!this.serviceSelected) {
      this.services.forEach((element) => {
        if (element.type == "ASSISTANCE") {
          this.serviceSelected = element._id;
        }
      });
    }
    this.tempEvent = this.navParams.get("tempEvent");
    this.isEdit = this.navParams.get("isEdit");
    this.popupEventTitle = this.navParams.get("popupEventTitle");
    this.datePickerOptions = this.navParams.get("datePickerOptions");
    this.popupEventDates = this.navParams.get("popEventDates");
    this.popupEventRequirement = this.navParams.get("popupEventRequirement");
  }

  close() {
    this.modalController.dismiss({
      canSave: this.canSave,
      tempEvent: this.tempEvent,
    });
  }

  save() {
    this.tempEvent.start = this.popupEventDates[0];
    this.tempEvent.end = this.popupEventDates[1];
    this.tempEvent.service = this.serviceSelected;
    this.modalController.dismiss({
      canSave: this.canSave,
      tempEvent: this.tempEvent,
    });
  }

  delete() {
    this.modalController.dismiss({
      canSave: this.canSave,
      tempEvent: this.tempEvent,
      forceDelete: true,
    });
  }

  onChangeRequirements($event) {
    if (this.popupEventRequirement.length < 5) {
      this.canSave = false;
    } else {
      this.tempEvent.requirements = this.popupEventRequirement;
      this.canSave = true;
    }
  }
}
