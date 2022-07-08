import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslatorProfilePage } from './translator-profile.page';

const routes: Routes = [
  {
    path: '',
    component: TranslatorProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TranslatorProfilePageRoutingModule {}
