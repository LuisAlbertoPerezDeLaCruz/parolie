import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CalBookPopPageRoutingModule } from "./cal-book-pop-routing.module";

import { CalBookPopPage } from "./cal-book-pop.page";

import { MbscModule } from "@mobiscroll/angular5";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalBookPopPageRoutingModule,
    MbscModule,
  ],
  declarations: [CalBookPopPage],
})
export class CalBookPopPageModule {}
