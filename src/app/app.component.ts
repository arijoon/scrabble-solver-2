import { SolverPage } from './../solver/page/solver';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/home/home';
import { HelpPage } from '../pages/help/help';

const pageKey = 'currentPage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{id: string, title: string, component: any}>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage
  ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { id: 'home', title: 'Home', component: HomePage },
      { id: 'solver', title: 'Solver', component: SolverPage },
      { id: 'help', title: 'Help', component: HelpPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      const pageId = await this.storage.get(pageKey);
      console.log("Reading storage", pageId);

      if (pageId) {
        this.pages.forEach((page) => {
          if (pageId === page.id) {
            this.openPage(page);
          }
        })
      }
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    console.log("setting page");
    this.storage.set(pageKey, page.id);
    this.nav.setRoot(page.component);
  }
}
