import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RoleGuard } from "../../guards/role.guard";

import { ConfigGuard } from "../../guards/config.guard";

import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "",
    component: TabsPage,
    children: [
      {
        path: "client-home",
        canActivate: [RoleGuard],
        data: {
          role: "CLIENT",
        },
        loadChildren: () =>
          import("../../pages/clients/home/home.module").then(
            (m) => m.HomePageModule
          ),
      },
      {
        path: "client-library",
        canActivate: [RoleGuard],
        data: {
          role: "CLIENT",
        },
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../../pages/clients/library/library.module").then(
                (m) => m.LibraryPageModule
              ),
          },
          {
            path: "client-agenda",
            loadChildren: () =>
              import(
                "../../pages/clients/client-agenda/client-agenda.module"
              ).then((m) => m.ClientAgendaPageModule),
          },
        ],
      },
      {
        path: "translator-home",
        canActivate: [RoleGuard],
        data: {
          role: "TRANSLATOR",
        },
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../../pages/translators/home/home.module").then(
                (m) => m.HomePageModule
              ),
          },
          {
            path: "profile",
            canActivate: [ConfigGuard],
            loadChildren: () =>
              import(
                "../../pages/translators/translator-profile/translator-profile.module"
              ).then((m) => m.TranslatorProfilePageModule),
          },
          {
            path: "locations",
            canActivate: [ConfigGuard],
            loadChildren: () =>
              import(
                "../../pages/translators/translator-locations/translator-locations.module"
              ).then((m) => m.TranslatorLocationsPageModule),
          },
          {
            path: "schedulle",
            canActivate: [ConfigGuard],
            loadChildren: () =>
              import(
                "../../pages/translators/translator-schedulle/translator-schedulle.module"
              ).then((m) => m.TranslatorSchedullePageModule),
          },
        ],
      },
      {
        path: "translator-library",
        canActivate: [RoleGuard, ConfigGuard],
        data: {
          role: "TRANSLATOR",
        },
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../../pages/translators/library/library.module").then(
                (m) => m.LibraryPageModule
              ),
          },
          {
            path: "profile",
            loadChildren: () =>
              import(
                "../../pages/translators/translator-profile/translator-profile.module"
              ).then((m) => m.TranslatorProfilePageModule),
          },
          {
            path: "schedulle",
            loadChildren: () =>
              import(
                "../../pages/translators/translator-schedulle/translator-schedulle.module"
              ).then((m) => m.TranslatorSchedullePageModule),
          },
          {
            path: "locations",
            loadChildren: () =>
              import(
                "../../pages/translators/translator-locations/translator-locations.module"
              ).then((m) => m.TranslatorLocationsPageModule),
          },
          {
            path: "translator-agenda",
            loadChildren: () =>
              import(
                "../../pages/translators/translator-agenda/translator-agenda.module"
              ).then((m) => m.TranslatorAgendaPageModule),
          },
          {
            path: "reservations",
            loadChildren: () =>
              import(
                "../translators/translator-reservations/translator-reservations.module"
              ).then((m) => m.TranslatorReservationsPageModule),
          },
        ],
      },
      {
        path: "translator-search",
        canActivate: [RoleGuard, ConfigGuard],
        data: {
          role: "TRANSLATOR",
        },
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../../pages/translators/search/search.module").then(
                (m) => m.SearchPageModule
              ),
          },
        ],
      },
      {
        path: "client-search",
        canActivate: [RoleGuard, ConfigGuard],
        data: {
          role: "CLIENT",
        },
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../../pages/clients/search/search.module").then(
                (m) => m.SearchPageModule
              ),
          },
          {
            path: "translator",
            children: [
              {
                path: "schedulle/:id",
                loadChildren: () =>
                  import(
                    "../../pages/translators/translator-schedulle/translator-schedulle.module"
                  ).then((m) => m.TranslatorSchedullePageModule),
              },
            ],
          },
        ],
      },
      {
        path: "administrator-home",
        canActivate: [RoleGuard],
        data: {
          role: "ADMINISTRATOR",
        },
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../../pages/administrators/home/home.module").then(
                (m) => m.HomePageModule
              ),
          },
          {
            path: "translators-list",
            canActivate: [ConfigGuard],
            loadChildren: () =>
              import("../../pages/translators/list/list.module").then(
                (m) => m.ListPageModule
              ),
          },

          {
            path: "translators-list/:id",
            canActivate: [ConfigGuard],
            children: [
              {
                path: "",
                loadChildren: () =>
                  import("../../pages/translators/detail/detail.module").then(
                    (m) => m.DetailPageModule
                  ),
              },
              {
                path: "schedulle",
                loadChildren: () =>
                  import(
                    "../../pages/translators/translator-schedulle/translator-schedulle.module"
                  ).then((m) => m.TranslatorSchedullePageModule),
              },
            ],
          },
        ],
      },
      {
        path: "administrator-search",
        canActivate: [RoleGuard],
        data: {
          role: "ADMINISTRATOR",
        },
        children: [
          {
            path: "",
            canActivate: [ConfigGuard],
            loadChildren: () =>
              import("../../pages/administrators/search/search.module").then(
                (m) => m.SearchPageModule
              ),
          },
        ],
      },
      {
        path: "administrator-library",
        children: [
          {
            path: "",
            canActivate: [RoleGuard],
            data: {
              role: "ADMINISTRATOR",
            },
            loadChildren: () =>
              import("../../pages/administrators/library/library.module").then(
                (m) => m.LibraryPageModule
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
