import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TranslatorLocationsPageRoutingModule } from "./translator-locations-routing.module";

import { TranslatorLocationsPage } from "./translator-locations.page";

import { TranslateModule } from "@ngx-translate/core";
import { MaxPipe, NgPipesModule } from "ngx-pipes";
import { LocationPageModule } from "../../../modals/location/location.module";

import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslatorLocationsPageRoutingModule,
    TranslateModule,
    NgPipesModule,
    LocationPageModule,
    SharedModule,
  ],
  declarations: [TranslatorLocationsPage],
  providers: [MaxPipe],
})
export class TranslatorLocationsPageModule {}
