import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ITranslatorProfile } from "../../interfaces/itranslator-profile";
import { IUser } from "../../interfaces/iuser";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-translator-profile-card",
  templateUrl: "./translator-profile-card.component.html",
  styleUrls: ["./translator-profile-card.component.scss"],
})
export class TranslatorProfileCardComponent {
  canShowMore = false;
  @Input() profile: ITranslatorProfile;
  @Output() selectedTranslator: EventEmitter<IUser> = new EventEmitter<IUser>();
  linkToSchedule(profile) {
    this.selectedTranslator.emit(profile.creator);
  }
  constructor(private translate: TranslateService) {
    this.canShowMore = false;
  }
}
