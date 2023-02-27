import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  todo = {
    loginid: '',
    pwd: '',
    rmbme : false
  }

  constructor() { }

  ngOnInit() {}


  logForm(form:any){

    console.log("login suceess")

  }

}
