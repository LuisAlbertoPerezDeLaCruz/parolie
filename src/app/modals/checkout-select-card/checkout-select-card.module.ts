import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutSelectCardPageRoutingModule } from './checkout-select-card-routing.module';

import { CheckoutSelectCardPage } from './checkout-select-card.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutSelectCardPageRoutingModule
  ],
  declarations: [CheckoutSelectCardPage]
})
export class CheckoutSelectCardPageModule {}
