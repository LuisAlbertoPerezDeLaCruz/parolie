import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountriesModalPage } from './countries-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CountriesModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CountriesModalPageRoutingModule {}
