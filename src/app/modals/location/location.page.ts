import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ModalController, NavParams, AlertController } from "@ionic/angular";

import { Geolocation } from "@capacitor/geolocation";
import { MapsService } from "src/app/services/maps.service";

@Component({
  selector: "app-location",
  templateUrl: "./location.page.html",
  styleUrls: ["./location.page.scss"],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class LocationPage implements OnInit {
  @ViewChild("map", { static: false }) mapElement: ElementRef;

  map: google.maps.Map;
  home: google.maps.Marker;
  infoWindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  adrresses = null;
  latLng = null;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    public zone: NgZone,
    private mapsService: MapsService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.latLng = this.navParams.get("latLng");
    this.loadMap(this.mapElement);
    if (!this.latLng) {
      this.loadUserPosition();
    } else {
      const lat = this.latLng.latitude;
      const lng = this.latLng.longitude;
      const locationName = this.navParams.get("locationName");
      const locality = this.navParams.get("locality");
      const info = `<b>${locationName}</b><br>${locality}`;
      this.focusMap(lat, lng);
      this.addMarker(lat, lng, info, false);
    }
  }

  ionViewWillLeave() {}

  close() {
    this.modalController.dismiss({});
  }

  loadMap(mapElement) {
    let latLng = new google.maps.LatLng(10.4169, -66.82);
    let styles: google.maps.MapTypeStyle[] = [
      {
        featureType: "poi",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
    ];
    let mapOptions: google.maps.MapOptions = {
      center: latLng,
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles,
      mapTypeControl: false,
    };
    this.map = new google.maps.Map(mapElement.nativeElement, mapOptions);

    this.map.addListener("click", (mapsMouseEvent) => {
      this.removeMarker();
      this.getLocality(mapsMouseEvent.latLng).then((res) => {
        const lat = mapsMouseEvent.latLng.lat();
        const lng = mapsMouseEvent.latLng.lng();
        this.showUserPositionInMap(
          lat,
          lng,
          `<b>${res[0].formatted_address}</b>`
        );
      });
    });
  }

  loadUserPosition() {
    Geolocation.getCurrentPosition().then(
      (res) => {
        const lat = res.coords.latitude;
        const lng = res.coords.longitude;
        const latLng = new google.maps.LatLng(lat, lng);
        this.getLocality(latLng).then((res) => {
          this.showUserPositionInMap(
            lat,
            lng,
            `<b>${res[0].formatted_address}</b>`
          );
        });
      },
      (err) => {
        console.log({ err });
      }
    );
  }

  getLocality(latLng: google.maps.LatLng) {
    return new Promise((resolve) => {
      let request: google.maps.GeocoderRequest = {
        location: latLng,
      };
      new google.maps.Geocoder().geocode(request, (result) => {
        let filtered = result.filter((element) => {
          return element.types.includes("sublocality");
        });
        if (filtered.length == 0) {
          filtered = result.filter((element) => {
            return element.types.includes("locality");
          });
        }
        if (filtered.length == 0) {
          filtered = result.filter((element) => {
            return element.types.includes("administrative_area_level_1");
          });
        }
        resolve(filtered);
      });
    });
  }

  showUserPositionInMap(lat, lng, info) {
    this.focusMap(lat, lng);
    this.addMarker(lat, lng, info);
  }

  focusMap(lat, lng) {
    let latLng = new google.maps.LatLng(lat, lng);
    this.map.setCenter(latLng);
    this.map.setZoom(15);
  }

  async resolveSelectInfoWindow() {
    let position = null;

    const latLng = this.home.getPosition();

    const localities = await this.getLocality(latLng);
    const locality = localities[0];

    this.modalController.dismiss({
      locality: locality,
      position: latLng,
    });
  }

  addMarker(lat, lng, info, newLocation = true) {
    let latLng = new google.maps.LatLng(lat, lng);
    let infoWindow = new google.maps.InfoWindow();
    this.home = new google.maps.Marker({
      map: this.map,
      position: latLng,
      animation: google.maps.Animation.DROP,
    });
    let id = "iwid";
    if (newLocation) {
      info +=
        '<br><ion-button size="small" fill="solid" color="light" id="' +
        id +
        '"><ion-icon slot="end" name="checkmark-outline"></ion-icon></ion-icon>Select</ion-button>';

      google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        document.getElementById(id).addEventListener("click", () => {
          this.resolveSelectInfoWindow();
        });
      });
    }

    infoWindow.setContent(info);

    this.home.addListener("click", async () => {
      infoWindow.open(this.map, this.home);
    });
  }

  removeMarker() {
    try {
      this.home.setMap(null);
    } catch (error) {}
  }

  findPlace(e: CustomEvent) {
    if (e.detail.value.length == 0) {
      this.loadUserPosition();
      return;
    } else if (e.detail.value.length < 5) {
      this.removeMarker();
      return;
    }

    let request = {
      query: e.detail.value,
    };

    let service = new google.maps.places.PlacesService(this.map);

    service.textSearch(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // console.log({ results });
          this.map.setCenter(results[0].geometry.location);
          const foundLoc = results[0].geometry.location;
          // Esta funcion la utilicé para analizar el requerimiento
          // de Assier de España
          // this.mapsService.showPlacesFromLocation(foundLoc, this.map);
          const lat = foundLoc.lat();
          const lng = foundLoc.lng();
          const fa = results[0].formatted_address;
          this.removeMarker();
          this.addMarker(lat, lng, `<b>${fa}</b>`);
        }
      }
    );
  }
}
