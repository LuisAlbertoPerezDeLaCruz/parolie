import { Component, OnInit } from "@angular/core";
import { ClientsServiceService } from "../../../services/clients-service.service";
import { ConfigService } from "../../../services/config.service";
import { Router } from "@angular/router";
import {} from "@ionic/angular";
@Component({
  selector: "app-library",
  templateUrl: "./library.page.html",
  styleUrls: ["./library.page.scss"],
})
export class LibraryPage implements OnInit {
  client = null;
  is_translator = false;
  ready = false;
  constructor(
    private clientsService: ClientsServiceService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit() {
    this.client = this.configService.getUserFB();
    this.is_translator = this.client.roles.includes("TRANSLATOR");
    this.ready = true;
  }

  async switchMode(mode) {
    await this.clientsService.switchMode(mode);
    this.router.navigateByUrl("/");
  }
}
