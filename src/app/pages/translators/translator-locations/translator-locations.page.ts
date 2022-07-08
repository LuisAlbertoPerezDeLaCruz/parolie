import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocationPage } from '../../../modals/location/location.page';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslatorsService } from '../../../services/translators.service';
import { ApiService } from '../../../services/api.service';
import { ILocation } from '../../../interfaces/ilocation';
import { ConfigService } from '../../../services/config.service';

const COLORS = ['#26c57d', '#fd966a', '#6a9dfd', '#f86afd', '#6afdd1'];

@Component({
  selector: 'app-translator-locations',
  templateUrl: './translator-locations.page.html',
  styleUrls: ['./translator-locations.page.scss'],
})
export class TranslatorLocationsPage implements OnInit {
  adding = false;
  editing = false;
  locationForm: FormGroup;
  locality = null;
  locations = null;
  changingLocations = false;
  latLng = null;
  locationName = null;
  idx = null;

  translator = null;

  ready = false;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private translatorsService: TranslatorsService,
    private alertController: AlertController,
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.translator = this.configService.getUserFB();
    this.setUpPage().then(() => {
      this.ready = true;
    });
  }

  createForm() {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required]],
      locality: ['', [Validators.required]],
      address: ['', []],
      latitude: [''],
      longitude: [''],
      keywords: [''],
      primary: [false],
    });
  }

  ionViewWillEnter() {}

  async setUpPage() {
    this.locations = await this.apiService
      .getTranslatorLocations(this.translator.auth_api_token, {
        creator: this.translator.api_user_id,
      })
      .toPromise();
  }

  addLocation() {
    this.createForm();
    if (this.locations.length == 0) {
      this.locationForm.controls['primary'].setValue(true);
    }
    this.adding = true;
  }

  async createLocation() {
    if (this.locationForm.value.primary) {
      this.locations.forEach((item: ILocation, idx) => {
        item.primary = false;
        item.color = COLORS[idx];
      });
    }
    this.locations = [...this.locations, this.locationForm.value];
    this.apiService.setUserLocations(this.locations);
    await this.translatorsService.updateStatus('created_locations', true);
    this.adding = false;
  }

  async saveLocation() {
    if (this.locationForm.value.primary) {
      this.locations.forEach((item) => {
        item.primary = false;
      });
    }
    this.locations[this.idx] = this.locationForm.value;
    const primary_location = this.locations.find(
      (item) => item.primary == true
    );
    if (!primary_location) {
      this.locations[0].primary = true;
    }

    this.apiService.setUserLocations(this.locations);

    await this.translatorsService.updateStatus('created_locations', true);

    this.editing = false;
  }

  selectFromMap() {
    this.openLocationModal();
  }

  async openLocationModal() {
    if (this.adding) {
      this.locality = null;
      this.latLng = null;
    }
    const modal = await this.modalController.create({
      component: LocationPage,
      cssClass: 'location-modal',
      backdropDismiss: false,
      componentProps: {
        latLng: this.latLng,
        locality: this.locality,
        locationName: this.locationName,
      },
    });

    await modal.present();

    modal.onDidDismiss().then((result: any) => {
      const data = result.data;
      if (data.locality) {
        let keywords = [];
        data.locality.address_components.forEach((element) => {
          keywords.push(element.long_name);
          keywords.push(element.short_name);
        });
        this.locationForm.controls['keywords'].setValue(`+${keywords}`);
        if (Object.keys(data).length > 0) {
          this.locality = result.data.locality.formatted_address;
          this.locationForm.controls['latitude'].setValue(
            `+${result.data.position.lat()}`
          );
          this.locationForm.controls['longitude'].setValue(
            `+${result.data.position.lng()}`
          );
        }
      }
    });
  }
  cancel() {
    this.adding = false;
    this.editing = false;
  }

  edit(idx) {
    this.createForm();
    const location = this.locations[idx];
    this.locationForm.controls['name'].setValue(location.name);
    this.locationForm.controls['locality'].setValue(location.locality);
    this.locationForm.controls['address'].setValue(location.address);
    this.locationForm.controls['latitude'].setValue(location.latitude);
    this.locationForm.controls['longitude'].setValue(location.longitude);
    this.locationForm.controls['keywords'].setValue(location.keywords);
    this.locationForm.controls['primary'].setValue(location.primary);
    this.locality = location.locality;
    this.latLng = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    this.editing = true;
    this.locationName = location.name;
    this.idx = idx;
  }

  async delete(idx) {
    if (this.locations[idx].primary) {
      const alert = await this.alertController.create({
        header: 'Alert',
        subHeader: 'This is the primary location',
        message:
          'Can not delete primary location. Please set another location as primary before deleting this one.',
        buttons: ['OK'],
      });

      await alert.present();

      const { role } = await alert.onDidDismiss();
      return;
    }
    const alert = await this.alertController.create({
      header: 'Confirm delete!',
      message: `Delete location "${this.locations[idx].name}" ?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'Yes',
          handler: () => {
            this.locations.splice(idx, 1);
            this.apiService.setUserLocations(this.locations);
          },
        },
      ],
    });

    await alert.present();
  }
}
