import { Injectable } from "@angular/core";
import { Browser } from "@capacitor/browser";

import { Geolocation } from "@capacitor/geolocation";

@Injectable({
  providedIn: "root",
})
export class MapsService {
  public infoWindow: google.maps.InfoWindow = new google.maps.InfoWindow();

  isTracking = false;

  public trackedRoute = [];
  public currentMapTrack = null;

  public start = "";
  public end = "";
  public direction: google.maps.DirectionsResult;

  public map: google.maps.Map;
  public home: google.maps.Marker;

  constructor() {}

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
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles,
      mapTypeControl: false,
    };
    this.map = new google.maps.Map(mapElement.nativeElement, mapOptions);
    this.map.addListener("click", (mapsMouseEvent) => {
      // Close the current InfoWindow.
      this.infoWindow.close();

      // Create a new InfoWindow.
      this.infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      this.infoWindow.setContent(
        JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      );
      this.infoWindow.open(this.map);
    });
  }

  loadUserPosition() {
    Geolocation.getCurrentPosition().then(
      (res) => {
        const lat = res.coords.latitude;
        const lng = res.coords.longitude;
      },
      (err) => {
        console.log({ err });
      }
    );
  }

  showUserPositionInMap(lat, lng) {
    this.focusMap(lat, lng);
    this.addMarker(lat, lng, "<b>My Home</b>");
  }

  focusMap(lat, lng) {
    let latLng = new google.maps.LatLng(lat, lng);
    this.map.setCenter(latLng);
    this.map.setZoom(15);
  }

  addMarker(lat, lng, info) {
    let latLng = new google.maps.LatLng(lat, lng);
    this.home = new google.maps.Marker({
      map: this.map,
      position: latLng,
      animation: google.maps.Animation.DROP,
    });
    let infoWindow = new google.maps.InfoWindow({
      content: info,
    });
    this.home.addListener("click", () => {
      infoWindow.open(this.map, this.home);
    });
  }

  removeMarker() {
    this.home.setMap(null);
  }

  async showPlacesFromLocation(location, this_map) {
    console.log({ location });
    const home = new google.maps.Marker({
      map: this.map,
      position: location,
      animation: google.maps.Animation.DROP,
    });
    let request: google.maps.places.PlaceSearchRequest = {
      types: ["restaurant"],
      radius: 500,
      location: home.getPosition(),
    };

    let service = new google.maps.places.PlacesService(this_map);

    service.nearbySearch(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          let records: any[] = [];
          for (let place of results) {
            let record = `${place.name};${place.vicinity};${place.rating};${place.user_ratings_total}`;
            records.push(record);
            // this.addNearByMarker(place);
          }
          console.log({ records });
        }
      }
    );
  }

  showPlaces() {
    let request: google.maps.places.PlaceSearchRequest = {
      types: ["restaurant"],
      radius: 1000,
      location: this.home.getPosition(),
    };

    let service = new google.maps.places.PlacesService(this.map);

    service.nearbySearch(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (let place of results) {
            this.addNearByMarker(place);
          }
        }
      }
    );
  }

  addNearByMarker(place: google.maps.places.PlaceResult) {
    let marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      animation: google.maps.Animation.DROP,
      icon: { url: place.icon, scaledSize: new google.maps.Size(20, 20) },
    });
    marker.addListener("click", () => {
      let photo = "";
      if (place.photos.length > 0) {
        photo = place.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 });
      }
      this.infoWindow.setContent(
        `<img src="${photo}"><br><b>${place.name}</b><br></b>${place.vicinity}</b>`
      );
      this.infoWindow.open(this.map, marker);
    });
  }

  startTracking() {
    this.isTracking = true;
    this.trackedRoute = [];
    if (this.currentMapTrack) {
      this.currentMapTrack.setMap(null);
    }
    Geolocation.watchPosition({}, (data) => {
      if (data && data.coords != undefined) {
        this.trackedRoute.push({
          lat: data.coords.latitude,
          lng: data.coords.longitude,
        });
        this.redrawPath(this.trackedRoute);
      }
    });
  }

  redrawPath(path) {
    if (this.currentMapTrack) {
      this.currentMapTrack.setMap(null);
    }
    if (path.length > 1) {
      this.currentMapTrack = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#ff00ff",
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      this.currentMapTrack.setMap(this.map);
    }
  }

  stopTracking() {
    this.isTracking = false;
  }

  getDirections() {
    let directionService = new google.maps.DirectionsService();
    let request: google.maps.DirectionsRequest = {
      origin: this.start,
      destination: this.end,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    directionService.route(request, (result) => {
      this.direction = result;
    });
  }

  pickRoute(index) {
    new google.maps.DirectionsRenderer({
      map: this.map,
      directions: this.direction,
      routeIndex: index,
    });
  }

  openNativeRoute(route: google.maps.DirectionsRoute) {
    let start = encodeURIComponent(route.legs[0].start_address);
    let end = encodeURIComponent(route.legs[0].end_address);
    let url = `https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}`;
    Browser.open({ url: url });
  }
}
