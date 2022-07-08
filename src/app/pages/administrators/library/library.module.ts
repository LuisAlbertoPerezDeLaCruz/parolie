import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LibraryPageRoutingModule } from "./library-routing.module";

import { LibraryPage } from "./library.page";

import { TranslateModule } from "@ngx-translate/core";

import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibraryPageRoutingModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [LibraryPage],
})
export class LibraryPageModule {}
