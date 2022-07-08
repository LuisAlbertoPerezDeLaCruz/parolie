import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CountriesModalPageRoutingModule } from "./countries-modal-routing.module";

import { CountriesModalPage } from "./countries-modal.page";

import { ScrollingModule } from "@angular/cdk/scrolling";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountriesModalPageRoutingModule,
    ScrollingModule,
  ],
  declarations: [CountriesModalPage],
})
export class CountriesModalPageModule {}
