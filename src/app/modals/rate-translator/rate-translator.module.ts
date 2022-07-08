import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { RateTranslatorPageRoutingModule } from "./rate-translator-routing.module";
import { RateTranslatorPage } from "./rate-translator.page";
import { SharedModule } from "../../components/shared.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RateTranslatorPageRoutingModule,
    SharedModule,
    TranslateModule,
  ],
  declarations: [RateTranslatorPage],
})
export class RateTranslatorPageModule {}
