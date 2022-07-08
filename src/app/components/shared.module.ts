import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { MbscModule } from "@mobiscroll/angular5";

import { ShowHidePasswordComponent } from "./show-hide-password/show-hide-password.component";
import { NotiDetailComponent } from "./noti-detail/noti-detail.component";
import { DateFnsModule } from "ngx-date-fns";
import { ChatModalPageModule } from "../modals/chat-modal/chat-modal.module";
import { TranslateModule } from "@ngx-translate/core";
import { TranslatorProfileCardComponent } from "./translator-profile-card/translator-profile-card.component";
import { ReservationDetailComponent } from "./reservation-detail/reservation-detail.component";
import { RatingComponent } from "./rating/rating.component";

@NgModule({
  declarations: [
    ShowHidePasswordComponent,
    NotiDetailComponent,
    TranslatorProfileCardComponent,
    ReservationDetailComponent,
    RatingComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    MbscModule,
    DateFnsModule,
    ChatModalPageModule,
    TranslateModule,
  ],
  exports: [
    ShowHidePasswordComponent,
    NotiDetailComponent,
    TranslatorProfileCardComponent,
    ReservationDetailComponent,
    RatingComponent,
  ],
})
export class SharedModule {}
