import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  todo = {
    loginid: '',
    pwd: '',
    rmbme : false
  };

  constructor() {}


  logForm(form:any){

    console.log("login suceess")

  }
  

}

