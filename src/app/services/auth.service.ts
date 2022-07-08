import { Injectable } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  UserCredential,
  signInWithEmailAndPassword,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
} from "@angular/fire/auth";
import {
  doc,
  docData,
  Firestore,
  serverTimestamp,
  setDoc,
  collection,
  collectionData,
} from "@angular/fire/firestore";
import { map, takeUntil } from "rxjs/operators";
import { Router } from "@angular/router";
import { Subject, BehaviorSubject } from "rxjs";
import * as fbauth from "firebase/auth";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserData = null;
  logout$: Subject<boolean> = new Subject<boolean>();
  statuses$: BehaviorSubject<any> = new BehaviorSubject(null);
  role$: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserData = null;
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        docData(userDoc, { idField: "id" })
          .pipe(takeUntil(this.logout$))
          .subscribe((data) => {
            this.currentUserData = data;
            this.statuses$.next(data.statuses);
            this.role$.next(data.role);
          });
      } else {
        this.currentUserData = null;
      }
    });
  }

  getCurrentUserData(): Promise<any> {
    return new Promise((resolve) => {
      if (this.currentUserData) {
        resolve(this.currentUserData);
      } else {
        const user = this.auth.currentUser;
        if (user) {
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          docData(userDoc, { idField: "id" })
            .pipe(takeUntil(this.logout$))
            .subscribe((data) => {
              this.currentUserData = data;
              resolve(this.currentUserData);
            });
        } else {
          this.currentUserData = null;
          resolve(this.currentUserData);
        }
      }
    });
  }

  login({ email, password }) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signup({ email, password, name, role }): Promise<UserCredential> {
    try {
      let credentials: any = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log({ credentials });
      credentials.name = name;
      credentials.photoURL = "";
      fbauth.sendEmailVerification(credentials.user);
      // const userDoc = doc(this.firestore, `users/${credentials.user.uid}`);
      // await setDoc(userDoc, { email, name: name, role: role });
      await this.createFireStoreUser(credentials);
      return credentials;
    } catch (err) {
      throw err;
    }
  }

  createFireStoreUser(credentials): Promise<any> {
    return new Promise(async (resolve) => {
      let avatars: any = {
        application: "",
        google: "",
      };
      let name = credentials.user.displayName;
      if (!name) {
        name = credentials.name;
      }
      if (credentials.user.photoURL) {
        avatars["application"] = credentials.user.photoURL;
        avatars["google"] = credentials.user.photoURL;
      }
      let statuses: any = {};
      statuses.created_profile = false;
      statuses.aproved = false;
      const email = credentials.user.email;
      const role = "CLIENT";
      const userDoc = doc(this.firestore, `users/${credentials.user.uid}`);

      await setDoc(userDoc, {
        uid: credentials.user.uid,
        email: email,
        name: name,
        role: role,
        roles: [role],
        avatars: avatars,
        statuses: statuses,
        timestamp: serverTimestamp(),
      });
      resolve(true);
    });
  }

  async logout() {
    await signOut(this.auth);
    this.logout$.next(true);

    this.router.navigateByUrl("/", { replaceUrl: true });
  }

  async signIn_FB_Google(googleUserInfo) {
    var credential_google: any = fbauth.GoogleAuthProvider.credential(
      googleUserInfo.authentication.idToken
    );

    const credentials = await signInWithCredential(
      this.auth,
      credential_google
    );
    return credentials;
  }

  async resendEmail(credentials) {
    await fbauth.sendEmailVerification(credentials.user);
  }

  resetPw_FB(email) {
    return fbauth.sendPasswordResetEmail(this.auth, email);
  }

  getUserByEmail(email) {
    const usersRef = collection(this.firestore, "users");
    return collectionData(usersRef, { idField: "id" }).pipe(
      takeUntil(this.logout$),
      map((users) => {
        return users.filter((user) => user.email == email);
      })
    );
  }

  getUserByUid(uid) {
    const usersRef = collection(this.firestore, "users");
    return collectionData(usersRef, { idField: "id" }).pipe(
      takeUntil(this.logout$),
      map((users) => {
        return users.filter((user) => user.uid == uid);
      })
    );
  }

  getEmail() {
    return this.auth.currentUser.email;
  }

  getUID() {
    return this.auth.currentUser.uid;
  }
}
