import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InboxPageRoutingModule } from "./inbox-routing.module";

import { InboxPage } from "./inbox.page";

import { MbscModule } from "@mobiscroll/angular";

import { SharedModule } from "../../components/shared.module";

import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InboxPageRoutingModule,
    MbscModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [InboxPage],
})
export class InboxPageModule {}
