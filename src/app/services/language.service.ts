import { Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import {
  localeEn,
  localeEs,
  localeFr,
  localeDe,
  localeIt,
  localeZh,
  MbscLocale,
} from "@mobiscroll/angular5";

import { enUS, es, fr, it, de, zhCN } from "date-fns/locale";

const LNG_KEY = "SELECTED_LANGUAGE";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  selected = "";

  constructor(
    private translate: TranslateService,
    private storage: Storage,
    private plt: Platform
  ) {}

  async setInitialAppLanguage() {
    await this.storage.create();
    let language = this.translate.getBrowserLang();
    // We may get browsers language as default but we decide to make it english
    language = "en";
    this.translate.setDefaultLang(language);
    this.storage.get(LNG_KEY).then((val) => {
      if (!val) {
        val = language;
      }
      this.setLanguage(val);
      this.selected = val;
    });
  }

  getLanguages() {
    return [
      { text: "English", value: "en", img: "assets/imgs/en.png" },
      { text: "Française", value: "fr", img: "assets/imgs/fr.png" },
      { text: "Español", value: "es", img: "assets/imgs/es.png" },
      { text: "中国人", value: "ch", img: "assets/imgs/ch.png" },
      { text: "Italiano", value: "it", img: "assets/imgs/it.png" },
      { text: "Deutsche", value: "de", img: "assets/imgs/de.png" },
    ];
  }

  async setLanguage(lng) {
    return new Promise((resolve, reject) => {
      this.translate.use(lng);
      this.selected = lng;
      this.storage.set(LNG_KEY, lng).then(
        () => {
          resolve(true);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  getLanguage() {
    if (this.selected == "en") {
      return "en-EN";
    } else if (this.selected == "es") {
      return "es-ES";
    } else if (this.selected == "fr") {
      return "fr-FR";
    } else if (this.selected == "de") {
      return "de-DE";
    } else if (this.selected == "it") {
      return "it-IT";
    } else if (this.selected == "ch") {
      return "zh-hant-HK";
    }
  }

  getLocaleForDateFns() {
    let locale = null;
    const languageSelected = this.getLanguage();
    switch (languageSelected) {
      case "es-ES": {
        locale = es;
        break;
      }
      case "fr-FR": {
        locale = fr;
        break;
      }
      case "it-IT": {
        locale = it;
        break;
      }
      case "de-DE": {
        locale = de;
        break;
      }
      case "zh-hant-HK": {
        locale = zhCN;
        break;
      }
    }
    return locale;
  }

  getLocale(languageSelected: string): MbscLocale {
    let locale: MbscLocale = null;
    switch (languageSelected) {
      case "en-EN":
        locale = localeEn;
        break;
      case "es-ES":
        locale = localeEs;
        break;
      case "fr-FR":
        locale = localeFr;
        break;
      case "de-DE":
        locale = localeDe;
        break;
      case "it-IT":
        locale = localeIt;
        break;
      case "zh-hant-HK":
        locale = localeZh;
        break;
      default:
        break;
    }
    return locale;
  }
}
