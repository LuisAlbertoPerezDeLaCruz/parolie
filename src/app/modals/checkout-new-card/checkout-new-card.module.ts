import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CheckoutNewCardPageRoutingModule } from "./checkout-new-card-routing.module";

import { CheckoutNewCardPage } from "./checkout-new-card.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CheckoutNewCardPageRoutingModule,
  ],
  declarations: [CheckoutNewCardPage],
})
export class CheckoutNewCardPageModule {}
