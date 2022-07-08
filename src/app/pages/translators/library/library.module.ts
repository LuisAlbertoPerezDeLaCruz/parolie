import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LibraryPageRoutingModule } from "./library-routing.module";

import { LibraryPage } from "./library.page";

import { MaterialModule } from "../../../material.module";

import { TranslateModule } from "@ngx-translate/core";

import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibraryPageRoutingModule,
    MaterialModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [LibraryPage],
})
export class LibraryPageModule {}
