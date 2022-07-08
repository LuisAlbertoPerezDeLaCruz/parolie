import { LOCALE_ID, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
import localeEn from "@angular/common/locales/en";
import localeDe from "@angular/common/locales/de";
import localeFr from "@angular/common/locales/fr";
import localeIt from "@angular/common/locales/it";
import ngZhHantHK from "@angular/common/locales/zh-Hant-HK";

import { LanguageService } from "src/app/services/language.service";

import { TranslateModule } from "@ngx-translate/core";

import { TranslatorSchedullePageRoutingModule } from "./translator-schedulle-routing.module";

import { TranslatorSchedullePage } from "./translator-schedulle.page";

import { HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";

import { CalendarBookingPageModule } from "./../../../modals/calendar-booking/calendar-booking.module";
import { MbscModule } from "@mobiscroll/angular5";
import { SharedModule } from "../../../components/shared.module";

registerLocaleData(localeEs);
registerLocaleData(localeEn);
registerLocaleData(localeDe);
registerLocaleData(localeFr);
registerLocaleData(localeIt);
registerLocaleData(ngZhHantHK);
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormsModule,
    IonicModule,
    TranslatorSchedullePageRoutingModule,
    TranslateModule,
    CalendarBookingPageModule,
    MbscModule,
    SharedModule,
  ],
  declarations: [TranslatorSchedullePage],
  providers: [
    {
      provide: LOCALE_ID,
      deps: [LanguageService],
      useFactory: (languageService) => languageService.getLanguage(),
    },
  ],
})
export class TranslatorSchedullePageModule {}
