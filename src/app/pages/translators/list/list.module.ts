import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ListPageRoutingModule } from "./list-routing.module";

import { ListPage } from "./list.page";

import { MaterialModule } from "../../../material.module";

import { SharedModule } from "../../../components/shared.module";

import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPageRoutingModule,
    MaterialModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [ListPage],
})
export class ListPageModule {}
