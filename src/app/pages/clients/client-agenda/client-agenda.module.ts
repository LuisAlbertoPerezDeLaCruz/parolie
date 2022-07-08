import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ClientAgendaPageRoutingModule } from "./client-agenda-routing.module";
import { ClientAgendaPage } from "./client-agenda.page";
import { MbscModule } from "@mobiscroll/angular5";
import { HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientAgendaPageRoutingModule,
    MbscModule,
    HttpClientModule,
    HttpClientJsonpModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [ClientAgendaPage],
})
export class ClientAgendaPageModule {}
