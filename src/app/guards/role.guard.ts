import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { AuthService } from "../services/auth.service";
import { take, map, takeUntil } from "rxjs/operators";
import { Auth } from "@angular/fire/auth";
import { doc, docData, Firestore, setDoc } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: Auth,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const expectedRole = route.data.role;
      const user = this.auth.currentUser;
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        docData(userDoc, { idField: "id" }).subscribe((data) => {
          const user = data;
          const role = user["role"];
          if (expectedRole == role) {
            resolve(true);
          } else {
            this.navigateByRole(role);
            resolve(false);
          }
        });
      } else {
        reject(false);
      }
    });
  }

  navigateByRole(role) {
    if (role == "CLIENT") {
      this.router.navigateByUrl("/client-home");
    } else if (role == "TRANSLATOR") {
      this.router.navigateByUrl("/translator-home");
    } else if (role == "ADMINISTRATOR") {
      this.router.navigateByUrl("/administrator-home");
    }
  }
}
