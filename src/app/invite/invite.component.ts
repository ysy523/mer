import { Component, OnInit } from '@angular/core';
import {Platform, NavController, NavParams, AlertController, LoadingController } from '@ionic/angular';
import * as myGlobals from '../../services/global'
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
})
export class InviteComponent implements OnInit {

  hpno = '';
  showversion = '';
  loader: any;
  tomain = {
  	merchantcode : '',
  	password : ''
  }


  backButtonSubscription: any;
  backButtonClickCount: number = 0;



  constructor(public navCtrl: NavController,private alertCtrl: AlertController, public loadingCtrl: LoadingController,
    private platform: Platform,private route:ActivatedRoute) {

      this.route.queryParams.subscribe(params =>{
        this.showversion = myGlobals.version;
        this.tomain.merchantcode = params['merchantcode'];
        this.tomain.password = params['password'];
        
      })

      this.platform.ready().then(() => {
        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
          if (this.backButtonClickCount === 0) {
            this.backButtonClickCount++;
            alert('Press again to exit');
            setTimeout(() => {
              this.backButtonClickCount = 0;
            }, 2000); // Reset count after 2 seconds
          } else {
            navigator['app'].exitApp();
          }
        });
      });


     }

  ngOnInit() {}

  back() {
    this.navCtrl.pop();
  }


  // Only Integer Numbers
  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  async submit(){
    console.log("this.hpno",this.hpno.length)
    if(this.hpno.length != 10 && this.hpno.length != 11){
      const alert =await this.alertCtrl.create({
        header: 'Error',
        message: 'Please enter valid Hp Number.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
      await alert.present();
    } else if (!this.hpno.startsWith("0")) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please enter valid Hp Number.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
     await alert.present();
    } else {
      // request to invite
      this.loader = await this.loadingCtrl.create();
      await this.loader.present();
  
      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
        appversion : myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios",
        hp: this.hpno
      
      };

      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });

      const options:HttpOptions={
        url:myGlobals.url + '/SendReferralInvitation',
        data:body,
        method:'POST',
        connectTimeout:myGlobals.timeout,
        headers:{'Content-Type': 'application/json'}
  }
     
  Http.request(options).then(async(data:any)=>{

    try {
       await this.loader.dismiss();

      if(data.data.header.response_code == 0)
      {
       const alert =await this.alertCtrl.create({
          header: 'Success',
          message: data.data.header.response_description,
          buttons: [
            {
                text: 'OK',
                handler: () => {
                 
                }
            }
          ]
        })
       await alert.present();

      } else {
        const alert = await this.alertCtrl.create({
          header: '',
          message: data.data.header.response_description,
          buttons: [
            {
              text: 'OK',
              handler: () => {
              }
            }
          ]
        })
       await alert.present();
      }
    } catch(e) {
      await this.loader.dismiss();
      console.log("SendReferral Invitation Ex ERROR!: ", e);
     const alert= await this.alertCtrl.create({
        header: 'Invitation Ex Error',
        message: e,
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
     await alert.present();
    }
       
  }).catch(async err=>{
    await this.loader.dismiss();
    console.log("ERROR!: ", err);
    const alert =await this.alertCtrl.create({
        header: 'Request Error',
        message: err,
        buttons: [
            {
              text: 'OK',
              handler: () => {
              }
            }
        ]
    })
   await alert.present();

  })

   
}
  }


  pop() {
    this.navCtrl.pop();
  }

}