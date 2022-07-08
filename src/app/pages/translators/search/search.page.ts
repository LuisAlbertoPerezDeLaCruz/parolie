import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
})
export class SearchPage implements OnInit, OnDestroy {
  translator = null;
  ready = false;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.translator = this.configService.getUserFB();
    this.ready = true;
  }

  ngOnDestroy() {}
}
