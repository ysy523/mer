import { Component, Input, OnInit } from '@angular/core';
import { Platform,NavController, AlertController, LoadingController ,ModalController } from '@ionic/angular';
import * as myGlobals from '../../services/global'
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { Router ,NavigationExtras,ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-gmodal',
  templateUrl: './gmodal.component.html',
  styleUrls: ['./gmodal.component.scss'],
})
export class GmodalComponent implements OnInit {

    /*action in this page； 1- scanToPayMerchant, 2- check pin status in eremit history list screen, 3- redeem eVoucher, 4- issue/redeem eStamp, 5-cash withdraw */
    action = 1; // 1: collect from mmapp user
    mmpId = '';
    // action 1 to scan & 5 to withdraw
    toCollect = {
      name: '',
      amount: 0,
      mmappId: '',
      remark: ''
    }

     // action 2 <!-- 13/6/2022 added check pin status -->
  checkPinStatus = {
    pin_status: '',
    booking_id: 0,
    trans_id: ''
  }

     // action 3 
     toRedeem:any = {
      value: '',
      mmappId: '', // uuid
      action: 2, // redeem
      remark: '',
      username: '',
      merchant_id: '',
      unit: '',
      prod_code: ''
    }

    loader: any;
    tomain = {
      merchantcode : '',
      password : ''
    }

    showversion = '';
    selectedAction='Issue';
    actionList = [
      {'action_id': 1, 'action_name': 'Issue'},
      {'action_id': 2, 'action_name': 'Redeem'},
    ]

      // action 4 
   toIssue:any = {
    value:'',
    mmappId: '', // uuid
    action: 1, // 1- issue, 2- redeem
    remark: '',
    username: '',
    merchant_id: '',
    unit: ''
  }

  actionName = '';


  @Input() data :any;
  @Input() aciton:any;
  

  constructor(public navCtrl: NavController,public alertCtrl: AlertController, public modalCtrl:ModalController,
              public loadingCtrl: LoadingController,private platform: Platform ,public route:ActivatedRoute) { 

                this.route.queryParams.subscribe(async params =>{
                  this.showversion = myGlobals.version;
                  this.tomain.merchantcode = params['merchantcode'];
                  this.tomain.password = params['password'];

                 })
             
              }

  ngOnInit() {

    this.mmpId = this.data.mmappId ? this.data.mmappId : '';

     if(this.action == 1 || this.action == 5) {
       this.toCollect.name = this.data.name ? this.data.name : '';
       this.toCollect.mmappId =  this.data.mmappId ? this.data.mmappId : '';
       
     } else if(this.action == 2) {
       this.checkPinStatus.pin_status = this.data.pin_status ? this.data.pin_status : '';  //13/6/2022 added check pin status
       this.checkPinStatus.booking_id = this.data.booking_id ? this.data.booking_id : 0; //13/6/2022 added check pin status
       this.checkPinStatus.trans_id = this.data.trans_id ? this.data.trans_id : ''; //13/6/2022 added check pin status
 
     } else if(this.action == 3) {
       this.toRedeem.username = this.data.username ? this.data.username : '';
       this.toRedeem.mmappId = this.data.mmappId ? this.data.mmappId : '';
       this.toRedeem.merchant_id = this.data.merchant_id ? this.data.merchant_id : '';
       this.toRedeem.value = 0;
       this.toRedeem.unit = 'RM';
       this.toRedeem.remark = this.data.remark ? this.data.remark : ''; 
       this.toRedeem.prod_code = this.data.prod_code ? this.data.prod_code : ''; 
 
     } else if(this.action == 4) {
       this.toIssue.username = this.data.name ? this.data.name : '';
       this.toIssue.mmappId = this.data.mmappId ? this.data.mmappId : '';
       this.toIssue.value = this.data.value ? this.data.value : '0';
       this.toIssue.unit = 'stamp';
 
     } else {
           this.actionAlert();
     }

  }


 async actionAlert (){
  const alert = await this.alertCtrl.create({
    header: 'Error',
    message: 'Invalid action, please try again.',
    buttons: [
      {
        text: 'OK',
        handler:() => {
           this.dismiss();
        }
      }
    ]
  })
  
  await alert.present();

  }


  dismiss() {
    this.modalCtrl.dismiss();
  }


   /*action 1 or 5 */
   async scanToPay(action) {
    console.log('action', action);
    if(this.toCollect.mmappId == '') {
     const alert = await this.alertCtrl.create({
        header: '',
        message: 'Invalid info, please scan the QR code again.',
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

    } else if(this.toCollect.amount <= 0) {
     const alert = await this.alertCtrl.create({
        header: '',
        message: 'Invalid amount, please try again.',
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
    const calert = await this.alertCtrl.create({
        header: 'Confirmation',
        message: 'Submit now?',
        buttons: [
          {
              text: 'OK',
              handler: async() => {
 
              try {
                this.loader = await this.loadingCtrl.create();
                await this.loader.present();

                let body = {
                  merchant_code: this.tomain.merchantcode,
                  password: this.tomain.password,
                  merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
                  appversion : myGlobals.version,
                  platform:this.platform.platforms()[0],
                  device: "ios",
                  uuid:  this.toCollect.mmappId,
                  merchant_remark: this.toCollect.remark,
                  amount: this.toCollect.amount
                };

                let endPoint = '';
              
                if(action == 1) {
                  endPoint = '/ScanToPay';
                  this.actionName = 'Pay Merchant';
                } else if (action == 5) {
                  endPoint = '/ScanToWithdraw';
                  this.actionName = 'Cash withdraw';
                }

                const options:HttpOptions ={
                  url:myGlobals.url + endPoint,
                  data:body,
                  method:'POST',
                  connectTimeout:myGlobals.timeout,
                  headers:{'Content-Type': 'application/json'}
                    
                }

                // let headers = new Headers({ 'Content-Type': 'application/json' });
                // let options = new RequestOptions({ headers: headers });


                Http.request(options).then(async (data:any)=>{

                  await this.loader.dismiss();

                  if(data.data.header.response_code == 0)
                  {
                    const alert = await this.alertCtrl.create({
                      header:  this.actionName,
                      message: data.data.header.response_description,
                      buttons: [
                        {
                            text: 'OK',
                            handler: () => {
                              this.dismiss();
                            }
                        }
                      ]
                    })
                   await alert.present();

                  } else {
                   const alert = await this.alertCtrl.create({
                      header:  this.actionName,
                      message: data.data.header.response_description,
                      buttons: [
                        {
                          text: 'OK',
                          handler: () => {
                            this.dismiss();
                          }
                        }
                      ]
                    })
                   await alert.present();
                  }

                }).catch(async(err)=>{
                  await this.loader.dismiss();
                  console.log("ERROR!: ", err);
                 const alert = await this.alertCtrl.create({
                      header:  this.actionName + ' Error',
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

              
          
              } catch(e) {
                await this.loader.dismiss();
                console.log( this.actionName + " Ex ERROR!: ", e);
               const alert = await this.alertCtrl.create({
                  header:  this.actionName + ' Ex Error',
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
            }
          }
        ]
      })
     await calert.present();
    }
  }


    /*action 3 */
   async redeemVoucher(){
      console.log('toredeem', this.toRedeem);
      if(this.toRedeem.remark == '' || this.toRedeem.remark == null || 
        this.toRedeem.prod_code == '' || this.toRedeem.prod_code == null ||
        this.toRedeem.mmappId == '') {
      const alert = await this.alertCtrl.create({
          header: '',
          message: 'Invalid info, please scan the QR code again.',
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
        if (this.toRedeem.value <= 0) {
         const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Please insert valid value to redeem.',
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
        const calert = await this.alertCtrl.create({
            header: 'Confirmation',
            message: 'Redeem now?',
            buttons: [
              {
                  text: 'OK',
                  handler: async() => {
    
                  try {
                    this.loader = await this.loadingCtrl.create();
                    await this.loader.present();
  
                    let body = {
                      merchant_code: this.tomain.merchantcode,
                      password: this.tomain.password,
                      merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
                      appversion : myGlobals.version,
                      platform: this.platform.platforms()[0],
                      device: "ios",
                      uuid: this.toRedeem.mmappId,
                      merchant_remark: this.toRedeem.remark, // prod_name
                      points: this.toRedeem.value,
                      action_id: this.toRedeem.action,
                      prod_code: this.toRedeem.prod_code
  
                    };
  
                    // let headers = new Headers({ 'Content-Type': 'application/json' });
                    // let options = new RequestOptions({ headers: headers });

                    const options:HttpOptions={
                      url:myGlobals.url + '/RedeemEVoucher',
                      data:body,
                      method:'POST',
                      connectTimeout:myGlobals.timeout,
                      headers:{'Content-Type': 'application/json'}
                }

                Http.request(options).then (async(data:any)=>{

                  await this.loader.dismiss();

                  if(data.data.header.response_code == 0)
                  {
                   const alert = await this.alertCtrl.create({
                      header: 'Redeem KITA eVoucher',
                      message: data.data.header.response_description,
                      buttons: [
                        {
                            text: 'OK',
                            handler: () => {
                              this.dismiss();
                            }
                        }
                      ]
                    })
                   await alert.present();

                  } else {
                   const alert = await this.alertCtrl.create({
                      header: 'Redeem KITA eVoucher',
                      message: data.data.header.response_description,
                      buttons: [
                        {
                          text: 'OK',
                          handler: () => {
                            this.dismiss();
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
                      header: 'Redeem KITA eVoucher Error',
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
            
            
                  } catch(e) {
                    await this.loader.dismiss();
                    console.log("Redeem KITA eVoucher Ex ERROR!: ", e);
                   const alert =await this.alertCtrl.create({
                      header: 'Redeem KITA eVoucher Ex Error',
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
                }
              }
            ]
          })
         await calert.present();
        }
      }
    }

  
      /*action 4 */
 async issueRedeemStamp(){
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
    } else if(this.toIssue.value <= 0) {
     const alert =await this.alertCtrl.create({
        header: '',
        message: 'Please enter number of eStamp.',
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
      console.log('selectedAction', this.selectedAction);
      const alert = await this.alertCtrl.create({
        header: 'Confirmation',
        message: this.selectedAction + ' now?',
        buttons: [
          {
            text: 'OK',
            handler: async() => {
              try {
                if(this.toIssue.action && this.toIssue.value && this.toIssue.mmappId) {
                  this.loader = await this.loadingCtrl.create();
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
                    points: this.toIssue.value,
                    action_id: this.toIssue.action
                  };

                  let endPoint = '';
                  if(this.toIssue.action == 1){
                    endPoint = '/IssueEStamp';
                    this.selectedAction = 'Issue';
                  } else if(this.toIssue.action == 2){
                    endPoint = '/RedeemEStamp';
                    this.selectedAction = 'Redeem';
                  } 

                  const options:HttpOptions={
                    url:myGlobals.url + endPoint,
                    data:body,
                    method:'POST',
                    connectTimeout:myGlobals.timeout,
                    headers:{'Content-Type': 'application/json'}
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
                              this.dismiss();
                            }
                        }
                      ]
                    })
                    
                    await alert.present();

                  } else {
                   const alert =await this.alertCtrl.create({
                      header: this.selectedAction + ' e-Stamp: ' + data.data.header.response_code ,
                      message: data.data.header.response_description,
                      buttons: [
                        {
                          text: 'OK',
                          handler: () => {
                            this.dismiss();
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
                          this.dismiss();
                        }
                      }
                    ]
                  })
                  await alert.present();
                }
                  
              }).catch(async(err)=>{

               await this.loader.dismiss();
                console.log("ERROR!: ", err);
              const alert = await this.alertCtrl.create({
                    header: this.selectedAction + ' Error',
                    message: err,
                    buttons: [
                        {
                          text: 'OK',
                          handler: () => {
                            this.dismiss();
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
              } catch(ex) {
               const alert =await  this.alertCtrl.create({
                  header: this.selectedAction + ' Error',
                  message: ex,
                  buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                          this.dismiss();
                        }
                    }
                  ]
                })
                
                await alert.present();
              }
            }
          }
        ]
      })
     await alert.present();
    }
  }

  
  onActionChange(e:any) {
    console.log('event', e);
    console.log('actionlist', this.actionList);

    if(e == 1) {
      this.selectedAction = 'Issue';
      this.toIssue.action = 1;
    } 
    else if (e == 2) {
      this.selectedAction = 'Redeem';
      this.toIssue.action == 2;
    } 
    else {
      this.selectedAction = ''
    } 

    console.log('onAction', this.toIssue.action);
    console.log('onselectedAction', this.selectedAction);
  }
  

}