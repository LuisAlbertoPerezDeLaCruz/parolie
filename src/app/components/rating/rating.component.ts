import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { TranslatorRatingDetailsPage } from "../../modals/translator-rating-details/translator-rating-details.page";
import { ModalController } from "@ionic/angular";

enum COLORS {
  GREY = "#E0E0E0",
  GREEN = "#76FF03",
  YELLOW = "#FFCA28",
  RED = "#DD2C00",
}

@Component({
  selector: "app-rating",
  templateUrl: "./rating.component.html",
  styleUrls: ["./rating.component.scss"],
})
export class RatingComponent implements OnInit {
  @Input() rating: number;
  @Input() mode: string;
  @Input() profile: any;
  @Output() ratingChange: EventEmitter<number> = new EventEmitter();

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  rate(index: number) {
    if (this.mode == "showUpdate") {
      this.rating = index;
      this.ratingChange.emit(this.rating);
    }
  }

  getColor(index: number) {
    if (this.isAboveRating(index)) {
      return COLORS.GREY;
    }
    switch (this.rating) {
      case 1:
        return COLORS.RED;
      case 2:
        return COLORS.RED;
      case 3:
        return COLORS.YELLOW;
      case 4:
        return COLORS.GREEN;
      case 5:
        return COLORS.GREEN;
      default:
        return COLORS.GREY;
    }
  }

  isAboveRating(index: number): boolean {
    return index > this.rating;
  }

  async openDetailsModal() {
    const modal = await this.modalController.create({
      component: TranslatorRatingDetailsPage,
      cssClass: "full-screen-modal",
      componentProps: {
        profile: this.profile,
      },
    });
    modal.onDidDismiss().then((data: any) => {});
    modal.present();
  }
}
