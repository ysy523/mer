import { Component, ComponentFactoryResolver, OnInit, Output } from '@angular/core';
import {Platform, NavController, NavParams, AlertController, LoadingController ,ModalController } from '@ionic/angular';
import { Sql } from '../../services/Sql';
import * as myGlobals from '../../services/global'
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
// import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Share } from '@capacitor/share';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
})
export class ReceiptComponent implements OnInit {

  merchparams = {
  	merchantcode : '',
  	password : ''
  }
  pinStatus = '';
  isNewPin = false;
  isRedeemed = false;
  isAllowRedeem = false;
  isPinRedeemable = false;
  k1Msg = '';
  autoFillAccNo = "";
  pinparams:any = {
    taxinvno: '',
    merchantid: '',
    datetime : '',
    trxno : '',
    country : '',
    provider : '',
    hpno : '',
    cardno : '',
    benename: '',
    pinamount : '',
    keyinamount : '',
    servcharge : '',
    gst : '',
    gst_percent : '',
    colamount : '',
    moneypinum : '',
    address : '',
    purpose : '',
    pindeno : ''
  };
  pinStatusCode:any = 0;
  showpindeno = false;
  t2p_pinparams = {
    wallet_payment_id:'',
    payment_method: '',
    card_no: ''
  }

@Output() data :any
@Output() cardno:any
@Output() country:any
@Output() purposearray :any
@Output() purpose:any
@Output() pinarray:any
@Output() pindeno:any
@Output() isnewpin:any
@Output() flag :string
@Output() allow_redeem :any
@Output() autofill_accno:any

  constructor(
    public navCtrl: NavController, private iab: InAppBrowser,
    public loadingCtrl: LoadingController, private sql: Sql, public params: NavParams, private alertCtrl: AlertController,
    private platform: Platform,private route:ActivatedRoute, private modalCtrl:ModalController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params =>{
      this.isNewPin = this.isnewpin === "1"
      this.isAllowRedeem = this.allow_redeem === "1" ? true : false
      this.autoFillAccNo = this.autofill_accno
      this.merchparams.merchantcode = params['merchantcode']
      this.merchparams.password = params['password']
      let pinresponse = this.data


      if (this.flag ==="cekpin"){
      
         this.pinparams.taxinvno = pinresponse.tax_invoice_no
         this.pinparams.datetime = pinresponse.timestamp
         this.pinparams.cardno = this.cardno
         this.pinparams.trxno = pinresponse.trans_id
         this.pinparams.hpno = pinresponse.customer_hp
         this.pinparams.benename = pinresponse.bene_name
         if(pinresponse.mpin_value){
           this.pinparams.pinamount =  pinresponse.mpin_value.toFixed(2)
          
         }else{
           this.pinparams.pinamount =  pinresponse.pin_amount.toFixed(2)
         }
         if(pinresponse.keyin_amt){
           this.pinparams.keyinamount = pinresponse.keyin_amt.toFixed(2)
         }else{
           this.pinparams.keyinamount = ''
         }
         this.pinparams.servcharge = pinresponse.service_charge.toFixed(2)
         this.pinparams.colamount =  pinresponse.collect_amt.toFixed(2)
         
         this.pinparams.moneypinum = pinresponse.pin_number
         this.pinparams.address = pinresponse.address
   
         // this.pinparams.gst = pinresponse.gst;//this.round10(parseFloat(pinresponse.service_charge) * 6 / 106,-2).toFixed(2);
         // this.pinparams.gst_percent = pinresponse.gst_percent;
         this.pinparams.gst = (pinresponse.hasOwnProperty('gst')) ? pinresponse.gst.toFixed(2) : (new Date("2018-06-01") >= new Date(pinresponse.timestamp)) ? (0).toFixed(2) : this.round10(parseFloat(pinresponse.service_charge) * 6 / 106,-2).toFixed(2)
         this.pinparams.gst_percent = (pinresponse.hasOwnProperty('gst_percent')) ? pinresponse.gst_percent : (new Date("2018-06-01") >= new Date(pinresponse.timestamp)) ? '0%' : '6%';
   
         let newArray =this.purposearray.map(item => item.split(","));
         this.pinparams.purpose = this.getName(newArray,this.purpose)
         console.log ("pupose pinparanms",this.pinparams.purpose)
   
         this.pinparams.country = this.country;
   
         if(this.pindeno != 30){
           this.showpindeno = true;
           let pinarr = this.pinarray.map(item => item.split(","));
           this.pinparams.pindeno = this.getName(pinarr,this.pindeno)
         }else{
           this.showpindeno = false;
           this.pinparams.pindeno = '';
         }
   
         // t2p reponse params
         this.t2p_pinparams.wallet_payment_id = pinresponse.wallet_payment_trans_id ? pinresponse.wallet_payment_trans_id : '';
         this.t2p_pinparams.payment_method = pinresponse.payment_method ? pinresponse.payment_method : '';
         this.t2p_pinparams.card_no = pinresponse.t2p_cardno ? pinresponse.t2p_cardno : '';
           
      }

      if(this.flag ==="moneypin"){
        this.pinparams.taxinvno = pinresponse.data.body.tax_invoice_no
        this.pinparams.datetime = pinresponse.data.header.timestamp
        this.pinparams.cardno =  this.cardno;
        this.pinparams.trxno = pinresponse.data.body.trans_id
        this.pinparams.hpno = pinresponse.data.body.customer_hp
        this.pinparams.benename = pinresponse.data.body.bene_name
        if(pinresponse.data.body.mpin_value){
         
          this.pinparams.pinamount = pinresponse.data.body.mpin_value.toFixed(2)
        }else{
          this.pinparams.pinamount = pinresponse.data.body.pin_amount.toFixed(2)
        }
        if(pinresponse.data.body.keyin_amt){
          this.pinparams.keyinamount = pinresponse.data.body.keyin_amt.toFixed(2)
        }else{
          this.pinparams.keyinamount = ''
        }
        this.pinparams.servcharge = pinresponse.data.body.service_charge.toFixed(2)
        this.pinparams.colamount =  pinresponse.data.body.collect_amt.toFixed(2)
        this.pinparams.moneypinum = pinresponse.data.body.pin_number
        this.pinparams.address = pinresponse.data.body.address
  
        this.pinparams.gst = (pinresponse.data.body.hasOwnProperty('gst')) ? Number(pinresponse.data.body.gst.toFixed(2)) : (new Date(pinresponse.data.header.timestamp) >= new Date("2018-06-01 00:00:00.000")) ? (0).toFixed(2) : this.round10(parseFloat(pinresponse.data.body.service_charge) * 6 / 106,-2).toFixed(2);
        this.pinparams.gst_percent = (pinresponse.data.body.hasOwnProperty('gst_percent')) ? pinresponse.data.body.gst_percent : (new Date(pinresponse.data.header.timestamp) >= new Date("2018-06-01 00:00:00.000")) ? '0%' : '6%';
  
        this.pinparams.purpose = this.getName(this.purposearray,this.purpose)
        
  
        this.pinparams.country = this.country;
  
        if(this.pindeno != 30){
          this.showpindeno = true;
          this.pinparams.pindeno = this.getName(this.pinarray,this.pindeno)
        } else{
          this.showpindeno = false;
          this.pinparams.pindeno = '';
        }
  
        this.isPinRedeemable = (pinresponse.data.body.pin_redeemable === "1") ? true :false;
        this.k1Msg = pinresponse.data.body.k1_msg;
  
        // t2p reponse params
        this.t2p_pinparams.wallet_payment_id = pinresponse.data.body.wallet_payment_trans_id ? pinresponse.data.body.wallet_payment_trans_id : '';
        this.t2p_pinparams.payment_method = pinresponse.data.body.payment_method ? pinresponse.data.body.payment_method : '';
        this.t2p_pinparams.card_no = pinresponse.data.body.t2p_cardno ? pinresponse.data.body.t2p_cardno : '';
  
      }
      

    })
  }

  ngAfterViewInit(){

    if(!this.isNewPin) {
      this.checkForm();
    }

  }

 async subvoidForm(){
    let mainalert = await this.alertCtrl.create({
      header: 'Void Confirmation' ,
      message: 'Do you want to void this pin?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('void cancelled');
          }
        },
        {
          text: 'OK',
          handler: async() => {

          let loading = await this.loadingCtrl.create({
            message: 'Please wait...'
          });

	       await loading.present();

          let body = {
              merchant_code : this.merchparams.merchantcode,
              password : this.merchparams.password,
              merchant_trans_id : this.merchparams.merchantcode + new Date().valueOf(),
              void_trans_id : this.pinparams.trxno,
              appversion : myGlobals.version,
              platform: this.platform.platforms()[0],
              device: "ios"
            };
          //console.log(body)
          // let headers = new Headers({ 'Content-Type': 'application/json' });
          // let options = new RequestOptions({ headers: headers });

          const options:HttpOptions={
            url:myGlobals.url + '/VoidMoneyPin',
            data:body,
            method:'POST',
            connectTimeout:myGlobals.timeout,
            headers:{'Content-Type': 'application/json'}
      }



      Http.request(options).then(async(data:any)=>{

         try{
           await loading.dismiss();
          if(data.data.header.response_code == 0)
          {
             console.log ("data,data",data.data.header)
            let alert2 = await this.alertCtrl.create({
                header: 'Void',
                message: 'Void MoneyPin Status : ' + data.data.header.response_description,
                buttons: [
                  {
                      text: 'OK',
                      handler: () => {
                      }
                  }
                ]
            });

          await alert2.present();
          alert2.onDidDismiss().then(() => {
              this.checkForm(); // update status after voided
            });
          } else {
          const alert = await this.alertCtrl.create({
                 header: 'Void Error Code : ' + data.data.header.response_code ,
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

         }catch(e){
          await loading.dismiss();
          console.log("Void Ex ERROR!: ", e);
         const alert = await this.alertCtrl.create({
              header: 'Void Ex Error',
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

      }).catch(async err=>{

        await loading.dismiss();
        console.log("Void ERROR!: ", err);
       const alert =await this.alertCtrl.create({
            header: 'Void Error',
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
      ]
    });
   await mainalert.present();
  }


  async checkForm() {
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    let body = {
      merchant_code: this.merchparams.merchantcode,
      password: this.merchparams.password,
      merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
      pin_txn_id: this.pinparams.trxno,
      appversion: myGlobals.version,
      platform: this.platform.platforms[0],
      device: "ios"
    };
    console.log('CHECK PIN BODY: ' + JSON.stringify(body));
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });


    const options: HttpOptions = {
      url: myGlobals.url + '/CheckPinStatus',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

      try {
        await loading.dismiss();

        if (data.data.header.response_code == 0) {
          // if(
          // (this.pinparams.country == '1' && (data.body.pin_status == 'Valid' || data.body.pin_status == 'Pending'))
          // ||
          // (this.pinparams.country != '1' && data.body.pin_status == 'UN-PAID')
          // )
          this.pinStatus = data.data.body.pin_status;
          this.pinStatusCode = data.data.body.pin_status_code;

          //   if(data.body.pin_status == 'Valid' || data.body.pin_status == 'Pending' || data.body.pin_status == 'UN-PAID')
          //   {
          //     this.alertCtrl.create({
          //         title: 'Check Pin Status',
          //         message: 'Pin Status : '+data.body.pin_status,
          //         buttons: [
          //           {
          //               text: 'Void',
          //               handler: () => {
          //                 this.alertCtrl.create({
          //                 title: 'Void Pin',
          //                 message: 'Confirm to Void Pin',
          //                 buttons: [
          //                   {
          //                       text: 'Yes',
          //                       handler: () => {
          //                         this.subvoidForm()
          //                       }
          //                   },
          //                   {
          //                       text: 'No',
          //                       handler: () => {
          //                       }
          //                   }
          //                 ]
          //           }).present();
          //               }
          //           },
          //           {
          //               text: 'Back',
          //               handler: () => {
          //               }
          //           }
          //         ]
          //   }).present();
          // }else{
          //   this.alertCtrl.create({
          //         title: 'Check Pin Status',
          //         message: 'Pin Status : '+data.body.pin_status,
          //         buttons: [
          //           {
          //               text: 'OK',
          //               handler: () => {
          //               }
          //           }
          //         ]
          //   }).present();
          // }
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Check Pin Error Code : ' + data.data.header.response_code,
            message: data.data.header.response_description,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
            ]
          });

          await alert.present()
        }


      } catch (e) {
        await loading.dismiss();
        console.log("Check Pin Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Check Pin Ex Error',
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

      await loading.dismiss();
      console.log("Check Pin ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Check Pin Error',
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


 async redeemMoneyPinGetAccountNumber(){
    let alert = await this.alertCtrl.create({
      header: 'Redeem MoneyPin',
      message: this.k1Msg,
      inputs: [
        {
          name: 'accountno',
          placeholder: 'Account Number',
          value : this.autoFillAccNo,
          label : 'Account Number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Redeem',
          handler: data => {
            console.log(data);
            this.redeemMoneyPin(data.accountno);


          }
        }
      ]
    });
   await alert.present();
  }


  async redeemMoneyPin(accountno) {

    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    let body = {
      merchant_terminal_id: this.merchparams.merchantcode,
      merchant_code: this.merchparams.merchantcode,
      password: this.merchparams.password,
      mbb_app_version: myGlobals.version,
      merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
      customer_hp: this.pinparams.hpno,
      account_no: accountno,
      appversion: myGlobals.version,
      platform: this.platform.platforms[0],
      device: "ios",
      card_no: this.pinparams.cardno
    };
    //console.log(body)
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });


    const options: HttpOptions = {
      url: myGlobals.url + '/RedeemMoneyPin',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {
        await loading.dismiss();

        if (data.data.header.response_code == 0) {
          this.isRedeemed = true;
          let alert = await this.alertCtrl.create({
            header: 'Redeem Code : ' + data.data.header.response_code,
            message: data.data.header.response_description,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
            ]
          });
          await alert.present();

          //  alert.onDidDismiss(()=> {
          //   this.checkForm(); // check pin status
          // })

        } else {
          const alert = await this.alertCtrl.create({
            header: 'Redeem Error Code : ' + data.data.header.response_code,
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
        console.log("Redeem Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Redeem Ex Error',
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
      console.log("Redeem ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Redeem Error',
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

  getName(array,value){

  	let i = 0;
  	for(i=0;i<array.length;i++){
  		if(array[i][0] == value){
  			return array[i][1];
  		}
  	}
  	return ''
  }

  getpurName(array ,value){
  
      
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] === value.toString()) {
          return array[i][1];
        }
      }
      return '';
    
  }

  
  dismiss() {
    this.modalCtrl.dismiss()
  }

  
  decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  round10(value, exp) {
    return this.decimalAdjust('round', value, exp);
  };

  numberWithCommas(x:number) {

     

   
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    console.log (parts.join("."),'parts')
    return parts.join(".");
  }

  async getK4ReceiptCountry() {
    let loader = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loader.present();

    if (this.pinStatusCode == 2 || this.pinStatus == 'Redeemed' || this.pinStatus == 'Redeem') {
      // let body = {
      //   merchant_code: this.merchparams.merchantcode ,
      //   password: this.merchparams.password,
      //   merchant_trans_id : this.merchparams.merchantcode  + new Date().valueOf(),
      //   appversion : myGlobals.version,
      //   pin_issue_trans_id : this.pinparams.trxno,
      //   platform: this.platform._platforms[2],
      //   device: this.platform['_ua'].toString()
      // };

      //console.log(body);

      if (this.pinparams.country == '1') { // indonesia
        let body = {
          merchant_code: this.merchparams.merchantcode,
          password: this.merchparams.password,
          merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
          appversion: myGlobals.version,
          pin_issue_trans_id: this.pinparams.trxno,
          platform: this.platform.platforms()[0],
          device: "ios"
        };

        const options: HttpOptions = {
          url: myGlobals.url + '/GetK4Receipt',
          data: body,
          method: 'POST',
          connectTimeout: myGlobals.timeout,
          headers: { 'Content-Type': 'application/json' }
        }

        Http.request(options).then(async (data: any) => {
          try {
            await loader.dismiss();

            if (data.data.header.response_code == 0) {
              if (data.data.body) {
                let result = data.data.body;
                console.log(result);
                if (result.status == 2 || result.status == 7) { // redeemed
                  // open url in inappbrowser
                  if (result.receipt_url) {
                    let browser = this.iab.create(result.receipt_url, '_self');

                  } else {
                    const alert = await this.alertCtrl.create({
                      header: '',
                      message: 'Error get receipt. Please try again later.',
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
                } else {
                  const alert = await this.alertCtrl.create({
                    header: '',
                    message: result.header.response_description,
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
              }
            } else {
              const alert = await this.alertCtrl.create({
                header: 'Get Receipt Code : ' + data.data.header.response_code,
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

            await loader.dismiss();
            console.log("Get Receipt Ex ERROR!: ", e);
            const alert = await this.alertCtrl.create({
              header: 'Get Receipt Ex Error',
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

          await loader.dismiss();
          console.log("Get Receipt ERROR!: ", err);
          const alert = await this.alertCtrl.create({
            header: 'Get Receipt Error',
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
        let body = {
          merchant_code: this.merchparams.merchantcode,
          password: this.merchparams.password,
          merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
          appversion: myGlobals.version,
          pin_number: this.pinparams.moneypinum,
          platform: this.platform.platforms[0],
          device: "ios",
          hp: this.pinparams.hpno
        };

        const options: HttpOptions = {
          url: myGlobals.url + '/GetK4ReceiptOtherCountry',
          data: body,
          method: 'POST',
          connectTimeout: myGlobals.timeout,
          headers: { 'Content-Type': 'application/json' }
        }

        Http.request(options).then(async (data: any) => {
          try {
            await loader.dismiss();

            if (data.data.header.response_code == 0 && data.data.body.receipt_url) {
              let browser = this.iab.create(data.data.body.receipt_url, '_self');
            } else {
              const alert = await this.alertCtrl.create({
                header: 'Err Get Receipt',
                message: "Failed to get receipt. Receipt not found.",
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

           await loader.dismiss();
            console.log("Get Receipt Oth Ex ERROR!: ", e);
            const alert = await this.alertCtrl.create({
              header: 'Get Receipt Ex Error',
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

        }).catch(async (err) => {

          await loader.dismiss();
          console.log("Get Receipt Oth ERROR!: ", err);
          const alert = await this.alertCtrl.create({
            header: 'Get Receipt Error',
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
    } else { // pin not paid/redeem etc
      await loader.dismiss();
      console.log("Get Receipt ERROR!: Invalid pin");
      const alert = await this.alertCtrl.create({
        header: 'Get Receipt Error',
        message: "Invalid pin",
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

  inab() {
    let browser = this.iab.create('https://google.com','_self');
  }

  async shareTxn() {
    let share_data = '';

    if(this.pinparams) {
      share_data = "Mobile Money Intl. Sdn Bhd\nLot 23-24, 2nd Floor IOI BusinessPark,\n"; 
      share_data += "47100 Puchong, Selangor, Malaysia\nTel : 03-8073 0200\n";
      share_data += this.pinparams.taxinvno ? "\nInvoice Number: " + this.pinparams.taxinvno : '';
      share_data += this.merchparams.merchantcode ? "\nMerchant ID: " + this.merchparams.merchantcode : '';
      share_data += this.pinparams.datetime ? "\nDateTime: " + this.pinparams.datetime : "";
      share_data += this.pinparams.trxno ? "\nTransaction Number: " + this.pinparams.trxno : "";
      share_data += this.pinparams.hpno ? "\nHandphone Number: " + this.pinparams.hpno : "";
      share_data += this.pinparams.benename ? "\nBeneficiary Name: " + this.pinparams.benename : "";
      share_data += this.pinparams.pinamount ? "\nMoneyPin Amount in RM: " + this.pinparams.pinamount : "";
      share_data += this.pinparams.keyinamount ? "\nCollected Amount in RM: " + this.pinparams.keyinamount : "";
      share_data += this.pinparams.servcharge ? "\nService Charge in RM: " + this.pinparams.servcharge : "";
      share_data += this.pinparams.colamount ? "\nTotal Collected Amount in RM: " + this.pinparams.colamount : "";
      share_data += this.pinparams.moneypinum ? "\nMoneyPin Number: " + this.pinparams.moneypinum : "";
      share_data += this.pinparams.purpose ? "\nPurpose: " + this.pinparams.purpose : "";
      share_data += this.pinparams.pindeno ? "\nPin Type: " + this.pinparams.pindeno : "";
      share_data += this.pinparams.address ? "\nAddress: " + this.pinparams.address : "";
      share_data += "\n\nFor asistance pls sms: Help#Your question to 012-643 6123, \n016-446 6123 or 019-653 6123";
      share_data += "\n\nFrom Merchant App";
      share_data += "\n\n";
    } else {
       this.alertHelper('Error', 'Error sharing. Data not found.', null, null);
       return;
    }

    await Share.share({
      text:share_data
  })

    // this.socialSharing.share(share_data, null, null, null)
    // .then((res) => {
    //   console.log(res);
    //   console.log('Shared via SharePicker');
    // })
    // .catch((err) => {
    //   this.alertHelper('Error', 'Error sharing.', null, null);
    //   console.log('Was not shared via SharePicker: ' + err);
    // });
  }


 async alertHelper(header,body,eletofocus,inputorselect){
    // inputorselect 0 = input, 1 = select
    let alert = await this.alertCtrl.create({
      header: header,
      message: body,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            // let navTransition = alert.dismiss();

            // navTransition.then(() => {
            //   if(inputorselect == 0)
            //   {
            //           //eletofocus.setFocus();
            //   }else if(inputorselect == 1)
            //   {
            //     //eletofocus.open();
            //   }else{
            //     console.log('no idea')
            //   }
            // });

          }
        }
      ]
    });
   await alert.present();
  }




}