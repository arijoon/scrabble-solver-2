import { Component, ViewChild } from '@angular/core';
import { NavController, Nav } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HelpPage } from './../help/help';
import { SolverPage } from '../../solver';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(Nav) nav: Nav;

  items: any;

  constructor(public navCtrl: NavController, private storage: Storage) {
    this.items = [
      { id: 'solver', component: SolverPage, title: 'Solve', text: 'dive into the word solver', icon: 'play' },
      { id: 'help', component: HelpPage, title: 'Help', text: 'learn how to use the app', icon: 'information-circle' }
    ];

  }

  openPage(item) {
    this.storage.set('currentPage', item.id);
    this.navCtrl.push(item.component);
  }
}
