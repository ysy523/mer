import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController,  ModalController } from '@ionic/angular';
import * as myGlobals from '../../services/global';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { PrepaidmodalComponent } from '../prepaidmodal/prepaidmodal.component';
import { ActivatedRoute, Router,NavigationExtras } from '@angular/router';

// import { PrepaidmodalPage }  from '../prepaidmodal/prepaidmodal';
@Component({
  selector: 'app-prepaidlist',
  templateUrl: './prepaidlist.component.html',
  styleUrls: ['./prepaidlist.component.scss'],
})
export class PrepaidlistComponent implements OnInit {

  tomain = {
  	merchantcode : '',
  	password : ''
  }
  showversion = ''
  dateNow: string;
  fromDt = '';
  toDt = '';
  refreshlist = true;
  txnlog = [];
  txnCount = 0;
  hidelist = false;
  searched = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl:AlertController, public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,private route:ActivatedRoute ) {
       
      this.route.queryParams.subscribe(params =>{

        this.showversion = myGlobals.version;
        this.tomain.merchantcode = params['merchantcode'];
        this.tomain.password = params['password'];
      })
      
    
     }

  ngOnInit() {
    console.log('ionViewDidLoad PrepaidlistPage');
    let dayNow = new Date();
    var firstDay = new Date(dayNow.getFullYear(), dayNow.getMonth(), dayNow.getDate());
    this.fromDt = this.yyyymmddFormatDate(firstDay);
    this.toDt = this.yyyymmddFormatDate(firstDay);
  }


  
  pop() {

    this.navCtrl.pop();
  }

  
  async getTxnLog() {
    this.txnlog = [];
    this.searched = true;
    window.getSelection().removeAllRanges();
    this.refreshlist = false;
    let loader = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loader.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      appversion: myGlobals.version,
      fromdate: this.fromDt,
      todate: this.toDt
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    console.log("getTxnLog",body);


    const options: HttpOptions = {
      url: myGlobals.url + '/GetSoftPinTransactionLog',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {

       await loader.dismiss();
        console.log("body",data)
        if (data.data.header.response_code == 0) {
          if (data.data.body.result) {

            this.txnlog = this.txnlog.concat(data.data.body.result);
            console.log(this.txnlog);
            this.txnCount = this.txnlog.length;
            if (this.txnlog.length < 0) {
              this.hidelist = true;
            }
            else {
              //console.log('rows item length < 0')
              this.hidelist = false;

              this.txnlog.forEach(function (item) {
                var d = item['timestamp'].toString();
                d = d.replace('T', ' ');
                d = d.split('.');
                d = d[0];
                d = d.replace('.', '');
                item['timestamp'] = d;
              });
            }
            this.refreshlist = true;

          }
        } else {

          const alert = await this.alertCtrl.create({
            header: 'Get Prepaid Transaction Log Code : ' + data.data.header.response_code,
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
        console.log("Get Prepaid Transaction Log Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Get Prepaid Transaction Log Ex Error',
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
      await loader.dismiss();
      console.log("Get Prepaid Transaction Log ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Get Prepaid Transaction Log  Error',
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

 async getTxnLogScroll(infiniteScroll){
    window.getSelection().removeAllRanges();
		this.refreshlist = false;
		let loader = await this.loadingCtrl.create({
			message: 'Please wait...'
		});

		//loader.present();

    let body = {
      merchant_code: this.tomain.merchantcode ,
      password: this.tomain.password,
      merchant_trans_id : this.tomain.merchantcode  + new Date().valueOf(),
      appversion : myGlobals.version,
      fromdate: this.fromDt,
      todate: this.toDt
    };

    

    const options:HttpOptions={
      url:myGlobals.url + '/GetSoftPinTransactionLog',
      data:body,
      method:'POST',
      connectTimeout:myGlobals.timeout,
      headers:{'Content-Type': 'application/json'}
}

   Http.request(options).then(async (data: any) => {

     try {
       await infiniteScroll.target.complete();
       if (data.data.header.response_code == 0) {
         if (data.data.body.result) {
           this.txnlog = this.txnlog.concat(data.data.body.result);
           console.log(this.txnlog);
           this.txnCount = this.txnlog.length;
           if (this.txnlog.length < 0) {
             this.hidelist = true;
           }
           else {
             //console.log('rows item length < 0')
             this.hidelist = false;

             this.txnlog.forEach(function (item) {
               var d = item['timestamp'].toString();
               d = d.replace('T', ' ');
               d = d.split('.');
               d = d[0];
               d = d.replace('.', '');
               item['timestamp'] = d;
             });
           }
           this.refreshlist = true;
         }
       } else {
         const alert = await this.alertCtrl.create({
           header: 'Get Prepaid Transaction Log Code : ' + data.data.header.response_code,
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
       console.log("Get Prepaid Transaction Log Ex ERROR!: ", e);
       const alert = await this.alertCtrl.create({
         header: 'Get Prepaid Transaction Log Ex Error',
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
     await loader.dismiss();
     console.log("Get Prepaid Transaction Log ERROR!: ", err);
     const alert = await this.alertCtrl.create({
       header: 'Get Prepaid Transaction Log  Error',
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


  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
		this.getTxnLogScroll(infiniteScroll);
  }

  async viewtxn(log) {
    let receiptModal = await this.modalCtrl.create({component:PrepaidmodalComponent, componentProps:{ from: 'reprint', data: log, merchantcode : this.tomain.merchantcode, password : this.tomain.password}});
     await receiptModal.present();
  }


  
  yyyymmddFormatDate(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth()+1; // getMonth() is zero-based
    var dd  = dateIn.getDate();
    var yyyymmdd = String(10000*yyyy + 100*mm + dd); // Leading zeros for mm and dd
    var yr = yyyymmdd.substr(0,4);
    var m = yyyymmdd.substr(4,2);
    var d = yyyymmdd.substr(6,2);
    return yr + '-' + m + '-' + d;
  }

  isEmpty(obj) {
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


}