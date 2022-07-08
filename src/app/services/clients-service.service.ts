import { Injectable } from "@angular/core";
import { doc, updateDoc, Firestore } from "@angular/fire/firestore";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class ClientsServiceService {
  client: any = null;
  userDoc = null;

  constructor(private auth: AuthService, private db: Firestore) {
    this.auth.getCurrentUserData().then((user) => {
      this.client = user;
      this.userDoc = doc(this.db, `users/${this.client.uid}`);
    });
  }

  async setUp() {
    this.client = await this.auth.getCurrentUserData();
    console.log("this.client:", this.client);
    this.userDoc = doc(this.db, `users/${this.client.uid}`);
  }

  getClient() {
    return this.client;
  }

  switchMode(mode) {
    return updateDoc(this.userDoc, { role: mode });
  }
}
