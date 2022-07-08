import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslatorAgendaPage } from './translator-agenda.page';

const routes: Routes = [
  {
    path: '',
    component: TranslatorAgendaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TranslatorAgendaPageRoutingModule {}
