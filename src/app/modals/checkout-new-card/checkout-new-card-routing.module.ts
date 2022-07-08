import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutNewCardPage } from './checkout-new-card.page';

const routes: Routes = [
  {
    path: '',
    component: CheckoutNewCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutNewCardPageRoutingModule {}
