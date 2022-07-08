import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RateTranslatorPage } from './rate-translator.page';

const routes: Routes = [
  {
    path: '',
    component: RateTranslatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RateTranslatorPageRoutingModule {}
