import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ChatModalPageRoutingModule } from "./chat-modal-routing.module";

import { ChatModalPage } from "./chat-modal.page";

import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatModalPageRoutingModule,
    TranslateModule,
  ],
  declarations: [ChatModalPage],
})
export class ChatModalPageModule {}
