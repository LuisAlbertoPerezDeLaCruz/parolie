import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/tabs/tabs.module").then((m) => m.TabsPageModule),
  },
  {
    path: "login",
    loadChildren: () =>
      import("./pages/login/login.module").then((m) => m.LoginPageModule),
  },
  {
    path: "cal-book-pop",
    loadChildren: () =>
      import("./modals/cal-book-pop/cal-book-pop.module").then(
        (m) => m.CalBookPopPageModule
      ),
  },
  {
    path: "chat-modal",
    loadChildren: () =>
      import("./modals/chat-modal/chat-modal.module").then(
        (m) => m.ChatModalPageModule
      ),
  },
  {
    path: "rate-translator",
    loadChildren: () =>
      import("./modals/rate-translator/rate-translator.module").then(
        (m) => m.RateTranslatorPageModule
      ),
  },
  {
    path: "translator-rating-details",
    loadChildren: () =>
      import(
        "./modals/translator-rating-details/translator-rating-details.module"
      ).then((m) => m.TranslatorRatingDetailsPageModule),
  },
  {
    path: "checkout-new-card",
    loadChildren: () =>
      import("./modals/checkout-new-card/checkout-new-card.module").then(
        (m) => m.CheckoutNewCardPageModule
      ),
  },
  {
    path: "checkout-select-card",
    loadChildren: () =>
      import("./modals/checkout-select-card/checkout-select-card.module").then(
        (m) => m.CheckoutSelectCardPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
