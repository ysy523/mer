import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor() {
      // this.show();

      // this.hide();
      
  }

 async show () {
  await SplashScreen.show({
    autoHide: false,
    showDuration: 10000
  });
 }

  async hide (){
    await SplashScreen.hide();
  }

}
