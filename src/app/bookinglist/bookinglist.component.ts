import { GmodalComponent } from './../gmodal/gmodal.component';
import { ActivatedRoute } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Component, OnInit } from '@angular/core';
import { Platform ,NavController, ModalController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { DatePicker } from '@ionic-native/date-picker';
import * as myGlobals from '../../services/global'
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { Share } from '@capacitor/share';


@Component({
  selector: 'app-bookinglist',
  templateUrl: './bookinglist.component.html',
  styleUrls: ['./bookinglist.component.scss'],
})
export class BookinglistComponent implements OnInit {

  txnCount = 0;
  lastid = 0;
  refreshlist = true;
  txnlog :any;
  merchparams = {
    merchantcode : '',
    password : ''
  }
  hidelist = false;
  showversion = '';
  pin_status = ''; // 13/6/2022 added for pin status checking 

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,public params: NavParams, 
    private platform: Platform, public route:ActivatedRoute) 
    { this.showversion = myGlobals.version;}

  ngOnInit() {
     console.log('ionViewDidLoad BookinglistPage');
     this.route.queryParams.subscribe(params=>{
      this.merchparams.merchantcode = params['merchantcode'];
      this.merchparams.password = params['password'];
      
     })


     this.eremitGetBookingList();
   

  }

  ngAfterViewInit(){
   
  }


  async eremitGetBookingList() {

    window.getSelection().removeAllRanges();
    this.refreshlist = false;
    let loader = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loader.present();

    let body = {
      merchant_code: this.merchparams.merchantcode ,
      password: this.merchparams.password,
      merchant_trans_id : this.merchparams.merchantcode  + new Date().valueOf(),
      appversion : myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios",
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });


    const options:HttpOptions={
          headers:{'Content-Type': 'application/json' },
          method:"POST",
          connectTimeout:myGlobals.timeout,
          url:myGlobals.url + '/ERemitGetBookingList',
          data:body

    }

    Http.request(options).then(async(data:any)=>{
         try{
         
          console.log("booking list ====",data)
             if(data.data.header.response_code == 0){

                if(data.data.body.result){
                  await loader.dismiss();
                   //this.txnlog = this.txnlog.concat(data.body.result);
                   this.txnlog = data.data.body.result;
                    // console.log(this.txnlog);
                   this.txnCount = this.txnlog.length;
                  if (this.txnlog.length<0){
                      this.hidelist = true;
                   }
                   else{
                    //console.log('rows item length < 0')
                    this.hidelist = false;
                    this.lastid = this.txnlog[this.txnlog.length-1].issue_idx;
  
                    // this.txnlog.forEach(function(item){
                    //   var d =  item['timestamp'].toString();
                    //   d = d.replace('T', ' ');
                    //   d = d.split('.');
                    //   d = d[0];
                    //   d = d.replace('.', '');
                    //   item['timestamp'] = d;
                    // });
                  }
                  this.refreshlist = true;
                }

             }else{
              const alert = await this.alertCtrl.create({
                header: 'Get Booking List Code : ' + data.data.header.response_code ,
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

         }catch(e){
           await loader.dismiss();
          console.log("Get BookingList Ex ERROR!: ", e);
         const alert = await this.alertCtrl.create({
            header: 'Get Booking List Ex Error',
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

     await loader.dismiss();
      console.log("Get Bookinglist ERROR!: ", err);
     const alert = await this.alertCtrl.create({
        header: 'Get Booking List Error',
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

  
  isEmpty(obj:any) {
    // console.log('isEmpty :',obj);
    if (!obj){
      return true;
    }
    if(obj.length>0){
      return true;
    }else{
      return false;
    }
    // for(let prop in obj) {
    //     if(obj.hasOwnProperty(prop))
    //         return false;
    // }
  }


  async shareTrxn(log:any) {
    // this.alertHelper('Hee', log['pin_number'], null, null);
    // this.alertHelper('Hee', log['ic_bank_name'], null, null);
    // this.alertHelper('Hee', log['ic_acc_number'], null, null);

    try {
      let share_data = '';

      if(log) {
        share_data = "eRemit Transaction" ;
        share_data += log['merchant_name'] ? "\nMerchant: " + log['merchant_name'] : '';
        share_data += this.merchparams.merchantcode ? "\nMerchant ID: " + this.merchparams.merchantcode : '';
        share_data += log['booking_id'] ?"\nBooking ID: " + log['booking_id']  : '';
        share_data += log['booking_paidtime'] ?"\nPayment DateTime: " + log['booking_paidtime']  : '';
        share_data += log['booking_datetime'] ?"\nBooking DateTime: " + log['booking_datetime']  : '';
        share_data += log['remit_ref_trans_id'] ?"\nTransaction ID.: " + log['remit_ref_trans_id']  : '';
        share_data += log['total_charge'] ?"\nAmount Collected: RM " + log['total_charge']  : '';
        share_data += log['remit_rm_amt'] ?"\nRemit Amount: RM " + log['remit_rm_amt']  : '';
        share_data += log['remit_ex_rate'] ?"\nExchange Rate: " + log['remit_ex_rate']  : '';
        share_data += log['remit_foreign_currency'] ?"\nForeign Currency: " + log['remit_foreign_currency']  : '';
        share_data += log['remit_foreign_amt'] ?"\nForeign Amount: " + log['remit_foreign_amt']  : '';
        share_data += log['service_charge'] ?"\nService Charge: RM " + log['service_charge']  : '';
        share_data += log['bene_name'] ?"\nBeneficiary Name: " + log['bene_name']  : '';
        share_data += log['bene_card_no'] ? "\nCard No.: " + log['bene_card_no']  : '';
        share_data += log['customer_name'] ? "\nCustomer Name: " + log['customer_name']   : '';
        share_data += log['customer_hp'] ?  "\nCustomer HP: " + log['customer_hp']   : '';
        share_data += log['country'] ? "\nCountry: " + log['country'] : '';
        share_data += log['provider'] ? "\nProvider: " + log['provider']: '';
        share_data += log['pin_number'] != '0' ? "\nPin No.: " + log['pin_number'] : '';
        share_data += log['ic_bank_name'] != '' ? "\nBank Name: " + log['ic_bank_name'] : '';
        share_data += log['ic_acc_number'] != 0 ? "\nAccount No.: " + log['ic_acc_number'] : '';
        share_data += "\n\n";
      } else {
        this.alertHelper('Error', 'Error sharing. Data not found.', null, null);
        return;
      }


      //this.alertHelper('Hee', share_data, null, null);
      console.log(share_data);

      // if (log && log.pin_number != 0) {
      //   share_data = "eRemit Transaction" + "\nMerchant: " + log['merchant_name'] +
      //   "\nMerchant ID: " + this.merchparams.merchantcode +
      //   "\nBooking ID: " + log['booking_id'] +
      //   "\nPayment DateTime: " + log['booking_paidtime'] +
      //   "\nBooking DateTime: " + log['booking_datetime'] +
      //   "\nTransaction No.: " + log['remit_ref_trans_id'] +
      //   "\nAmount Collected: " + log['total_charge'] +
      //   "\nRemit Amount: " + log['remit_rm_amt'] +
      //   "\nExchange Rate: " + log['remit_ex_rate'] +
      //   "\nForeign Currency: " + log['remit_foreign_currency'] +
      //   "\nForeign Amount: " + log['remit_foreign_amt'] +
      //   "\nService Charge: " + log['service_charge'] +
      //   "\nBeneficiary Name: " + log['bene_name'] +
      //   "\nCard No.: " + log['bene_card_no'] +
      //   "\nCustomer Name: " + log['customer_name'] +
      //   "\nCustomer HP: " + log['customer_hp'] +
      //   "\nCountry: " + log['country'] +
      //   "\nProvider: " + log['provider'] +
      //   // "\nBooking Expiry: " + log['booking_expiry'] +
      //   "\nPin No.: " + log['pin_number'] + "\n\n";
      //
      // } else if (log && log.ic_bank_name != 0) {
      //   share_data = "eRemit Transaction" +
      //   "\nMerchant: " + log['merchant_name'] +
      //   "\nMerchant ID: " + this.merchparams.merchantcode +
      //   "\nBooking ID: " + log['booking_id'] +
      //   "\nPayment DateTime: " + log['booking_paidtime'] +
      //   "\nBooking DateTime: " + log['booking_datetime'] +
      //   "\nTransaction No.: " + log['remit_ref_trans_id'] +
      //   "\nAmount Collected: " + log['total_charge'] +
      //   "\nRemit Amount: " + log['remit_rm_amt'] +
      //   "\nExchange Rate: " + log['remit_ex_rate'] +
      //   "\nForeign Currency: " + log['remit_foreign_currency'] +
      //   "\nForeign Amount: " + log['remit_foreign_amt'] +
      //   "\nService Charge: " + log['service_charge'] +
      //   "\nBeneficiary Name: " + log['bene_name'] +
      //   "\nCard No.: " + log['bene_card_no'] +
      //   "\nCustomer Name: " + log['customer_name'] +
      //   "\nCustomer HP: " + log['customer_hp'] +
      //   "\nCountry: " + log['country'] +
      //   "\nProvider: " + log['provider']+
      //   // "\nBooking Expiry: " + log['booking_expiry'] +
      //   "\nBank Name: " + log['ic_bank_name'] +
      //   "\nAccount No.: " + log['ic_acc_number'] + "\n\n";
      //
      // } else if (!log) {
      //   this.alertHelper('Error', 'Error sharing. Param missing.', null, null);
      //   return;
      // }

      if (share_data) {

        await Share.share({
            text:share_data
        })
        // this.socialSharing.share(share_data, null, null, null)
        //   .then((res) => {
        //     console.log(res);
        //     console.log('Shared via SharePicker');
        //   })
        //   .catch((err) => {
        //     this.alertHelper('Error', 'Error sharing.', null, null);
        //     console.log('Was not shared via SharePicker: ' + err);
        //   });
      } else {
        this.alertHelper('Error', 'Error sharing. Param missing[2].', null, null);
        return;
      }

    } catch(ex) {
      this.alertHelper('Catch', ex.message, null, null);
    }

  }

  async share(log:any){
    console.log('test');

    await Share.share({
       text: 'test share'
    })
    // this.socialSharing.share('Testing share', null, null, null)
    //   .then((res) => {
    //     console.log(res);
    //     console.log('Shared via SharePicker');
    //   })
    //   .catch((err) => {
    //     this.alertHelper('Error', 'Error sharing.', null, null);
    //     console.log('Was not shared via SharePicker: ' + err);
    //   });
  }


  //13/6/2022 added to check status on the history page
  async checkTrxStatus(transID:any, bookingID:any) {

    console.log("checktrxstatus",transID)
    if (!transID || transID == '') {
      this.alertHelper('Invalid', 'Internal err, please quit the page and try again.', null, null);
      return false;
    }
    else {
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();
      transID = transID.trim();

      let body = {
        merchant_code: this.merchparams.merchantcode,
        password: this.merchparams.password,
        merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios",
        check_trans_id: transID
      };
      //console.log(body)
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });

      const options: HttpOptions = {
        url: myGlobals.url + '/ERemitCheckStatus',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }


      Http.request(options).then(async (data: any) => {
        try {
          await loading.dismiss();
          // if(data.header.response_code == 0)
          // {

          console.log("check status ",data)

          this.pin_status = data.data.body.pin_status ? data.data.body.pin_status : '';

          if (this.pin_status != '') {
            let modalPage = await this.modalCtrl.create({
              component: GmodalComponent, componentProps:
                { action: 2, data: { 'pin_status': this.pin_status, 'booking_id': bookingID, 'trans_id': transID } }
            });
            // await modalPage.onDidDismiss()
            await modalPage.present();
          } else {
            const alert = await this.alertCtrl.create({
              header: '',
              message: 'Error occurred. Please exit the page and try again.',
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
          await loading.dismiss();
          console.log("List CheckStatus Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'CheckStatus Ex Error',
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

      }).catch(async (err: any) => {
        await loading.dismiss();
        console.log("CheckStatus ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'CheckStatus Error',
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
