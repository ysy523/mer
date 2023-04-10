import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform, NavController, ModalController, IonContent, NavParams, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import * as myGlobals from '../../services/global';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-kadar',
  templateUrl: './kadar.component.html',
  styleUrls: ['./kadar.component.scss'],
})
export class KadarComponent implements OnInit {
  @ViewChild(IonContent) list: IonContent;
  @ViewChild('country') country:any;

  tomain = {
    merchantcode: '',
    password: ''
  }
  loaded:boolean =false

  showversion = ''

  todo: any = {
    country: '',
    provider: '',
    bank: '',
    amount: '',
    camount: '',
    pindeno: '',
    currency: 1,
    ccurrency: 1,
    cardno: '',
    hpno: '',
    purpose: '',
    otherpurpose: '',
    sname: '',
    srelat: '',
    scountry: '',
    spassport: '',
    sdob: '',
    saddress: '',
    spurpose: '',
    sdocument: '',
    tac: '',
    merchant_charge: 0,
    card_type_flag: 0,
    pickup_method: -1 //added 4/3/2022 for flexible ongkos
  };

  todisplay = {
    benename: '',
    sendamount: '',
    currencyinquestion: '',
    exrate: '',
    pinamount: '',
    servicecharge: '',
    gst: '',
    gst_percent: '',
    totalamount: '',
    countrycurrency: '',
    selectedbenearray: '',
    keyinamount: '',
    msgattnsender: '',
    msgattnsender2: '',
  }

  ongkosCheck = {
    is_allowFlexibleOngkos: -1,
    mm_cajkedai: 0
  }

  countrylist = ''//'Indonesia|Bangladesh|Nepal|Philippines|Myanmar|Vietnam';
  providerlist = ''//'Indonesia,ID-MM,Mobile Money|Bangladesh,BD,IME|Bangladesh,BD-PRABHU,Prabhu|Nepal,NP,IME|Nepal,NP-IREMIT,IRemit|Nepal,NP-PRABHU,Prabhu|Philippines,PH,IME|Myanmar,MM,IME|Vietnam,VN,IME';


  isFlexIndo = false;
  pinType = 'Flexible';
  ratearray = [];
  bankarray = [];
  countryarray = [];
  providerarray = [];
  jsonstring: any;
  hdummyarray = '';
  banklist = ''//'Indonesia,000,000,Not Required|Bangladesh,000,000,Not Required|Nepal,000,000,Not Required|Philippines,000,000,Not Required|Myanmar,000,000,Not Required|Vietnam,VN,SACOM,SACOMBANK|Vietnam,VN,DONGAMONEY,DONG A MONEY';

  constructor(private platform: Platform, private alertCtrl: AlertController, 
              public navCtrl: NavController, private route: ActivatedRoute,private sanitizer: DomSanitizer) {
    this.route.queryParams.subscribe(params => {
      this.isFlexIndo = (params['flexindo'] === "0");
      this.tomain.merchantcode = params['merchantcode'];
      this.tomain.password = params['password'];
      this.jsonstring = JSON.parse(params['item']);

      this.countrylist = this.jsonstring.body.country_list;

      this.showversion = myGlobals.version;

      

    })
   
  }

  ngOnInit() {
    this.init();

    setTimeout(()=> {let dummy; this.getRate(dummy)}, 50);
  
  }

  // ngAfterViewInit(){
   
  // }

  
  
  init() {
    console.log("init----")
    //console.log(this.countrylist);
    this.countryarray = this.countrylist.split('|');
    this.todo.country = this.countryarray[0];


    // console.log("this.todo", this.todo.country)

  }



  getRate(refresher: any) {

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    const options: HttpOptions = {
      url: myGlobals.url + '/GetExchangeRate',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

    
      try {

        if (refresher) {
          await refresher.target.complete();
        }
        //console.log(data);
        if (data.data.header.response_code == 0) {
          let ratedummyarray: any;
          this.ratearray = data.data.body.rate_list.split('|');
          for (let x = 0; x < this.ratearray.length; x++) {
            ratedummyarray = this.ratearray[x];

            this.ratearray[x] = ratedummyarray.split(',');

          }
          //this.getBalance()
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Get Rate Error Code : ' + data.data.header.response_code,
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

        if (refresher) {
          await refresher.target.complete();
        }
        console.log("Rate Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Rate Ex Error',
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

      if (refresher) {
        await refresher.target.complete();
      }
      console.log("ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Rate Error',
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


  doRefresh(refresher: any) {
    //console.log('Begin async operation', refresher);
    this.getRate(refresher);
  }

  getUriEncodeUrl(category:string, name:string):SafeUrl{

      
    return 'https://mmwalletapp.ezeemoney.biz:4322/'+category+'/'+encodeURI(name)+'.png';
    
    // console.log("url",url)

    // return 'https://mmwalletapp.ezeemoney.biz:4322/'+category+'/'+encodeURI(name)+'.png'
 
    // return imgurl
       
  }
  // sanitize (url:string){
  //       return this.sanitizer.bypassSecurityTrustUrl('https://mmwalletapp.ezeemoney.biz:4322')
  // }

  onChange(val: any) {
    //console.log(this.isFlexIndo + ',' + this.todo.country + ',' + val)
    //console.log((this.isFlexIndo || val != 'Indonesia'))
    let i = 0;

    for (i = 0; i < this.providerarray.length; i++) {
      if (this.providerarray[i][0] == val) {
        this.todo.provider = this.providerarray[i][1];
        break;
      }
    }

    let y = 0;
    for (y = 0; y < this.bankarray.length; y++) {
      if (this.bankarray[y][0] == val && this.bankarray[y][1] == this.todo.provider) {
        this.todo.bank = this.bankarray[y][2];
        break;
      }
    }

    // get provider's card type flag
    for (let x = 0; x < this.providerarray.length; x++) {
      if (this.providerarray[x][0] == val) {
        this.todo.card_type_flag = this.providerarray[x][3];
        break;
      }
    }

    if (val != 'Indonesia') {
      //this.todo.hpno = '000'
      //this.requireHP = false;
      this.pinType = 'Flexible';
    } else {
      this.todo.currency = 1
      //this.todo.hpno = '';
      //this.requireHP = true
    }
    this.todo.cardno = "";
    this.todisplay.selectedbenearray = "";

    /* 1/3/2022 reset ongkos value when country changed */
    this.todo.merchant_charge = 0;
    this.ongkosCheck.is_allowFlexibleOngkos = -1;
    this.ongkosCheck.mm_cajkedai = 0;
  }

  // region navigation
  pop() {
    console.log ("okokokook")
    this.navCtrl.pop();
  }


}