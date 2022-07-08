import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutSelectCardPage } from './checkout-select-card.page';

const routes: Routes = [
  {
    path: '',
    component: CheckoutSelectCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutSelectCardPageRoutingModule {}
