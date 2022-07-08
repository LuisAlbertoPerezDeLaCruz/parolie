import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";
import { ConfigService } from "../services/config.service";
import { Storage } from "@ionic/storage-angular";
import { NotificationsService } from "../services/notifications.service";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class ConfigGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private notificationsService: NotificationsService,
    private storage: Storage,
    private configService: ConfigService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (this.configService.loaded) {
      return true;
    } else {
      const user_api = await this.storage.get("PAROLIE.USER_API");
      const user_fb = await this.storage.get("PAROLIE.USER_FB");
      if (user_api && user_fb) {
        this.configService.setUserApi(user_api);
        this.configService.setUserFB(user_fb);
        this.configService.loaded = true;
        this.notificationsService.auth_api_token = user_fb.auth_api_token;
        this.notificationsService.api_user_id = user_fb.api_user_id;
        return true;
      } else {
        this.router.navigateByUrl("/");
        return false;
      }
    }
  }

  getConfiguredUrl(route: ActivatedRouteSnapshot): string {
    return (
      "/" +
      route.pathFromRoot
        .filter((v) => v.routeConfig)
        .map((v) => v.routeConfig!.path)
        .join("/")
    );
  }
}
