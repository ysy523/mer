import { ReceiptComponent } from './../receipt/receipt.component';
import { ActivatedRoute, Router,NavigationExtras } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Platform, NavController, ModalController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { Sql } from '../../services/Sql';
import * as myGlobals from '../../services/global'
import { DatePicker } from '@ionic-native/date-picker';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
})
export class LogComponent implements OnInit {

  constructor(public navCtrl: NavController, private sql: Sql, public modalCtrl: ModalController, public loadingCtrl: LoadingController,
    private alertCtrl: AlertController, public params: NavParams, private platform: Platform,private route:ActivatedRoute) { }



  merchparams = {
    merchantcode: '',
    password: ''
  }

  displayparams = {
    pinarray: '',
    purposearray: '',
    title: ''
  }

  searchbydate = true;
  placeholdertext = '';
  txnCount = 0;
  txnlog = []
  lastid = 0;
  hidelist = false;
  refreshlist = true;
  searchparams = {
    column: '',
    value: '',
    date: this.getDate(new Date()),
    filtertype: 0,
    filtertypename: '',
    filtervalue: '',
    fromdate: '',
    todate: ''
  }

  ngOnInit() {

      this.route.queryParams.subscribe(params =>{
          
        this.merchparams.merchantcode = params['merchantcode']
        this.merchparams.password = params['password']
        this.displayparams.pinarray = params['pinarray']
        this.displayparams.purposearray = params['purposearray']
        this.searchparams.column = params['column']
        this.searchparams.filtertype = params['filter_type'];
        this.searchparams.filtervalue = params['filter_value'];
        this.searchparams.fromdate = params['fromdate'];
        this.searchparams.todate = params['todate'];

     
        
      if (this.searchparams.column == '') {
        this.displayparams.title = 'All Log'
        this.placeholdertext = ''
      }
      else if (this.searchparams.column == 'hpno') {
        this.displayparams.title = 'Log By HP'
        this.placeholdertext = 'Search HP No keyword'
      }
      else if (this.searchparams.column == 'cardno') {
        this.displayparams.title = 'Log By Card No'
        this.placeholdertext = 'Search Card No keyword'
      }
      else if (this.searchparams.column == 'moneypintrxid') {
        this.displayparams.title = 'Log By Txn ID'
        this.placeholdertext = 'Search Txn ID keyword'
      }
      else {
        this.displayparams.title = 'Log'
      }
      this.getTxnLog();
  
      })
  
  
  
    

   }


  // ngAfterViewInit() {

  //   this.route.queryParams.subscribe(params =>{
        
  //     this.merchparams.merchantcode = params['merchantcode']
  //     this.merchparams.password = params['password']
  //     this.displayparams.pinarray = params['pinarray']
  //     this.displayparams.purposearray = params['purposearray']
  //     this.searchparams.column = params['column']
  //     this.searchparams.filtertype = params['filter_type'];
  //     this.searchparams.filtervalue = params['filter_value'];
  //     this.searchparams.fromdate = params['fromdate'];
  //     this.searchparams.todate = params['todate'];
  
  //   })



  //   if (this.searchparams.column == '') {
  //     this.displayparams.title = 'All Log'
  //     this.placeholdertext = ''
  //   }
  //   else if (this.searchparams.column == 'hpno') {
  //     this.displayparams.title = 'Log By HP'
  //     this.placeholdertext = 'Search HP No keyword'
  //   }
  //   else if (this.searchparams.column == 'cardno') {
  //     this.displayparams.title = 'Log By Card No'
  //     this.placeholdertext = 'Search Card No keyword'
  //   }
  //   else if (this.searchparams.column == 'moneypintrxid') {
  //     this.displayparams.title = 'Log By Txn ID'
  //     this.placeholdertext = 'Search Txn ID keyword'
  //   }
  //   else {
  //     this.displayparams.title = 'Log'
  //   }
  //   this.getTxnLog();

  // }


  async getTxnLog() {
    window.getSelection().removeAllRanges();
    this.refreshlist = false;
    let loader = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loader.present();

    let body = {
      merchant_code: this.merchparams.merchantcode,
      password: this.merchparams.password,
      merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
      appversion: myGlobals.version,
      lastidx: this.lastid,
      filter_type: this.searchparams.filtertype,
      filter_value: this.searchparams.filtervalue ? this.searchparams.filtervalue :'',
      fromdate: this.searchparams.fromdate,
      todate: this.searchparams.todate,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    console.log ("body missing",body)

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: myGlobals.url + '/GetTransactionLog',
      connectTimeout: myGlobals.timeout,
      method: "POST",
      data: body
    }

    Http.request(options).then(async (data: any) => {
       console.log ("get transaction log",data)

      try {
        await loader.dismiss();

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
              this.lastid = this.txnlog[this.txnlog.length - 1].issue_idx;

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
            header: 'Get Transaction Log Code : ' + data.data.header.response_code,
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
        console.log("Get Transaction Log Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Get Transaction Log Ex Error',
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
      console.log("Get Transaction Log ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Get Transaction Log  Error',
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


  async getTxnLogScroll(infiniteScroll) {
    window.getSelection().removeAllRanges();
    //this.refreshlist = false;
    let loader = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    //loader.present();

    let body = {
      merchant_code: this.merchparams.merchantcode,
      password: this.merchparams.password,
      merchant_trans_id: this.merchparams.merchantcode + new Date().valueOf(),
      appversion: myGlobals.version,
      lastidx: this.lastid,
      filter_type: this.searchparams.filtertype,
      filter_value: this.searchparams.filtervalue,
      fromdate: this.searchparams.fromdate,
      todate: this.searchparams.todate,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    console.log("log body ===",body);
    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: myGlobals.url + '/GetTransactionLog',
      connectTimeout: myGlobals.timeout,
      method: "POST",
      data: body
    }


    Http.request(options).then(async (data: any) => {

      try {
        await infiniteScroll.target.complete();
        console.log("transacntuon log",data)
        if (data.data.header.response_code == 0) {
          if (data.data.body.result) {

            this.txnlog = this.txnlog.concat(data.data.body.result);
            console.log(this.txnlog);
            this.txnCount = this.txnlog.length;

            if (this.txnlog.length < 0) {
              // this.hidelist = true;
            }
            else {
              //console.log('rows item length < 0')
              // this.hidelist = false;
              this.lastid = this.txnlog[this.txnlog.length - 1].issue_idx;

              // this.txnlog.forEach(function (item) {
              //   var d = item['timestamp'].toString();
              //   d = d.replace('T', ' ');
              //   d = d.split('.');
              //   d = d[0];
              //   d = d.replace('.', '');
              //   item['timestamp'] = d;
              // });
            }

            // this.refreshlist = true;

          }
        } else {

          const alert = await this.alertCtrl.create({
            header: 'Get Transaction Log Code : ' + data.data.header.response_code,
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
        infiniteScroll.target.complete();
        await loader.dismiss();
        console.log("Get Transaction Log Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Get Transaction Log Ex Error',
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
      console.log("Get Transaction Log ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Get Transaction Log  Error',
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

  searchdate() {
    DatePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: DatePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => this.searchparams.date = this.getDate(date),//console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
    )

  }


  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    this.getTxnLogScroll(infiniteScroll);
  }


  getDate(date: any) {
    let setdate = new Date(date);
    let dd = setdate.getDate();
    let mm = setdate.getMonth() + 1; //January is 0!

    let yyyy = setdate.getFullYear().toString();
    let ddstr: string;
    let mmstr: string;
    if (dd < 10) {
      ddstr = '0' + dd
    } else {
      ddstr = dd.toString();
    }
    if (mm < 10) {
      mmstr = '0' + mm
    } else {
      mmstr = mm.toString();
    }
    // setTimeout(() => {
    // 		this.getTxnLog();
    // 		}, 100);
    return yyyy + '-' + mmstr + '-' + ddstr;
  }

  evalColumn(data, key): any {
    if (data) {
      this.hidelist = true;
      return data[key];
    }
    else {
      this.hidelist = false;
    }
  }

  evalJSON(data, header, key): any {
    if (data) {
      this.hidelist = true;
      let jstring = JSON.parse(data)
      return jstring[header][key];
    }
    else {
      this.hidelist = false
    }
  }

  async viewreceipt(log: any) {

    console.log ("log viewreceipt",log)

    // let receiptModal = this.modalCtrl.create(ReceiptPage, { data: JSON.parse(log.server_response), isnewpin:'0', merchantcode : this.merchparams.merchantcode, password : this.merchparams.password, cardno: log.cardno, country: log.country, purposearray : this.displayparams.purposearray, purpose: log.purpose , pinarray : this.displayparams.pinarray, pindeno : log.pindeno});
    let receiptModal = await this.modalCtrl.create({ component:ReceiptComponent, componentProps: { data:log, isnewpin: '0', merchantcode: this.merchparams.merchantcode, password: this.merchparams.password, cardno: log.card_no, country: log.country, purposearray: this.displayparams.purposearray, purpose: log.purpose, pinarray: this.displayparams.pinarray, pindeno: log.pindeno ,flag:'cekpin' } });
    await receiptModal.present();
  }


  deserializejsonString( data :any ){

    let deserializedJsonString = JSON.stringify(data)
      .replace(/(\\n)/g, "")
      .replace(/(\\r)/g, "")
      .replace(/(\\t)/g, "")
      .replace(/(\\f)/g, "")
      .replace(/(\\b)/g, "")
      .replace(/(\")/g, "\"")
      .replace(/("{)/g, "{")
      .replace(/(}")/g, "}")
      .replace(/(\\)/g, "")
      .replace(/(\/)/g, "/");
    return deserializedJsonString;
  }



  isEmpty(obj) {
    // console.log('isEmpty :',obj);
    if (!obj) {
      return true;
    }
    if (obj.length > 0) {
      return true;
    } else {
      return false;
    }
    // for(let prop in obj) {
    //     if(obj.hasOwnProperty(prop))
    //         return false;
    // }
  }



}