import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslatorRatingDetailsPage } from './translator-rating-details.page';

const routes: Routes = [
  {
    path: '',
    component: TranslatorRatingDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TranslatorRatingDetailsPageRoutingModule {}
