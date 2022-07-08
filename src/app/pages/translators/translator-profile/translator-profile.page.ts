import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  LoadingController,
  ToastController,
  ModalController,
} from "@ionic/angular";
import { PhotoService } from "../../../services/photo.service";
import { TranslatorsService } from "../../../services/translators.service";
import { CountriesModalPage } from "../../../modals/countries-modal/countries-modal.page";
import { ApiService } from "../../../services/api.service";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: "app-translator-profile",
  templateUrl: "./translator-profile.page.html",
  styleUrls: ["./translator-profile.page.scss"],
})
export class TranslatorProfilePage implements OnInit {
  profileForm: FormGroup;
  countries: any = [];
  phone = "";

  avatar = null;

  user_api = null;

  api_profile: any = {};

  translator = null;

  ready = false;

  constructor(
    private translatorsService: TranslatorsService,
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public photoService: PhotoService,
    private modalController: ModalController,
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.translator = this.configService.getUserFB();
    this.user_api = this.configService.getUserApi();
    this.setUpPage().then(() => {
      this.ready = true;
    });
  }

  async setUpPage() {
    this.profileForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      middle_name: [""],
      date_of_birth: ["", Validators.required],
      gender: ["", Validators.required],
      nationality: ["", Validators.required],
      nationality_obj: [""],
      country_of_residence: ["", Validators.required],
      country_of_residence_obj: [""],
      city: ["", Validators.required],
      zip_code: ["", Validators.required],
      address: ["", Validators.required],
      picture: [""],
      phone_number: ["", Validators.required],
      occupation: ["", Validators.required],
      languages: ["", Validators.required],
      types_of_services: ["", Validators.required],
      description: ["", Validators.required],
      photo: [""],
    });
    let result = await this.apiService
      .getTranslatorProfile(this.translator.auth_api_token, {
        creator: this.user_api._id,
      })
      .toPromise();

    console.log({ result });

    if (result.length > 0) {
      this.api_profile = result[0];
      if (result[0].hasOwnProperty("date_of_birth")) {
        this.api_profile["date_of_birth"] = this.api_profile[
          "date_of_birth"
        ].substr(0, 10);

        Object.keys(this.api_profile).forEach((element) => {
          if (this.profileForm.contains(element)) {
            this.profileForm.controls[element].setValue(
              this.api_profile[element]
            );
          }
        });
      }
    }

    this.avatar = this.api_profile.picture;
    if (!this.avatar) {
      this.avatar = "../../../../assets/imgs/blank-profile-picture.png";
    }
  }

  async save() {
    if (Object.keys(this.api_profile).length > 0) {
      const updatedProfile = await this.apiService
        .updateTranslatorProfile(
          this.translator.auth_api_token,
          this.profileForm.value,
          this.api_profile._id
        )
        .toPromise();
      const result = await this.apiService
        .updateUser(
          this.translator.auth_api_token,
          { "avatars.application": this.api_profile.picture },
          this.user_api._id
        )
        .toPromise();
    } else {
      const newProfile = await this.apiService
        .createTranslatorProfile(
          this.translator.auth_api_token,
          this.profileForm.value
        )
        .toPromise();
      const result = await this.apiService
        .updateUser(
          this.translator.auth_api_token,
          { "avatars.application": this.api_profile.picture },
          this.user_api._id
        )
        .toPromise();
    }

    let toast = await this.toastCtrl.create({
      duration: 3000,
      message: "Successfully saved.",
    });
    toast.present();
    await this.translatorsService.updateRoles("TRANSLATOR");
    await this.translatorsService.updateStatus("created_profile", true);
  }

  async addPhotoToGallery() {
    await this.photoService.takePicture();
    this.avatar = this.getProfilePhoto();
    let loading = await this.loadingCtrl.create({
      message: "Uploading...",
    });
    await loading.present();
    const imageUrl = await this.translatorsService.savePicture();
    const fields = { picture: imageUrl };
    if (Object.keys(this.api_profile).length > 0) {
      await this.apiService
        .updateTranslatorProfile(
          this.translator.auth_api_token,
          fields,
          this.api_profile._id
        )
        .toPromise();
    } else {
      await this.apiService
        .createTranslatorProfile(this.translator.auth_api_token, fields)
        .toPromise();
    }

    this.loadingCtrl.dismiss();
  }

  getProfilePhoto() {
    let r = null;
    if (this.photoService.guestImageBase64) {
      r = this.photoService.guestImageBase64;
    } else {
      r = this.profileForm.value.photo;
    }
    return r;
  }

  async openCountriesModal(fieldCalling) {
    const modal = await this.modalController.create({
      component: CountriesModalPage,
      breakpoints: [0, 0.6, 0.8, 1],
      cssClass: "custom-modal",
      initialBreakpoint: 0.6,
      componentProps: {},
    });
    modal.onDidDismiss().then((data: any) => {
      if (data.data) {
        this.profileForm.controls[fieldCalling].setValue(
          data.data.ctryItem.name
        );

        let field_obj = {
          alpha3Code: data.data.ctryItem.alpha3Code,
          callingCode: data.data.ctryItem.callingCodes[0],
          flag: data.data.ctryItem.flag,
          name: data.data.ctryItem.name,
          region: data.data.ctryItem.region,
          timezone: data.data.ctryItem.timezones[0],
        };
        this.profileForm.controls[`${fieldCalling}_obj`].setValue(field_obj);
        if (
          !this.profileForm.controls["phone_number"].value &&
          fieldCalling == "country_of_residence"
        ) {
          let code = null;
          try {
            code = data.data.ctryItem.callingCodes[0];
          } catch (error) {
            code = "";
          }
          this.profileForm.controls["phone_number"].setValue(`+${code}`);
        }
      }
    });
    modal.present();
  }

  onClickCamera() {
    this.photoService.takePicture().then(() => {
      this.avatar = this.getProfilePhoto();
      this.translatorsService.savePicture().then((res) => {});
    });
  }
}
