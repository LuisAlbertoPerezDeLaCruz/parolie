import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TranslatorReservationsPageRoutingModule } from "./translator-reservations-routing.module";

import { TranslatorReservationsPage } from "./translator-reservations.page";
import { TranslateModule } from "@ngx-translate/core";
import { MbscModule } from "@mobiscroll/angular5";
import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TranslatorReservationsPageRoutingModule,
    MbscModule,
    SharedModule,
  ],
  declarations: [TranslatorReservationsPage],
})
export class TranslatorReservationsPageModule {}
