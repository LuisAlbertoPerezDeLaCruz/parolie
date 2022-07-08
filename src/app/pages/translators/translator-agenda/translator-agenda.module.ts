import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslatorAgendaPageRoutingModule } from "./translator-agenda-routing.module";
import { TranslatorAgendaPage } from "./translator-agenda.page";
import { MbscModule } from "@mobiscroll/angular5";
import { HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../../../components/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslatorAgendaPageRoutingModule,
    MbscModule,
    HttpClientModule,
    HttpClientJsonpModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [TranslatorAgendaPage],
})
export class TranslatorAgendaPageModule {}
