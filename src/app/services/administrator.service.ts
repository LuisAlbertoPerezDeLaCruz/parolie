import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "@angular/fire/firestore";
import { AuthService } from "src/app/services/auth.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AdministratorService {
  translatorsListShow = null;
  administrator = null;

  constructor(private firestore: Firestore, private auth: AuthService) {
    this.auth.getCurrentUserData().then((user) => {
      this.administrator = user;
    });
  }

  get_administrator() {
    return this.administrator;
  }

  async listAdministrators() {
    let result_docs = [];
    const q = query(
      collection(this.firestore, "users"),
      where("role", "==", "ADMINISTRATOR")
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      result_docs.push(doc.data());
    });
    return result_docs;
  }

  set_translators_list_show(value) {
    this.translatorsListShow = value;
  }

  get_translators_list_show() {
    return this.translatorsListShow;
  }

  async listPendingTranslators() {
    let result_docs = [];
    const q = query(
      collection(this.firestore, "users"),
      where("role", "==", "TRANSLATOR"),
      where("statuses.created_profile", "==", true),
      where("statuses.aproved", "==", false)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      result_docs.push(doc.data());
    });
    return result_docs;
  }

  async listApprovedTranslators() {
    let result_docs = [];
    const q = query(
      collection(this.firestore, "users"),
      where("role", "==", "TRANSLATOR"),
      where("statuses.created_profile", "==", true),
      where("statuses.aproved", "==", true)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      result_docs.push(doc.data());
    });
    return result_docs;
  }

  async approveTranslator(uid) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDoc, { "statuses.aproved": true });
  }

  async reverseApprovalTranslator(uid) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDoc, { "statuses.aproved": false });
  }
}
