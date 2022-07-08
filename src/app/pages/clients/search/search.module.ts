import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SearchPageRoutingModule } from "./search-routing.module";

import { SearchPage } from "./search.page";

import { TranslateModule } from "@ngx-translate/core";
import { MbscModule } from "@mobiscroll/angular5";
import { SharedModule } from "../../../components/shared.module";

import { DateFnsModule } from "ngx-date-fns";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule,
    TranslateModule,
    MbscModule,
    SharedModule,
    DateFnsModule,
  ],
  declarations: [SearchPage],
})
export class SearchPageModule {}
