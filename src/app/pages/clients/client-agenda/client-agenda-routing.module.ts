import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientAgendaPage } from './client-agenda.page';

const routes: Routes = [
  {
    path: '',
    component: ClientAgendaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientAgendaPageRoutingModule {}
