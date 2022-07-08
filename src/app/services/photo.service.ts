import { Injectable } from "@angular/core";

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export interface Photo {
  filepath: string;
  webviewPath: string;
}

@Injectable({
  providedIn: "root",
})
export class PhotoService {
  constructor() {}
  public photos: Photo[] = [];
  public guestPicture = null;
  public guestImageBase64 = null;

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
      allowEditing: true,
    });
    this.photos.unshift({
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath,
    });
  }

  async takePicture() {
    try {
      const profilePicture = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });
      this.guestPicture = profilePicture.base64String;
      // 'data:image/jpeg;base64,' + data => to be displayed in html
      this.guestImageBase64 = "data:image/png;base64," + this.guestPicture;
    } catch (error) {
      console.error(error);
    }
  }
}
