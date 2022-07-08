import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslatorLocationsPage } from './translator-locations.page';

const routes: Routes = [
  {
    path: '',
    component: TranslatorLocationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TranslatorLocationsPageRoutingModule {}
