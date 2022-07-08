import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalBookPopPage } from './cal-book-pop.page';

const routes: Routes = [
  {
    path: '',
    component: CalBookPopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalBookPopPageRoutingModule {}
