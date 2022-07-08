import { Injectable, OnDestroy } from "@angular/core";
import { doc, updateDoc, Firestore } from "@angular/fire/firestore";
import {
  Storage,
  ref,
  uploadString,
  getDownloadURL,
} from "@angular/fire/storage";

import { AuthService } from "./auth.service";

import { PhotoService } from "../services/photo.service";
import { BehaviorSubject, Subscription } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TranslatorsService implements OnDestroy {
  translator: any = null;
  userDoc = null;

  storageRef = null;
  user = null;

  thumb_256_ref = null;

  subscription: Subscription = new Subscription();

  public translatorAvailability = new BehaviorSubject([]);
  public translatorLocations = new BehaviorSubject([]);

  selectedTranslator: any = null;

  translator_statuses = null;

  constructor(
    private auth: AuthService,
    private db: Firestore,
    private storage: Storage,
    private photoService: PhotoService
  ) {
    this.auth.statuses$.subscribe((res) => {
      this.translator_statuses = res;
      console.log("this.translator_statuses:", this.translator_statuses);
    });
    this.auth.getCurrentUserData().then((user) => {
      this.translator = user;
      this.storageRef = ref(
        this.storage,
        `images/translators/${this.translator.uid}`
      );
      this.userDoc = doc(this.db, `users/${this.translator.uid}`);
    });
  }

  setTranslator(value) {
    this.translator = value;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setSelectedTranslator(value) {
    this.selectedTranslator = value;
  }

  getSelectedTranslator() {
    return this.selectedTranslator;
  }

  epochToDateTime(value) {
    let d = new Date(0);
    d.setUTCSeconds(value);
    return d;
  }

  setTranslatorLocations(value) {
    this.translatorLocations.next(value);
  }

  getTranslatorLocations() {
    return this.translatorLocations;
  }

  getTranslatorLocations_as_observable() {
    return this.translatorLocations.asObservable();
  }

  setTranslatorAvailability(value) {
    this.translatorAvailability.next(value);
  }

  getTranslatorAvailability() {
    return this.translatorAvailability;
  }

  getTranslatorAvailability_as_observable() {
    return this.translatorAvailability.asObservable();
  }

  getTranslator() {
    return this.translator;
  }

  async savePicture() {
    let photo = null;
    let imageData = this.photoService.guestPicture;
    const uploadTask = await uploadString(
      this.storageRef,
      imageData,
      "base64",
      {
        contentType: "image/png",
      }
    );
    const url = await getDownloadURL(uploadTask.ref);
    return url;
  }

  switchMode(mode) {
    return updateDoc(this.userDoc, { role: mode });
  }

  updateRoles(rol): Promise<any> {
    return new Promise(async (resolve) => {
      if (!this.translator["roles"].includes(rol)) {
        await updateDoc(this.userDoc, {
          roles: [...this.translator.roles, ...[rol]],
        });
        resolve(true);
      } else {
        resolve(true);
      }
    });
  }

  updateStatus(status, value): Promise<any> {
    return new Promise(async (resolve) => {
      console.log({ status }, { value });
      if (this.translator_statuses) {
        if (this.translator_statuses[status] != value) {
          let statusJson = {};
          statusJson[`statuses.${status}`] = value;
          await updateDoc(this.userDoc, statusJson);
          console.log({ statusJson });
          resolve(true);
        } else {
          // do nothing
          resolve(true);
        }
      } else {
        let statusJson = {};
        statusJson[`statuses.${status}`] = value;
        await updateDoc(this.userDoc, statusJson);
        resolve(true);
      }
    });
  }

  delay(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
