import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  ready = false;
  constructor() {}

  ngOnInit() {
    this.ready = true;
  }
}
