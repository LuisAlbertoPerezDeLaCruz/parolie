import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslatorSchedullePage } from './translator-schedulle.page';

const routes: Routes = [
  {
    path: '',
    component: TranslatorSchedullePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TranslatorSchedullePageRoutingModule {}
