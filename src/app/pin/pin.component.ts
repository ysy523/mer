import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform } from '@ionic/angular';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import * as myGlobals from '../../services/global';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-pin',
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.scss'],
})
export class PinComponent implements OnInit {

  oldpin = '';
  newpin = '';
  cnewpin = '';
  showversion = '';
  tomain = {
    merchantcode: '',
    password: ''
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, params: NavParams,
    private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    private platform: Platform,private route:ActivatedRoute) {
      this.route.queryParams.subscribe(params =>{

        this.showversion = myGlobals.version;
        this.tomain.merchantcode = params['merchantcode'];
        this.tomain.password = params['password'];
       
      })

  }

  ngOnInit() { 

     console.log("pin APK-----", this.tomain.merchantcode)
  }



  async updatePin() {
    let checkNumber = /^(0|[1-9][0-9]*)$/;
    this.newpin = this.newpin.replace(/\s/g, "");
    this.cnewpin = this.cnewpin.replace(/\s/g, "");

    if (!this.oldpin || !this.newpin || !this.newpin) {
      this.alertHelper('Error', 'Please insert old PIN, New PIN and confirm PIN', null, 0);
    }
    else if (this.newpin.length != 6 || this.cnewpin.length != 6) {
      this.alertHelper('Error', 'Please insert 6-digit PIN', null, 0);
    }
    else if (this.newpin != this.cnewpin) {
      this.alertHelper('Error', 'PIN not match', null, 0);
    }
    else if (!checkNumber.test(this.newpin) || !checkNumber.test(this.cnewpin)) {
      this.alertHelper('Error', 'Please insert number only', null, 0);
    }
    else {
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: this.platform.win.navigator.userAgent.toString(),
        oldpin: this.oldpin,
        newpin: this.newpin
      };
      //console.log(body)
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });


      const options: HttpOptions = {
        url: myGlobals.url + '/UpdateTxnPin',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }

      Http.request(options).then(async (data: any) => {
        try {
          await loading.dismiss();
          if (data.data.header.response_code == 0) {

            const alert = await this.alertCtrl.create({
              header: 'Update Pin',
              message: 'PIN updated.',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    this.newpin = '';
                    this.cnewpin = '';
                    this.oldpin = '';
                  }
                }
              ]
            })

            await alert.present()

          } else {

            const alert = await this.alertCtrl.create({
              header: 'UpdatePin Error Code : ' + data.data.header.response_code,
              message: data.data.header.response_description,
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                  }
                }
              ]
            })

            await alert.present()

          }

        } catch (e) {

          await loading.dismiss();
          console.log("UpdatePin Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'GenTac Ex Error',
            message: e,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
            ]
          })
          await alert.present()
        }

      }).catch(async err => {

        await loading.dismiss();
        console.log("UpdatePin ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'GenTac Error',
          message: err,
          buttons: [
            {
              text: 'OK',
              handler: () => {
              }
            }
          ]
        })
        await alert.present()
      })

    }

  }

  async alertHelper(header, body, eletofocus, inputorselect) {
    // inputorselect 0 = input, 1 = select
    let alert = await this.alertCtrl.create({
      header: header,
      message: body,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }



}