import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'app-countries-modal',
  templateUrl: './countries-modal.page.html',
  styleUrls: ['./countries-modal.page.scss'],
})
export class CountriesModalPage implements OnInit {
  ctryList: any[];
  ctryListBackup: any[];

  constructor(
    private modalController: ModalController,
    private countriesService: CountriesService
  ) {}

  ngOnInit() {
    this.countriesService.getCountries().subscribe(
      (res) => {
        this.ctryListBackup = res;
        this.ctryList = res;
        console.log({ res });
      },
      (err) => {
        console.log({ err });
      }
    );
  }

  close() {
    this.modalController.dismiss(null);
  }

  async filterList(evt) {
    this.ctryList = this.ctryListBackup;
    const searchTerm = evt.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.ctryList = this.ctryList.filter((currentCtry) => {
      if (currentCtry.name && searchTerm) {
        return (
          currentCtry.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
        );
      }
    });
  }

  selectCtry(ctryItem) {
    this.modalController.dismiss({ ctryItem });
  }
}
