import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { HomePageRoutingModule } from "./home-routing.module";

import { HomePage } from "./home.page";

import { TranslateModule } from "@ngx-translate/core";

import { MaterialModule } from "../../../material.module";
import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    TranslateModule,
    MaterialModule,
    SharedModule,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
