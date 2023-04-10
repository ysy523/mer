import { GmodalComponent } from './../gmodal/gmodal.component';
import { Component, OnInit } from '@angular/core';
import {Platform, NavController, NavParams, AlertController, LoadingController, ModalController } from '@ionic/angular';
import * as myGlobals from '../../services/global'
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss'],
})
export class RedeemComponent implements OnInit {

  section = 'Init';
  showversion = '';
  toRedeem = {
    value: 0,
    mmappId: '', // uuid
    action: 1,
    remark: '', // prod_description
    username: '',
    merchant_id: '',
    prod_code: ''}

    loader: any;
    tomain = {
      merchantcode : '',
      password : ''
    }

    selectedAction='Init';
    transHistoryArray = [];
    displayMMAppID = '';
    isSearch = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private barcodeScanner:BarcodeScanner, private alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private platform: Platform, 
    public modalCtrl: ModalController,private route:ActivatedRoute) {
      this.route.queryParams.subscribe(params =>{
  
        this.tomain.merchantcode = params['merchantcode'];
        this.tomain.password = params['password'];
        this.showversion = myGlobals.version;
        

       })
             
     }

  ngOnInit() {
    console.log('ionViewDidLoad RedeemPage');
  }

  
  navToSection(section) {
    if(section == 'Init') {
      this.section = 'Init';

    } else if(section == 'Redeem') {
      this.section = 'Redeem';
      
    } else if(section == 'History') {
      this.section = 'History';
      this.getTransHistory();
    } 
  }

  
  blockBack(){

    // stop back button (for 1 s)
    // used by barcode camera (when canceling and returnin back)
    // was sending the back event to the router, and left the screen
    
    document.addEventListener("backbutton", onBackKeyDown, false);
    
    setTimeout(function(){
    document.removeEventListener("backbutton", onBackKeyDown, false)
    }, 1000)
    
      function onBackKeyDown() {
      // swallow the back button - do nothing
      return false;
      }
    }


  onScanQRToRedeem() {
    this.barcodeScanner.scan().then(async barcodeData => {
      console.log('Barcode data', barcodeData);

      if (barcodeData.cancelled == false && barcodeData.text.length == 0) {
        const alert = await this.alertCtrl.create({
          header: 'Invalid',
          message: 'Invalid QR code. Please try again.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.section = 'Init';
              }
            }
          ]
        })
        await alert.present();
      } else {
        if (barcodeData.cancelled == false) {
          let qrData = barcodeData.text;

          if (qrData) {
            try {
              // qrData = JSON.parse(qrData);
              // console.log('qrdata', qrData);
              // this.toRedeem.mmappId = qrData['aa_uuid'];
              // this.toRedeem.action = 3;
              // this.toRedeem.value = qrData['issuePoints'] ? Number(qrData['issuePoints']) : 0;
              // this.toRedeem.merchant_id =  qrData['merchant_id'];

              // if(this.toRedeem.mmappId != '') {
              this.loader = await this.loadingCtrl.create();
              await this.loader.present();

              let body = {
                merchant_code: this.tomain.merchantcode,
                password: this.tomain.password,
                merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
                appversion: myGlobals.version,
                platform: this.platform.platforms()[0],
                device: "ios",
                qrvalue: qrData,
                fid: 2 // redeem evoucher
              };

              // let headers = new Headers({ 'Content-Type': 'application/json' });
              // let options = new RequestOptions({ headers: headers });


              const options: HttpOptions = {
                url: myGlobals.url + '/GetUserDetails',
                data: body,
                method: 'POST',
                connectTimeout: myGlobals.timeout,
                headers: { 'Content-Type': 'application/json' }
              }
              Http.request(options).then(async (data: any) => {

                try {
                  await this.loader.dismiss();

                  if (data.data.header.response_code == 0) {
                    if (data.data.body) {


                      if (data.data.body.prod_name == '' || data.data.body.prod_name == null ||
                        data.data.body.aa_uuid == '' || data.data.body.aa_uuid == null ||
                        data.data.body.prod_code == '' || data.data.body.prod_code == null) {
                        const alert = await this.alertCtrl.create({
                          header: 'Invalid',
                          message: 'Please try again with a valid QR code [003].',
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
                        this.toRedeem.username = data.data.body.name;
                        this.toRedeem.mmappId = data.data.body.aa_uuid;
                        this.toRedeem.remark = data.data.body.prod_name;
                        this.toRedeem.merchant_id = data.data.merchant_code;
                        this.toRedeem.prod_code = data.data.body.prod_code;

                        let modalPage = await this.modalCtrl.create({
                          component: GmodalComponent, componentProps: {
                            merchantcode: this.tomain.merchantcode,
                            password: this.tomain.password, action: 3, data: this.toRedeem
                          }
                        });

                        modalPage.onDidDismiss();
                        await modalPage.present();
                      }
                    } else {
                      const alert = await this.alertCtrl.create({
                        header: 'Oops error occured',
                        message: 'Please try again.',
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
                  } else {
                    const alert = await this.alertCtrl.create({
                      header: 'Attention',
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
                } catch (e) {
                  await this.loader.dismiss();
                  console.log("evoucher redeem Ex ERROR!: ", e);
                  const alert = await this.alertCtrl.create({
                    header: 'Redemption Ex Error',
                    message: e + ' Please try again.',
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

              }).catch(async err => {
                await this.loader.dismiss();
                console.log("ERROR evoucher redeem!: ", err);
                const alert = await this.alertCtrl.create({
                  header: 'Request Error',
                  message: err + ' Please try again.',
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

              // } else {
              //   this.alertCtrl.create({
              //     title: 'Error',
              //     message: 'Invalid QR code. Please try again with a valid QR code[001].',
              //     buttons: [
              //       {
              //         text: 'OK',
              //         handler: () => {
              //           // this.section = 'Init';
              //           // this.ionViewDidLoad();
              //         }
              //       }
              //     ]
              //   }).present();
              // }

            } catch (e) {
              console.log('scan qr error', e);
              const alert = await this.alertCtrl.create({
                header: 'Invalid',
                message: 'Invalid QR code. Please try again with a valid QR code.',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => {
                      // this.section = 'Init';
                    }
                  }
                ]
              })
              await alert.present();
            }

          } else {
            const alert = await this.alertCtrl.create({
              header: 'Invalid',
              message: 'Failed to scan QR. Please try again',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    // this.section = 'Init';
                  }
                }
              ]
            })
            await alert.present();
          }
        }
      }
    }).catch(async err => {
      console.log('evoucher barcode scan err', err);
      const alert = await this.alertCtrl.create({
        header: 'Redeem eVoucher ScanQR Ex Error',
        message: err + ' Please try again.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
      await alert.present();
    });
  }



  
  scanQR() {
    this.transHistoryArray = [];
    this.isSearch = false;
    this.barcodeScanner.scan().then(async barcodeData => {
      console.log('Barcode data', barcodeData);

        // var regex = /^\d+$/;   
        // if (barcodeData.cancelled == false && !regex.test(barcodeData.text)){
        //   this.alertCtrl.create({
        //     title: 'Error',
        //     message: 'Invalid QR code, please try again.',
        //     buttons: [
        //       {
        //         text: 'OK',
        //         handler: () => {
        //         }
        //       }
        //     ]
        //   }).present();
        // } else 
        
        if (barcodeData.cancelled == false && barcodeData.text.length == 0) {
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Invalid QR code.',
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
          this.toRedeem.mmappId = barcodeData.text;
          let strArr = [];
          strArr = barcodeData.text.split('-');
          this.displayMMAppID = strArr[0] + 'XXXXXXXX';
        }

     }).catch(err => {
         console.log('Error', err);
     });
  }

  
  back() {
    this.section = 'Init';
    this.isSearch = false;

    this.resetToRedeem();
  }

  
  pop() {
    this.navCtrl.pop();
  }

  
  async issueRedeemPoints() {
    if (this.toRedeem.mmappId == '') {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please enter/scan MMApp ID.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              return;
            }
          }
        ]
      })
      await alert.present();
    } else if (this.toRedeem.value == 0) {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please enter value.',
        buttons: [
          {
            text: 'OK',
            handler: () => {

              return;
            }
          }
        ]
      })
      await alert.present();
    } else if (this.toRedeem.action != 1 && this.toRedeem.action != 2) {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Invalid action. Please select Issue or Redeem.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              return;
            }
          }
        ]
      })
      await alert.present();
    } else {
      try {
        if (this.toRedeem.action && this.toRedeem.value && this.toRedeem.mmappId) {
          this.loader = await this.loadingCtrl.create();
          await this.loader.present();

          let body = {
            merchant_code: this.tomain.merchantcode,
            password: this.tomain.password,
            merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
            appversion: myGlobals.version,
            platform: this.platform.platforms()[0],
            device: "ios",
            uuid: this.toRedeem.mmappId,
            merchant_remark: this.toRedeem.remark,
            points: this.toRedeem.value,
            action_id: this.toRedeem.action
          };

          // let headers = new Headers({ 'Content-Type': 'application/json' });
          // let options = new RequestOptions({ headers: headers });

          let endPoint = '';
          if (this.toRedeem.action == 1) {
            endPoint = '/IssueEStamp';
          } else if (this.toRedeem.action == 2) {
            endPoint = '/RedeemEStamp';
          }


          const options: HttpOptions = {
            url: myGlobals.url + endPoint,
            data: body,
            method: 'POST',
            connectTimeout: myGlobals.timeout,
            headers: { 'Content-Type': 'application/json' }
          }

          Http.request(options).then(async (data: any) => {
            try {
              await this.loader.dismiss();

              if (data.data.header.response_code == 0) {
                const alert = await this.alertCtrl.create({
                  header: this.selectedAction + ' Voucher',
                  message: data.data.header.response_description,
                  buttons: [
                    {
                      text: 'OK',
                      handler: () => {
                        this.section = 'Voucher';
                      }
                    }
                  ]
                })
                await alert.present();

              } else {
                const alert = await this.alertCtrl.create({
                  header: this.selectedAction + ' Voucher: ' + data.data.header.response_code,
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
            } catch (e) {
              this.loader.dismiss();
              console.log(this.selectedAction + " Ex ERROR!: ", e);
              const alert = await this.alertCtrl.create({
                header: this.selectedAction + ' Ex Error',
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

          }).catch(async err => {
            await this.loader.dismiss();
            console.log("ERROR!: ", err);
            const alert = await this.alertCtrl.create({
              header: this.selectedAction + ' Error',
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


        } else {
          const alert = await this.alertCtrl.create({
            header: '',
            message: 'Please enter all information.',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  return;
                }
              }
            ]
          })
          await alert.present();
        }
      } catch (ex) {
        const alert = await this.alertCtrl.create({
          header: this.selectedAction + ' Error',
          message: ex,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                return;
              }
            }
          ]
        })
        await alert.present();
      }
    }
  }


  async getTransHistory() {
    this.loader = await this.loadingCtrl.create();
    await this.loader.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
      appversion : myGlobals.version,
      platform:this.platform.platforms()[0],
      device:"ios"
    };

 

    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });


    const options: HttpOptions = {
      url: myGlobals.url + '/GetEVoucherTransHistory',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async(data:any)=>{
      try {
        await this.loader.dismiss();
        console.log(data);
        this.isSearch = true;
        if(data.data.header.response_code == 0)
        {
          if(data.data.body && (data.data.body.result != '' || data.data.body.result!= '[]')) {
            console.log('1');
            this.transHistoryArray = JSON.parse(data.data.body.result);
          }
          else {
            console.log('2');
            this.transHistoryArray = []; // no record
          }
          console.log(this.transHistoryArray);
        } else {
          await this.loader.dismiss();
         const alert =await this.alertCtrl.create({
            header: 'Get Trans History Error Code : ' + data.data.header.response_code ,
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
        console.log("GetTransHis Ex ERROR!: ", e);
        const alert =await this.alertCtrl.create({
          header: 'GetTransHistory Ex Error',
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
        const alert = await this.alertCtrl.create({
            header: 'GetTransHistory Error',
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

  isEmpty(obj) {
    if (!obj){
      return true;
    }
    if(obj.length>0){
      return true;
    }else{
      return false;
    }
  }

  resetToRedeem() {
    this.toRedeem.value = 0;
    this.toRedeem.mmappId = '';
    this.toRedeem.action = 1;
    this.toRedeem.remark = '';
    this.toRedeem.username = '';
    this.toRedeem.merchant_id = '';
  }







}