import { ILocation } from "./../../../interfaces/ilocation";
import { ApiService } from "./../../../services/api.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ConfigService } from "../../../services/config.service";
import { IUser } from "../../../interfaces/iuser";
import {
  MbscDatepickerOptions,
  MbscPopup,
  MbscPopupOptions,
  MbscSelectOptions,
} from "@mobiscroll/angular5";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
})
export class SearchPage implements OnInit {
  client = null;
  searchValue: string = "";
  translators_profile_list: IUser[] = [];
  languagesFromSelected: string[] = [];
  languagesToSelected: string[] = [];
  servicesSelected: string[] = [];
  startTime: Date = null;
  endTime: Date = null;
  criteria: Object = {};
  searchString = "";
  ready = false;
  empty = false;

  @ViewChild("popup", { static: false })
  popup!: MbscPopup;
  popupEventTitle: string = "Select search options";

  popupButtons: any = [
    {
      text: this.translate.instant("CLIENTS.search.set"),
      handler: "set",
    },
    {
      text: this.translate.instant("CLIENTS.search.cancel"),
      handler: "cancel",
    },
  ];
  popupOptions: MbscPopupOptions = {
    display: "bottom",
    contentPadding: false,
    fullScreen: false,
    headerText: this.translate.instant("CLIENTS.search.assignSearchOptions"),
    onClose: (event, inst) => {
      if (this.startTime) {
        this.criteria["startTime"] = this.startTime.toISOString();
      }
      if (this.endTime) {
        this.criteria["endTime"] = this.endTime.toISOString();
      }
      this.criteria["languages"] = "";
      if (this.languagesFromSelected.length > 0) {
        this.criteria["languages"] = this.languagesFromSelected.toString();
      }
      if (this.languagesToSelected.length > 0) {
        if (this.criteria["languages"]) {
          this.criteria["languages"] =
            this.criteria["languages"] +
            "," +
            this.languagesToSelected.toString();
        } else {
          this.languagesToSelected.toString();
        }
      }
      if (this.servicesSelected.length > 0) {
        this.criteria["types_of_services"] = this.servicesSelected.toString();
      }
      console.log("this.criteria:", this.criteria);
      this.getTranslatorProfiles(this.searchString);
    },
  };
  datePickerOptions: MbscDatepickerOptions = {
    display: "center",
    onClose: (event, inst) => {
      try {
        this.startTime = event.value[0];
        this.endTime = event.value[1];
      } catch (error) {
        this.startTime = null;
        this.endTime = null;
      }
    },
  };

  languagesFromOptions: MbscSelectOptions = {
    display: "bubble",
    label: this.translate.instant("CLIENTS.search.iSpeak"),
    selectMultiple: true,
    onChange: (event, inst) => {
      this.languagesFromSelected = event.value;
    },
  };

  languagesToOptions: MbscSelectOptions = {
    display: "bubble",
    label: this.translate.instant("CLIENTS.search.translatorMustSpeak"),
    selectMultiple: true,
    onChange: (event, inst) => {
      this.languagesToSelected = event.value;
    },
  };

  servicesOptions: MbscSelectOptions = {
    display: "bubble",
    label: this.translate.instant("CLIENTS.search.services"),
    selectMultiple: true,
    onChange: (event, inst) => {
      this.servicesSelected = event.value;
    },
  };

  languages: Object[] = [];
  services: Object[] = [];
  dateRange: any = {};
  dateRangeStr = "";

  constructor(
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.client = this.configService.getUserFB();
    this.languages = this.loadLanguages();
    this.services = this.loadTypeOfServices();
    this.setDateRange();
    this.ready = true;
  }

  async getLocations(searchString) {
    this.translators_profile_list.length = 0;
    const result: any[] = await this.apiService
      .getLocationsBySearch(this.client.auth_api_token, searchString)
      .toPromise();
    let location_owners: IUser[] = [];
    result.forEach((location: ILocation) => {
      const found = location_owners.find((element: IUser) => {
        return element._id == location.creator._id;
      });
      if (!found) {
        location_owners.push(location.creator);
      }
    });
    this.translators_profile_list = location_owners;
  }

  async getTranslatorProfiles(searchString) {
    this.translators_profile_list.length = 0;
    const result: any[] = await this.apiService
      .getTranslatorsBySearch(
        this.client.auth_api_token,
        searchString,
        this.criteria
      )
      .toPromise();
    this.translators_profile_list = result;
    this.empty =
      result.length == 0 && this.searchString.length > 0 ? true : false;
  }

  onSearchChange(event) {
    const searchValue = event.detail.value;
    console.log({ searchValue });
    // this.getLocations(searchValue);
    this.getTranslatorProfiles(searchValue);
  }

  searchFilter() {
    this.popup.open();
  }

  loadLanguages(): Object[] {
    const languages: Object[] = [
      {
        value: "FR",
        text: this.translate.instant("LANGUAGES.FR"),
      },
      {
        value: "EN",
        text: this.translate.instant("LANGUAGES.EN"),
      },
      {
        value: "SP",
        text: this.translate.instant("LANGUAGES.SP"),
      },
      {
        value: "IT",
        text: this.translate.instant("LANGUAGES.IT"),
      },
      {
        value: "DE",
        text: this.translate.instant("LANGUAGES.DE"),
      },
      {
        value: "ZH",
        text: this.translate.instant("LANGUAGES.ZH"),
      },
    ];
    return languages;
  }

  loadTypeOfServices(): Object[] {
    const type_of_services: Object[] = [
      {
        value: "TR",
        text: this.translate.instant("SERVICES.TR"),
      },
      {
        value: "DC",
        text: this.translate.instant("SERVICES.DC"),
      },
    ];
    return type_of_services;
  }

  async setDateRange() {
    const result = await this.apiService
      .getLatestAvailability(this.client.auth_api_token)
      .toPromise();

    this.dateRange = { start: new Date(), end: new Date(result[0].endTime) };
    this.startTime = this.dateRange.start;
    this.endTime = this.dateRange.end;
  }

  procesarSelectedTranslator(translator: IUser) {
    this.router.navigate([`translator/schedulle/${translator.uid}`], {
      relativeTo: this.activatedRoute,
    });
  }
}
