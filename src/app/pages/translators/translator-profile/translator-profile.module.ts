import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NgPipesModule, MaxPipe } from "ngx-pipes";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TranslatorProfilePageRoutingModule } from "./translator-profile-routing.module";

import { TranslatorProfilePage } from "./translator-profile.page";

import { MaterialModule } from "../../../material.module";

import { CountriesModalPageModule } from "../../../modals/countries-modal/countries-modal.module";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NgPipesModule,
    TranslatorProfilePageRoutingModule,
    MaterialModule,
    CountriesModalPageModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [TranslatorProfilePage],
  providers: [MaxPipe],
})
export class TranslatorProfilePageModule {}
