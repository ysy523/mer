
import { Component, OnInit } from '@angular/core';
import { NavController,Platform, AlertController, LoadingController, ModalController } from '@ionic/angular';
import * as myGlobals from '../../services/global'
import { Router ,NavigationExtras,ActivatedRoute} from '@angular/router';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import {HttpClient,HttpHeaders  } from '@angular/common/http';
import { timeout ,map } from 'rxjs/operators';
import { GmodalComponent } from './../gmodal/gmodal.component';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
@Component({
  selector: 'app-e-stamp',
  templateUrl: './e-stamp.component.html',
  styleUrls: ['./e-stamp.component.scss'],
})
export class EStampComponent implements OnInit {

  showversion = '';
  section = 'e-Stamp';
  toIssue = {
    eStampNo: 0,
    mmappId: '', // uuid
    action: 1,
    remark: '',
    name: ''
  }

  actionList = [
    {'action_id': 1, 'action_name': 'Issue'},
    {'action_id': 2, 'action_name': 'Redeem'},
  ]

  loader: any;

  tomain = {
  	merchantcode : '',
  	password : ''
  }

  selectedAction='Issue';
  transHistoryArray = [];
  displayMMAppID = '';
  isSearch = false;



  constructor(public navCtrl: NavController, private route:ActivatedRoute,
    public barcodeScanner:BarcodeScanner,public alertCtrl:AlertController ,
    public loadingCtrl:LoadingController, public platform:Platform,
    public http:HttpClient, public modalCtrl:ModalController) { 
    this.route.queryParams.subscribe(params =>{
      this.showversion = myGlobals.version;
      this.tomain.merchantcode = params['merchantcode'];
      this.tomain.password = params['password'];

    })
  }

  ngOnInit() {
    
    console.log('ionViewDidLoad EStampPage');
  }

  
  navToSection(section:any) {
    if(section == 'e-Stamp') {
      this.section = 'e-Stamp';

    } else if(section == 'IssueRedeem') {
      this.section = 'IssueRedeem';
      this.toIssue.mmappId = '';
      this.displayMMAppID = '';

    } else if(section == 'History') {
      this.section = 'History';
      this.toIssue.mmappId = '';
      this.displayMMAppID = '';

    } 
  }

  // not using
  // scanQR() {
  //   this.transHistoryArray = [];
  //   this.isSearch = false;
  //   this.barcodeScanner.scan().then(barcodeData => {
  //     console.log('Barcode data', barcodeData);

  //       // var regex = /^\d+$/;   
  //       // if (barcodeData.cancelled == false && !regex.test(barcodeData.text)){
  //       //   this.alertCtrl.create({
  //       //     title: 'Error',
  //       //     message: 'Invalid QR code, please try again.',
  //       //     buttons: [
  //       //       {
  //       //         text: 'OK',
  //       //         handler: () => {
  //       //         }
  //       //       }
  //       //     ]
  //       //   }).present();
  //       // } else 
        
  //       if (barcodeData.cancelled == false && barcodeData.text.length == 0) {
  //         this.alertCtrl.create({
  //           title: 'Error',
  //           message: 'Invalid QR code.',
  //           buttons: [
  //             {
  //               text: 'OK',
  //               handler: () => {
  //               }
  //             }
  //           ]
  //         }).present();
  //       } else {
  //         this.toIssue.mmappId = barcodeData.text;
  //         let strArr = [];
  //         // strArr = barcodeData.text.split('-');
  //         // this.displayMMAppID = strArr[0] + 'XXXXXXXX';

  //         //region get user name
  //         this.loader = this.loadingCtrl.create();
  //         this.loader.present();

  //         let body = {
  //           merchant_code: this.tomain.merchantcode,
  //           password: this.tomain.password,
  //           merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
  //           appversion : myGlobals.version,
  //           platform: this.platform._platforms[2],
  //           device: this.platform['_ua'].toString(),
  //           qrvalue: this.toIssue.mmappId,
  //           fid: 3 // issue redeem estamp
  //         };

  //         let headers = new Headers({ 'Content-Type': 'application/json' });
  //         let options = new RequestOptions({ headers: headers });
    
  //         this.http
  //         .post(myGlobals.url + '/GetUserDetails', body, options)
  //         .timeout(myGlobals.timeout)
  //           .map(res => res.json())
  //           .subscribe(
  //           data => {
              
  //             this.loader.dismiss();

  //             try {
  //               if(data.header.response_code == 0)
  //               {
  //                 if(data.body) {
  //                  this.toIssue.name = data.body.name;
  //                  console.log(this.toIssue.name);

  //                 } else {
  //                   this.alertCtrl.create({
  //                     title: 'Oops error occured',
  //                     message: 'Please try again.',
  //                     buttons: [
  //                       {
  //                         text: 'OK',
  //                         handler: () => {
  //                         }
  //                       }
  //                     ]
  //                   }).present();
  //                 }
    
  //               } else {
  //                 this.alertCtrl.create({
  //                   title: 'Internal Error',
  //                   message: data.header.response_description,
  //                   buttons: [
  //                     {
  //                       text: 'OK',
  //                       handler: () => {
  //                       }
  //                     }
  //                   ]
  //                 }).present();
  //               }
  //             } catch(e) {
                
  //               console.log("Get user detail Ex ERROR!: ", e);
  //               this.alertCtrl.create({
  //                 title: 'Request Ex Error',
  //                 message: e,
  //                 buttons: [
  //                   {
  //                     text: 'OK',
  //                     handler: () => {
  //                     }
  //                   }
  //                 ]
  //               }).present();
  //             }
  //           },err => {
          
  //             console.log("ERROR!: ", err);
  //             this.alertCtrl.create({
  //                 title: 'Request Error',
  //                 message: err,
  //                 buttons: [
  //                     {
  //                       text: 'OK',
  //                       handler: () => {
  //                       }
  //                     }
  //                 ]
  //             }).present();
  //           })
  //         // end region get user name
  //       }
  //    }).catch(err => {
  //        console.log('Error', err);
  //    });
  // }


 scanQRGetHistory() {
    this.transHistoryArray = [];
    this.isSearch = false;

    this.barcodeScanner.scan().then(async barcodeData => {
      console.log('Barcode data', barcodeData);

      if (barcodeData.cancelled == false && barcodeData.text.length == 0) {
       const alert =await this.alertCtrl.create({
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
        this.toIssue.mmappId = barcodeData.text;
        if(this.toIssue.mmappId.length > 0) {
          this.loader = await this.loadingCtrl.create();
         await this.loader.present();

           //region get user name
          let body = {
            merchant_code: this.tomain.merchantcode,
            password: this.tomain.password,
            merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
            appversion : myGlobals.version,
            platform:this.platform.platforms()[0],
            device: "ios",
            qrvalue: this.toIssue.mmappId,
            fid: 3 // issue redeem estamp
          };

          // const headers = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});

          const options: HttpOptions = {
            headers: { 'Content-Type': 'application/json' },
            url: myGlobals.url + '/GetUserDetails',
            connectTimeout: myGlobals.timeout,
            method: "POST",
            data: body
          }
      

          Http.request(options).then(async(data:any)=>{
               await this.loader.dismiss();
               try {
                if(data.data.header.response_code == 0)
                {
                  if(data.data.body) {
                   this.toIssue.name = data.data.body.name;
                   console.log(this.toIssue.name);
                   this.getTransHistory();

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
                    header: 'Invalid',
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
                console.log("Get user detail Ex ERROR!: ", e);
                const alert = await this.alertCtrl.create({
                  header: 'Request Ex Error',
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
         
              console.log("ERROR!: ", err);
             const alert = await this.alertCtrl.create({
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
    
         // end region get user name
        } else {
          await this.loader.dismiss();
          const alert= await this.alertCtrl.create({
            header: 'Invalid',
            message: 'Invalid QR, please try again.',
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
      }
    }).catch(err => {
        console.log('Error', err);
    });
  }

  onActionChange() {
    if(this.toIssue.action == 1) {this.selectedAction = 'Issue'} 
    else if (this.toIssue.action == 2) {this.selectedAction = 'Redeem'} 
    else {this.selectedAction = ''} 
  }


  back() {
    this.section = 'e-Stamp';
    this.isSearch = false;
    this.resetToIssue();
  }

  async issueRedeemPoints(){
    if(this.toIssue.mmappId == ''){
     const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please scan QR code.',
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
    } else if(this.toIssue.eStampNo == 0){
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please enter number of e-Stamp.',
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
    } else if(this.toIssue.action != 1 && this.toIssue.action != 2){
     const alert =await this.alertCtrl.create({
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
        if(this.toIssue.action && this.toIssue.eStampNo && this.toIssue.mmappId) {
          this.loader =  await this.loadingCtrl.create();
          await this.loader.present();
      
          let body = {
            merchant_code: this.tomain.merchantcode,
            password: this.tomain.password,
            merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
            appversion : myGlobals.version,
            platform: this.platform.platforms()[0],
            device: "ios",
            uuid: this.toIssue.mmappId,
            merchant_remark: this.toIssue.remark,
            points: this.toIssue.eStampNo,
            action_id: this.toIssue.action
          };

          // let headers = new  HttpHeaders({ 'Content-Type': 'application/json' });
          // let options = new RequestOptions({ headers: headers });

          let endPoint = '';
          if(this.toIssue.action == 1){
            endPoint = '/IssueEStamp';
          } else if(this.toIssue.action == 2){
            endPoint = '/RedeemEStamp';
          } 

          const options: HttpOptions = {
            headers: { 'Content-Type': 'application/json' },
            url: myGlobals.url + endPoint,
            connectTimeout: myGlobals.timeout,
            method: "POST",
            data: body
          }
          Http.request(options).then(async (data:any)=>{
            try {
              await this.loader.dismiss();
    
              if(data.data.header.response_code == 0)
              {
                const alert = await this.alertCtrl.create({
                  header: this.selectedAction + ' e-Stamp',
                  message: data.data.header.response_description,
                  buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                          this.section = 'e-Stamp';
                          this.resetToIssue();
                        }
                    }
                  ]
                })
                await alert.present();

              } else {
               const alert = await this.alertCtrl.create({
                  header: this.selectedAction + ' e-Stamp: ' + data.data.header.response_code ,
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

          }).catch(async err=>{
            await this.loader.dismiss();
            console.log("ERROR!: ", err);
           const alert =await this.alertCtrl.create({
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
          await  alert.present();
          
               
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
      } catch(ex) {
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

 async  getTransHistory() {
    if(this.toIssue.mmappId != ''){

      this.loader = await this.loadingCtrl.create();
      await this.loader.present();
  
      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
        appversion : myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios",
        uuid: this.toIssue.mmappId
      };

    
  
      // let headers =  new HttpHeaders({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });

      const options: HttpOptions = {
        headers: { 'Content-Type': 'application/json' },
        url: myGlobals.url + '/GetEStampTransHistory',
        connectTimeout: myGlobals.timeout,
        method: "POST",
        data: body
      }
  

      Http.request(options).then(async (data:any)=>{
        try {
          await this.loader.dismiss();
          console.log(data);
          this.isSearch = true;
          if(data.data.header.response_code == 0)
          {
            if(data.data.body && (data.data.body.result != '' || data.data.body.result != '[]')) {
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
           const alert = await this.alertCtrl.create({
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
  
    } else {
     const alert = await this.alertCtrl.create({
          header: '',
          message: 'Please enter/scan MMApp ID.',
          buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
          ]
      })
     await  alert.present();
    }
  }


  isEmpty(obj:any) {
    if (!obj){
      return true;
    }
    if(obj.length>0){
      return true;
    }else{
      return false;
    }
  }


  scanToIssueRedeem() {
    this.transHistoryArray = [];
    this.isSearch = false;
    this.barcodeScanner.scan().then(async barcodeData => {
      console.log('Barcode data', barcodeData);
      if (barcodeData.cancelled == true) {
        return;
      }

      if (barcodeData.cancelled == false && barcodeData.text.length == 0) {
        const alert = await this.alertCtrl.create({
          header: 'Invalid',
          message: 'Invalid QR code. Please try again.',
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
        this.toIssue.mmappId = barcodeData.text;
        //let strArr = [];
        // strArr = barcodeData.text.split('-');
        // this.displayMMAppID = strArr[0] + 'XXXXXXXX';

        if(this.toIssue.mmappId.length > 0) {
          //region get user name
          this.loader = await this.loadingCtrl.create();
          await this.loader.present();

          let body = {
            merchant_code: this.tomain.merchantcode,
            password: this.tomain.password,
            merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
            appversion : myGlobals.version,
            platform: this.platform.platforms()[0],
            device: "ios",
            qrvalue: this.toIssue.mmappId,
            fid: 3 // issue redeem estamp
          };

          // let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
          // let options = new ({ headers: headers });

          const options: HttpOptions = {
            headers: { 'Content-Type': 'application/json' },
            url: myGlobals.url + '//GetUserDetails',
            connectTimeout: myGlobals.timeout,
            method: "POST",
            data: body
          }

          Http.request(options).then(async(data:any)=>{
            await this.loader.dismiss();

            try {
              if(data.data.header.response_code == 0)
              {
                if(data.data.body) {
                  this.toIssue.name = data.data.body.name;
                  console.log(this.toIssue.name);

                  let modalPage = await this.modalCtrl.create({component:GmodalComponent, componentProps: { merchantcode: this.tomain.merchantcode,
                    password: this.tomain.password, action: 4, data: this.toIssue}});
                      
                   modalPage.onDidDismiss().then((data)=>{

                   });
                 return await modalPage.present();

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
                  header: 'Error',
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
              
              console.log("scan estamp Ex ERROR!: ", e);
             const alert = await this.alertCtrl.create({
                header: 'Request Ex Error',
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
                
          }).catch(async err=>{
            console.log("ERROR!: ", err);
              const alert = await  this.alertCtrl.create({
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
          
          // end region get user name

        } else {
          const alert = await this.alertCtrl.create({
            header: 'Invalid',
            message: 'Failed to get data. Please scan QR code again.',
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
      }
     }).catch(async err => {
         console.log('Error stamp', err);
        const alert = await this.alertCtrl.create({
             header: 'ScanQR Error',
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
     });
  }


  resetToIssue() {
    this.toIssue.mmappId = '';
    this.toIssue.name = '';
    this.toIssue.action = 1;
    this.toIssue.eStampNo = 1;
    this.toIssue.remark = '';
  }

}