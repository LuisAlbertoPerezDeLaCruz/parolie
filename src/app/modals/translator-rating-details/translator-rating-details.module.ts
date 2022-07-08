import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TranslatorRatingDetailsPageRoutingModule } from "./translator-rating-details-routing.module";

import { TranslatorRatingDetailsPage } from "./translator-rating-details.page";

import { SharedModule } from "../../components/shared.module";

import { MbscModule } from "@mobiscroll/angular";

import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslatorRatingDetailsPageRoutingModule,
    SharedModule,
    MbscModule,
    TranslateModule,
  ],
  declarations: [TranslatorRatingDetailsPage],
})
export class TranslatorRatingDetailsPageModule {}
