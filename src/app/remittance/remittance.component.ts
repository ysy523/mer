
import { Component, OnInit, ViewChild,NgZone} from '@angular/core';
import { Platform, NavController, ModalController, IonContent, NavParams, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Sql } from '../../services/Sql';
import * as myGlobals from '../../services/global'
import * as SecureLS from 'secure-ls';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

//import { InAppBrowser } from '@ionic-native/in-app-browser';
// import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Share } from '@capacitor/share';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { DatePicker } from '@ionic-native/date-picker';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@awesome-cordova-plugins/media-capture/ngx';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { FormGroup, NgForm } from '@angular/forms';
import { loggingService } from './../../services/logging/logging.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { ReceiptComponent } from './../receipt/receipt.component';
import { GmodalComponent } from './../gmodal/gmodal.component';
//  import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { Browser} from '@capacitor/browser';


const win: any = window;

@Component({
  selector: 'app-remittance',
  templateUrl: './remittance.component.html',
  styleUrls: ['./remittance.component.scss'],
})
export class RemittanceComponent implements OnInit {

  @ViewChild(IonContent) list: IonContent;
  @ViewChild('country') country;
  @ViewChild('provider') provider;
  @ViewChild('bank') bank;
  @ViewChild('amount') amount;
  @ViewChild('camount') camount;
  @ViewChild('pindeno') pindeno;
  @ViewChild('cardno') cardno;
  @ViewChild('hpno') hpno;
  @ViewChild('purpose') purpose;
  @ViewChild('otherpurpose') otherpurpose;
  @ViewChild('sname') sname;
  @ViewChild('srelat') srelat;
  @ViewChild('scountry') scountry;
  @ViewChild('spassport') spassport;
  @ViewChild('sdob') sdob;
  @ViewChild('saddress') saddress;
  @ViewChild('spurpose') spurpose;
  @ViewChild('sdocument') sdocument;


  @ViewChild('fpxamount') fpxamount;
  @ViewChild('fpxbuyer_email') fpxbuyer_email;


  @ViewChild('voidtxnid') voidtxnid;
  @ViewChild('filtervalue') filtervalue;
  @ViewChild('t2pTac') t2pTac;



  appType = 'Sale';
  pageType = 'MainPage';
  pinType = 'Flexible';
  saleType = 'PreSale';
  isTacRequested = false;
  isFlexIndo = false;
  hidelist = false;
  hidecardlist = true;
  hidemsgattnsender = true;
  hidemsgattnsender2 = true;
  tomain = {
    merchantcode: '',
    password: ''
  }

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
    merchant_charge: '',
    card_type_flag: 0,
    pickup_method: -1 //added 4/3/2022 for flexible ongkos
  };

  toquery = {
    colname: '',
    colparam: ''
  }

  tovoid = {
    pintxnid: ''
  }

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

  tofpx = {
    fpxamount: '',
    fpxbuyer_email: '',
  }

  toreport = {
    remail: '',
    rproblem: '',
    rbank: '',
    rtopic: '',
    rtransno: '',
    rphoto: '',
    rmsg: '',
  }

  todoeremit = {
    booking_idx: '',
    trans_id: 0,
    res_msg: '',
    pymt_rm_amt: 0,
    remit_rm_amt: 0,
    remit_ex_rate: 0,
    remit_foreign_amt: 0,
    remit_foreign_currency: '',
    service_change: 0,
    bene_name: '',
    customer_name: '',
    customer_hp: '',
    country: '',
    provider: '',
    bank: '',
    booking_expiry: '',
    remit_ref_trans_id: 0,
    pin_number: '',
    check_trans_id: '',
    pin_status_ms: ''
  }

  bookingRes: any = [];
  receiptRes: any = [];
  senderhp = '';
  isPaid = false;

  cardlist = ''
  currencylist = 'Nepal,2,Rupee|Bangladesh,2,Taka|Philippines,2,Peso|Myanmar,2,Kyat|Vietnam,2,Dong';
  countrylist = ''//'Indonesia|Bangladesh|Nepal|Philippines|Myanmar|Vietnam';
  providerlist = ''//'Indonesia,ID-MM,Mobile Money|Bangladesh,BD,IME|Bangladesh,BD-PRABHU,Prabhu|Nepal,NP,IME|Nepal,NP-IREMIT,IRemit|Nepal,NP-PRABHU,Prabhu|Philippines,PH,IME|Myanmar,MM,IME|Vietnam,VN,IME';
  banklist = ''//'Indonesia,000,000,Not Required|Bangladesh,000,000,Not Required|Nepal,000,000,Not Required|Philippines,000,000,Not Required|Myanmar,000,000,Not Required|Vietnam,VN,SACOM,SACOMBANK|Vietnam,VN,DONGAMONEY,DONG A MONEY';
  purposelist = ''//'1,Utk Keluarga|2,Pendidikan|3,Perubatan|4,Simpanan|5,Pelaburan|6,Bayar Hutang|7,Berniaga|8,Melabur|9,Wakil Hantar|10,Lain-lain|11,Tidak Pasti';
  ratelist = ''//'Bangladesh,IME,18.070000|Bangladesh,Prabhu,18.150000|Myanmar,IME,295.000000|Nepal,IME,24.670000|Nepal,Prabhu,24.750000|Nepal,IRemit,24.800000|Philippines,IME,11.270000|Vietnam,IME,5124.000000|Indonesia,Mobile Money,RM1=Rp2985. Rp1Juta=RM335.00';
  pindenolist = ''//'1,RP 250K,10.00|2,RP 500K,10.00|3,RP 1Juta,10.00|14,RP 1.5Juta,10.00|4,RP 2Juta,12.00|5,RP 2.5Juta,13.00|6,RP 3Juta,14.00|7,RP 3.5Juta,15.00|8,RP 4Juta,16.00|15,RP 4.5Juta,16.00|9,RP 5Juta,16.00|10,RP 6Juta,18.00|11,RP 7Juta,18.00|12,RP 8Juta,20.00|13,RP 9Juta,20.00';
  balance = ''
  showversion = ''

  cardarray = [];
  hdummyarray = '';
  hsplitarray = [];
  countryarray = [];
  providerarray = [];
  bankarray = [];
  purposearray = [];
  ratearray = [];
  pinarray = [];
  currencyarray = [];
  requireHP = true;
  allow_redeem = "0";
  categoryarray =
    [{ value: 9, name: 'Aduan' }, { value: 2, name: 'Topup Akaun Merchant' },
    { value: 3, name: 'Pembayaran Bil' }, { value: 4, name: 'Prepaid Reload' },
    { value: 5, name: 'Kiriman Wang' }, { value: 7, name: 'Penukaran no HP' },
    { value: 8, name: 'Akaun disekat' }, { value: 22, name: 'Update personal info' },];
  reportBankarray = [{ name: 'Alliance' }, { name: 'AmBank' }, { name: 'CIMB' }, { name: 'Hong Leong' },
  { name: 'Maybank' }, { name: 'Public Bank' }, { name: 'RHB' }];
  topupBankList = [
    {
      bank: 'MBB',
      accountNo: '5123-4351-6944',
      image: "assets/icon/maybank.png"
    },
    // {
    //   bank:'CIMB',
    //   accountNo:'800-335-7361',
    //   image:"assets/icon/cimb.png"
    // },
    {
      bank: 'PBB',
      accountNo: '315-222-0412',
      image: "assets/icon/pbb.png"
    },
    {
      bank: 'RHB',
      accountNo: '21212500097429',
      image: "assets/icon/rhb.png"
    },
    {
      bank: 'HLB',
      accountNo: '1440-001-1097',
      image: "assets/icon/hlb.png"
    },
    {
      bank: 'AMB',
      accountNo: ' 2-3620-1200-3704',
      image: "assets/icon/ambank.png"
    },
    {
      bank: 'ABM',
      accountNo: '120880010037660',
      image: "assets/icon/alliance.png"
    }
  ]

  txnlog;
  jsonstring;
  topuplog = [];
  tosearch = {
    filtervalue: '',
    voidtxnid: ''
  }
  /*report problem*/
  reportprob = {
    attachement: '',
    email: '',
    category: 0,
    subject: '',
    message: '',
    bank: '',
    trans_id: '',
    phone: ''
  }
  selectedBank: any = [];
  maxDate: any;
  topup = {
    amount: 0,
    tempat: '',
    seqNo: '',
    attachement: '',
    tudate: this.yyyymmddFormatDate(new Date()),
    tutime: ''
  }

  /*menu page display*/
  action = '';
  dateNow: string;
  fromDt = '';
  toDt = '';

  semakTopUp = {
    fromDate: '',
    toDate: ''
  }
  semakTopUpLog = [];
  accountDetailsLog = [];

  cekAkaun = {
    fromDate: '',
    toDate: ''
  }
  cekAkaunLog = [];
  oldpin = '';
  newpin = '';
  cnewpin = '';

  msgTypeArray = [{ type: 1, name: 'General Messages' }, { type: 2, name: 'Transaction related' }, { type: 3, name: 'Merchant Earning' }];
  cekMsgType = 0;
  cekMsgFromDt = '';
  cekMsgToDt = '';

  tap2pay = {
    isPayByMobileMoney: false,
    tac: '',
    cardno: '',
    otp_req_trans_id: ''
  }
  isDisplayOTPMsg = true;
  OTPTimer = '';
  OTPReqMsg = '';
  myip = '';
  isGenerateOTP = false;

  paymentMethod = 'paybycash';

  topupwallet = {
    amount: 0,
    cardno: '',
    pin: ''
  }

  ongkosCheck = {
    is_allowFlexibleOngkos: -1,
    mm_cajkedai: 0
  }
  isAmountDisabled = false;
  isOngkosDisabled = false;

  loader:any;


  toTopup = {
    value:0,
    mmappId :'',  // aa_uuid
    action: 6,
    remark:'',
    username:'',
    merchant_id:'',
    prod_code:''

}


  constructor(public modalCtrl: ModalController, private sql: Sql, params: NavParams, private alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private platform: Platform,
    private iab: InAppBrowser, private camera: Camera,
    private actionSheetCtrl: ActionSheetController, private loggingProvider: loggingService,private zone: NgZone,
    private barcodeScanner: BarcodeScanner, private mediaCapture: MediaCapture, private file: File, public navCtrl: NavController, public router: Router, private route: ActivatedRoute) {
    ///JSON .parse (params['item'])
    this.route.queryParams.subscribe(params => {
      this.isFlexIndo = (params['flexindo'] === "0");
      this.tomain.merchantcode = params['merchantcode'];
      this.tomain.password = params['password'];
      this.jsonstring = JSON.parse(params['item']);
      this.pageType = params['pageType']; // to identify which funtion to show

      // console.log ("==json string===",JSON.stringify(this.jsonstring) )

      // this.pageType = params.data.pageType; // to identify which funtion to show
      this.countrylist = this.jsonstring.body.country_list;

      this.providerlist = this.jsonstring.body.provider_list;
      this.banklist = this.jsonstring.body.bank_list;
      this.purposelist = this.jsonstring.body.purpose_list;
      this.pindenolist = this.jsonstring.body.pin_deno_list;
      this.showversion = myGlobals.version;
      this.allow_redeem = this.jsonstring.body.allow_auto_redeem;
        })
    //this.isFlexIndo = (params.data.flexindo === "0");
    //	this.tomain.merchantcode = params.data.merchantcode;
    //	this.tomain.password = params.data.password;
    // this.jsonstring = params.data.item;

  }

  ngOnInit() {
    //console.log('Hello RemittancePage Page');
    // get max date (today's date)

    this.init();
    this.getip();
    setTimeout(() => this.getBalance(false), 0);
    setTimeout(() => { let dummy; this.getRate(dummy) }, 50);

    //get saved email address for report problem
    var ls = new SecureLS({ encodingType: 'aes' });
    if (ls.get('reportProbEmail')) {
      this.reportprob.email = ls.get('reportProbEmail');
    } else {
      this.reportprob.email = '';
    }

    if (ls.get('reportProbPhone')) {
      this.reportprob.phone = ls.get('reportProbPhone');
    } else {
      this.reportprob.phone = '';
    }

    this.getDateNow();


    let dayNow = new Date();
    var firstDay = new Date(dayNow.getFullYear(), dayNow.getMonth(), dayNow.getDate());
    this.maxDate = this.yyyymmddFormatDate(firstDay);
    this.fromDt = this.yyyymmddFormatDate(firstDay);
    this.toDt = this.yyyymmddFormatDate(firstDay);
    this.semakTopUp.toDate = this.yyyymmddFormatDate(firstDay);
    this.semakTopUp.fromDate = this.yyyymmddFormatDate(firstDay);
    this.cekAkaun.fromDate = this.yyyymmddFormatDate(firstDay);
    this.cekAkaun.toDate = this.yyyymmddFormatDate(firstDay);
    this.cekMsgFromDt = this.yyyymmddFormatDate(firstDay);
    this.cekMsgToDt = this.yyyymmddFormatDate(firstDay);

    // this.semakTopUp.toDate = this.maxDate;

    console.log('PageType: ' + this.pageType);
    // console.log('indo: ' + this.isFlexIndo);
    // console.log('Mcode: ' + this.tomain.merchantcode);
    // console.log('pass: ' + this.tomain.password);

    // // const index = this.viewCtrl.index;
    // // console.log(index);
  }



  getip() {

    const options: HttpOptions = {
      url: 'https://api.ipify.org?format=json',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then((response: any) => {

      this.myip = response.ip ? response.ip : '0';

    })
  }


  // region navigation
  pop() {
    console.log(this.pageType);
    console.log('act 1; ' + this.action);

    if (this.pageType == 'DoBankTopUp' && this.action == '') {
      this.navCtrl.pop();

    } else if (this.pageType == 'DoBankTopUp') {
      this.action = '';
      console.log('act 2; ' + this.action);

    } else {
      this.navCtrl.pop();
    }
  }


  async navigateTopUp(action) {
    this.action = action;
    if (action == 'bank') {

    } else if (action == 'fpx') {

    } else if (action == 'semak') {

    } else if (this.action == 'semakfpx') {
      let dummy;

      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.getTopUpLog(dummy, loading);
    }
  }
  // endregion

  //region main functions
  async checkBankTopUpLog() {
    if (await this.checkDateInputValidation(this.semakTopUp.fromDate, this.semakTopUp.toDate) == true) {

      let loader = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loader.present();

      console.log('before');
      console.log(this.semakTopUp.fromDate);
      console.log(this.semakTopUp.toDate);

      if (!this.semakTopUp.toDate) {
        this.semakTopUp.toDate = this.maxDate;
        // this.semakTopUp.toDate = '2013-06-14';
      }

      if (!this.semakTopUp.fromDate) {
        this.semakTopUp.fromDate = this.maxDate;
        // this.semakTopUp.fromDate =  '2013-06-14';
      }

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        fromdate: this.semakTopUp.fromDate,
        todate: this.semakTopUp.toDate,
        platform: this.platform.platforms()[0],
        device: "ios"
      };
      // console.log("check bank",body);
      // let headers = new Headers({'Content-Type': 'application/json'});
      // let options = new RequestOptions({headers: headers});

      const options: HttpOptions = {
        url: myGlobals.url + '/GetBankTopUpLog',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }


      Http.request(options).then(async (data: any) => {
        try {
          await loader.dismiss();
          console.log(data)
          //console.log(data);
          if (data.data.header.response_code == 0) {
            if (data.data.body.result) {
              // this.semakTopUpLog = this.semakTopUpLog.concat(data.body.result);
              this.semakTopUpLog = data.data.body.result;
              console.log(this.semakTopUpLog);
              if (this.semakTopUpLog.length < 0) {
                // this.hidelist = true;
              }
              else {
                //console.log('rows item length < 0')
                // this.hidelist = false
                //this.lastid = this.txnlog[this.txnlog.length-1].issue_idx
              }
              //this.refreshlist = true;
            } else {
              this.semakTopUpLog = null;
            }
          } else {
            const alert = await this.alertCtrl.create({
              header: 'Get Bank TopUp Log Code : ' + data.data.header.response_code,
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
          await loader.dismiss();
          console.log("Get Bank TopUp Log Ex ERROR!: ", e);
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
          await alert.present();

        }

      }).catch(async err => {
        await loader.dismiss();
        console.log("Get Transaction Log ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'Get Transaction Log Error',
          message: err.statusText,
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



  async checkAkaunHistory() {
    if (!this.cekAkaun.toDate) {
      this.cekAkaun.toDate = this.maxDate;
    }

    if (!this.cekAkaun.fromDate) {
      this.cekAkaun.fromDate = this.maxDate;
    }

    if (await this.checkDateInputValidation(this.cekAkaun.fromDate, this.cekAkaun.toDate, 3) == true) {

      let loader = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loader.present();

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        fromdate: this.cekAkaun.fromDate,
        todate: this.cekAkaun.toDate,
        platform: this.platform.platforms()[0],
        device: "ios"
      };
      console.log(body);

      const options: HttpOptions = {
        url: myGlobals.url + '/GetAccountTransactionDetails',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }

      Http.request(options).then(async (data: any) => {

        try {


          //console.log(data);
          await loader.dismiss();
          if (data.data.header.response_code == 0) {
            if (data.data.body && data.data.body.result) {
              this.cekAkaunLog = data.data.body.result;
              console.log(this.cekAkaunLog);
              if (this.cekAkaunLog.length > 0) {
                // this.hidelist = true;


                // //this.cekAkaunLog.this.yyyymmddFormatDate();
                // for (var i=1; i<= this.cekAkaunLog.length; i++) {
                //   this.cekAkaunLog[i]['Trans_Datetime'] = new Date(this.cekAkaunLog[i]['Trans_Datetime']);
                //   console.log('DATE: ' + this.cekAkaunLog[i]['Trans_Datetime']);
                // }

                this.cekAkaunLog.forEach(function (item) {
                  var d = item['Trans_Datetime'].toString();
                  d = d.replace('T', ' ');
                  d = d.split('.');
                  d = d[0];
                  d = d.replace('.', '');
                  item['Trans_Datetime'] = d;
                });
              }
              else {
                //console.log('rows item length < 0')
                // this.hidelist = false
                //this.lastid = this.txnlog[this.txnlog.length-1].issue_idx
              }
              //this.refreshlist = true;
            } else {
              this.cekAkaunLog = null;
            }
          } else {
            const alert = await this.alertCtrl.create({
              header: 'Get Akaun Log Code : ' + data.data.header.response_code,
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
          await loader.dismiss();
          console.log("Get Akaun Log Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'Get Akaun Log Ex Error',
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
        console.log("Get Akaun Log ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'Get Akaun Log Error',
          message: err.statusText,
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


  saleReset(form: NgForm) {
    //form.reset();
    this.active = false;
    setTimeout(() => this.active = true, 0);
    this.todo.country = this.countryarray[0];
    /*   	if(this.todo.country != 'Indonesia'){ */
    /*     	this.todo.hpno = '000' */
    /*     	this.requireHP = false; */
    /*     }else{ */
    /*     	this.todo.hpno = ''; */
    /*     	this.requireHP = true */
    /*     } */

    //this.dropdownCurrency(this.countryarray[0]);
    this.todo.hpno = '';
    this.todo.provider = this.providerarray[0][1];
    this.todo.bank = this.bankarray[0][2];
    this.todo.purpose = '';
    this.todo.otherpurpose = '';
    this.todo.amount = '';
    this.todo.camount = '';
    this.todo.pindeno = '';
    this.todo.cardno = '';
    this.todo.currency = 1
    this.todo.ccurrency = 1
    this.todo.sname = ''
    this.todo.srelat = ''
    this.todo.scountry = ''
    this.todo.spassport = ''
    this.todo.sdob = ''
    this.todo.saddress = ''
    this.todo.spurpose = ''
    this.todo.sdocument = ''
    this.todo.tac = ''
    this.todo.merchant_charge = 0;
    this.isTacRequested = false;
    this.hidecardlist = true;
    this.hidemsgattnsender = true;
    this.pinType = 'Flexible';
    this.isAmountDisabled = false;
    this.isOngkosDisabled = false;
    this.ongkosCheck.is_allowFlexibleOngkos = -1;
    this.ongkosCheck.mm_cajkedai = 0;
  }



  // 18/5/2022 flexi ongkos modification
  async subsaleForm(form) {
    window.getSelection().removeAllRanges();

    if (!form.controls.country.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Country', this.country, 1)
      return;
    }
    if (!form.controls.provider.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Provider', this.provider, 1)
      return;
    }
    if (!form.controls.bank.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Bank', this.bank, 1)
      return;
    }
    if ((this.pinType == 'Flexible')) {
      if (!form.controls.amount.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Amount', this.amount, 0)
        return;
      } else {
        if (parseFloat(this.todo.amount) >= 3001 && this.todo.currency == 1) {
          if (this.todo.camount != this.todo.amount) {
            this.alertHelper('Invalid Sale Details', 'Please make sure the Amount is the same as Amount Confirmation', this.camount, 0)
            return;
          }
        } else {
        }
      }

      if (!this.todo.merchant_charge || this.todo.merchant_charge <= 0) {
        if (this.todo.country == 'Indonesia' && this.pinType == 'Flexible') {
          this.alertHelper('Invalid Charge(Ongkos)', 'Please enter valid charge', null, 0);
          return;
        }
      }

      /*4/3/2022 added checking ongkos > 0 and <=50  */
      if (this.pinType == 'Flexible' && this.todo.country != 'Indonesia') {
        if (this.ongkosCheck.mm_cajkedai) {
          if (!this.todo.merchant_charge || (this.todo.merchant_charge < this.ongkosCheck.mm_cajkedai && this.todo.merchant_charge > 50)) {
            this.alertHelper('Invalid Charge(Ongkos)', 'Charge(Ongkos) must be at the range of RM ' +
              this.ongkosCheck.mm_cajkedai.toString() + ' AND RM 50.', null, 0);
            return;
          }

        } else {
          this.alertHelper('Error', 'Invalid ongkos, please Semak ongkos.', null, 0);
          return;
        }
      }

    } else {
      if (!form.controls.pindeno.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Select Valid Amount', this.pindeno, 1)
        return;
      }
    }
    /*    	if(!form.controls.cardno.valid){ */
    /*    		this.alertHelper('Invalid Sale Details','Please Enter Valid Card Number', this.cardno, 0) */
    /*    		return; */
    /*    	} */
    if (this.todo.cardno == "") {
      if (this.hidecardlist) {
        this.click2();
        return;
      }
      if (this.todisplay.selectedbenearray.length == 0) {
        if (this.checkIfCardByCountryExist()) {
          this.alertHelper('Invalid Sale Details', 'Please Select A Beneficiary', this.cardno, 0)
        } else {
          this.alertHelper('Invalid Sale Details', 'No Beneficiary for Country : ' + this.todo.country, this.cardno, 0)
        }
        return;
      }
      this.alertHelper('Invalid Sale Details', 'Please Select A Beneficiary', this.cardno, 0)
      return;
    }
    if (!form.controls.hpno.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Enter Valid HP Number', this.hpno, 0)
      return;
    }
    if (!form.controls.purpose.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Purpose', this.purpose, 1)
      return;
    }
    if (this.todo.purpose == '10') {
      if (!form.controls.otherpurpose.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Other Purpose', this.otherpurpose, 0)
        return;
      }
    }
    if (this.todo.purpose == '9') {
      if (!form.controls.sname.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Name', this.sname, 0)
        return;
      }
      if (!form.controls.srelat.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Relationship', this.srelat, 0)
        return;
      }
      if (!form.controls.scountry.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Country', this.sname, 0)
        return;
      }
      if (!form.controls.spassport.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Passport', this.spassport, 0)
        return;
      }
      if (!form.controls.sdob.valid || !this.isValidDate(form.controls.sdob.value)) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Date Of Birth', this.sdob, 0)
        return;
      }
      if (!form.controls.saddress.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Address', this.saddress, 0)
        return;
      }
      if (!form.controls.spurpose.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Purpose', this.spurpose, 0)
        return;
      }
      if (!form.controls.sdocument.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Select if Sender Able to Provide Document', this.sdocument, 1)
        return;
      }
    }

    //console.log(form.value)


    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    /* let body = {
        merchant_code : this.tomain.merchantcode,
        password : this.tomain.password,
        merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
        pin_amount : (this.isFlexIndo || this.todo.country != 'Indonesia') ? this.todo.amount : 0,
        card_no : this.todo.cardno,
        customer_hp : this.todo.hpno,
        pin_denomination_id : (this.isFlexIndo || this.todo.country != 'Indonesia') ? 30 : this.todo.pindeno,
        remittance_purpose_id : this.todo.purpose,
        country : this.todo.country,
        provider : this.todo.provider,
        currency_type : (this.isFlexIndo || this.todo.country != 'Indonesia') ? this.todo.currency : 1,
        appversion : myGlobals.version
      }; */

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      pin_amount: (this.pinType == 'Flexible') ? this.todo.amount : 0,
      card_no: this.todo.cardno,
      customer_hp: this.todo.hpno,
      pin_denomination_id: (this.pinType == 'Flexible') ? 30 : this.todo.pindeno,
      remittance_purpose_id: this.todo.purpose,
      country: this.todo.country,
      provider: this.todo.provider,
      currency_type: (this.pinType == 'Flexible') ? this.todo.currency : 1,
      appversion: myGlobals.version,
      merchant_input_charge: this.todo.merchant_charge,
      platform: this.platform.platforms()[0],
      device: "ios"

    };

    //console.log(body)
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    //   let options = new RequestOptions({ headers: headers });


    const options: HttpOptions = {
      url: myGlobals.url + '/IssueMoneyPinPreChecking',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {

        await loading.dismiss();

        console.log(data);
        if (data.data.header.response_code == 0) {
          if (data.data.header.response_description.toUpperCase() != "OK" && data.data.header.response_description != "") {
            this.hidemsgattnsender2 = false;
            this.todisplay.msgattnsender2 = data.data.header.response_description;
            const alert = await this.alertCtrl.create({
              header: 'Attention : ',
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
            this.hidemsgattnsender2 = true;
            this.todisplay.msgattnsender2 = "";
          }

          this.todisplay.benename = data.data.body.bene_name
          this.todisplay.sendamount = data.data.body.sending_amount
          this.todisplay.currencyinquestion = data.data.body.sending_currency
          this.todisplay.exrate = data.data.body.ex_rate
          this.todisplay.pinamount = data.data.body.mpin_value.toFixed(2)
          this.todisplay.keyinamount = data.data.body.keyin_amt.toFixed(2)
          this.todisplay.servicecharge = data.data.body.service_charge.toFixed(2)
          this.todisplay.gst = (data.data.body.hasOwnProperty('gst')) ? data.data.body.gst.toFixed(2) : (new Date("2018-06-01") >= new Date(data.data.header.timestamp)) ? (0).toFixed(2) : this.round10(parseFloat(data.data.body.service_charge) * 6 / 106, -2).toFixed(2); //(0).toFixed(2);//this.round10(parseFloat(data.body.service_charge) * 6 / 106,-2).toFixed(2);
          this.todisplay.gst_percent = (data.data.body.hasOwnProperty('gst_percent')) ? data.data.body.gst_percent : (new Date("2018-06-01") >= new Date(data.data.header.timestamp)) ? '0%' : '6%';
          this.todisplay.totalamount = data.data.body.collect_amt.toFixed(2)
          this.saleType = 'AfterSale';
          this.todo.tac = '';
          this.list.scrollToTop()
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Sale Precheck Error Code : ' + data.data.header.response_code,
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
        loading.dismiss();
        console.log("Sale Precheck Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Sale Precheck Ex Error',
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
      console.log("ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Sale Precheck Error',
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



    //this.presentReceiptModal();
    //this.navCtrl.push(ReceiptPage);
    /*     let presaleresp = JSON.parse('{"header":{"timestamp":"2016-11-14 16:09:52","response_code":"0","response_description":"OK"},"body":{"merchant_trans_id":"3922711520161114160949441","trans_id":"79292776","service_charge":"12.00","sending_currency":"BDT","sending_amount":"197.45","myr_amount":"11.00","ex_rate":"17.950000","bene_name":"ripon","collect_amt":"23.04","bank_charge":"0.04"}}'); */
    /*     this.todisplay.benename = presaleresp.body.bene_name */
    /*     this.todisplay.sendamount = presaleresp.body.sending_amount */
    /*     this.todisplay.currencyinquestion = presaleresp.body.sending_currency */
    /* 	this.todisplay.exrate = presaleresp.body.ex_rate */
    /* 	this.todisplay.pinamount = presaleresp.body.myr_amount */
    /* 	this.todisplay.servicecharge = presaleresp.body.service_charge */
    /* 	this.todisplay.gst = this.round10(parseFloat(presaleresp.body.service_charge) * 6 / 106,-2).toFixed(2); */
    /* 	this.todisplay.totalamount = presaleresp.body.collect_amt */
    /* 	this.saleType = 'AfterSale'; */
  }


  async saleProcess(form) {
    //console.log(form.value);
    window.getSelection().removeAllRanges();

    // if(this.todo.tac == '') {
    //   this.alertCtrl.create({
    //     title: 'Invalid input',
    //     message: 'Please insert PIN.',
    //     buttons: [
    //       {
    //           text: 'OK',
    //           handler: () => {
    //           }
    //       }
    //     ]
    //   }).present();
    //   return;
    // }

    // if(this.tap2pay.isPayByMobileMoney) { 
    // if(this.paymentMethod == 'paybymm') { // otp generated from merchant app
    //    /* INPUTS VALIDATION BEGIN */
    //   if(this.tap2pay.cardno == '' && this.isGenerateOTP) {
    //     this.alertCtrl.create({
    //       title: 'Invalid input',
    //       message: 'Please key in card no.',
    //       buttons: [
    //         {
    //             text: 'OK',
    //             handler: () => {
    //             }
    //         }
    //       ]
    //     }).present();
    //     return;
    //   } else if(this.tap2pay.tac == '') {
    //     this.alertCtrl.create({
    //       title: 'Invalid input',
    //       message: 'Please key in Approval code.',
    //       buttons: [
    //         {
    //             text: 'OK',
    //             handler: () => {
    //             }
    //         }
    //       ]
    //     }).present();
    //     return;
    //   }
    //   /* INPUTS VALIDATION END */

    //   /*START T2P ISSUE PIN */
    //   let loading = this.loadingCtrl.create({
    //     content: 'Please wait...'
    //   });

    //   loading.present();

    //   let body = {
    //     merchant_code : this.tomain.merchantcode,
    //     password : this.tomain.password,
    //     merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
    //     pin_amount : (this.pinType =='Flexible') ? this.todo.amount : 0,
    //     card_no : this.todo.cardno,
    //     customer_hp : this.todo.hpno,
    //     pin_denomination_id : (this.pinType =='Flexible') ? 30 : this.todo.pindeno,
    //     remittance_purpose_id : this.todo.purpose,
    //     country : this.todo.country,
    //     provider : this.todo.provider,
    //     currency_type : (this.pinType =='Flexible') ? this.todo.currency : 1,
    //     bank : this.todo.bank,
    //     purpose_sender_name : (this.todo.purpose == '9') ? this.todo.sname : ' ',
    //     purpose_sender_relationship : (this.todo.purpose == '9') ? this.todo.srelat : ' ',
    //     purpose_sender_country : (this.todo.purpose == '9') ? this.todo.scountry : ' ',
    //     purpose_sender_passport : (this.todo.purpose == '9') ? this.todo.spassport : ' ',
    //     purpose_sender_dob : (this.todo.purpose == '9') ? this.todo.sdob : '1970-01-01',
    //     purpose_sender_address : (this.todo.purpose == '9') ? this.todo.saddress : ' ',
    //     purpose_sender_purpose : (this.todo.purpose == '9') ? this.todo.spurpose : ' ',
    //     purpose_sender_document : (this.todo.purpose == '9') ? this.todo.sdocument : '0',
    //     purpose_sender_otherpurpose : (this.todo.purpose == '10') ? this.todo.otherpurpose : ' ',
    //     tac : this.todo.tac,
    //     appversion : myGlobals.version,
    //     merchant_input_charge: this.todo.merchant_charge,
    //     platform: this.platform._platforms[2],
    //     device: this.platform['_ua'].toString(),
    //     t2p_card_no: this.tap2pay.cardno ? this.tap2pay.cardno : '',
    //     t2p_txn_amount: (this.pinType =='Flexible') ? this.todo.amount : 0,
    //     t2p_OTP: this.tap2pay.tac,
    //     t2p_ip: this.myip ? this.myip : '',
    //     t2p_txn_type: '2',
    //     t2p_description: 'MerchantAppIssuePin',
    //     t2p_description2: '',
    //     t2p_system_id: '3',
    //     t2p_otp_ref_txn_id: this.tap2pay.otp_req_trans_id ? this.tap2pay.otp_req_trans_id : 0
    //   };
    //   //console.log(body)
    //   let headers = new Headers({ 'Content-Type': 'application/json' });
    //   let options = new RequestOptions({ headers: headers });

    //   this.http
    //       .post(myGlobals.url + '/IssueMoneyPinT2P', body, options)
    //       .timeout(myGlobals.timeout)
    //       .map(res => res.json())
    //       .subscribe(
    //           data => {
    //             try{
    //               loading.dismiss();

    //               console.log('IssueMoneyPinT2P : ',data);
    //               if(data.header.response_code == 0)
    //               {
    //                 this.presentReceiptModal(data);
    //                 this.saleType = 'PreSale';
    //                 this.getBalance(false);
    //                 this.list.scrollToTop();
    //               } else{
    //                 this.alertCtrl.create({
    //                     title: 'Sale Error Code : ' + data.header.response_code ,
    //                     message: data.header.response_description,
    //                     buttons: [
    //                       {
    //                           text: 'OK',
    //                           handler: () => {
    //                           }
    //                       }
    //                     ]
    //                 }).present();
    //               }
    //             }catch(e){
    //               loading.dismiss();
    //               console.log("T2P Sale Ex ERROR!: ", e);
    //               this.alertCtrl.create({
    //                   title: 'Sale Ex Error',
    //                   message: e,
    //                   buttons: [
    //                     {
    //                         text: 'OK',
    //                         handler: () => {
    //                         }
    //                     }
    //                   ]
    //               }).present();
    //             }
    //           },
    //           err => {
    //             loading.dismiss();
    //             console.log("T2P Sale ERROR!: ", err);
    //             this.alertCtrl.create({
    //                 title: 'Sale Error',
    //                 message: err,
    //                 buttons: [
    //                   {
    //                       text: 'OK',
    //                       handler: () => {
    //                       }
    //                   }
    //                 ]
    //             }).present();
    //           }
    //       );
    //   /*END T2P ISSUE PIN */
    // } else if(this.paymentMethod == 'paybydc'){
    //     this.alertCtrl.create({
    //     title: 'Remit',
    //     message: 'Booking successfully. Your booking ID is 123.',
    //     buttons: [
    //       {
    //           text: 'OK',
    //           handler: () => {
    //           }
    //       }
    //     ]
    //   }).present();  
    // }
    // else { // pay by cash


    /*START ISSUE PIN */
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    /* NOT USING let body = {
        merchant_code : this.tomain.merchantcode,
        password : this.tomain.password,
        merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
        pin_amount : (this.isFlexIndo || this.todo.country != 'Indonesia') ? this.todo.amount : 0,
        card_no : this.todo.cardno,
        customer_hp : this.todo.hpno,
        pin_denomination_id : (this.isFlexIndo || this.todo.country != 'Indonesia') ? 30 : this.todo.pindeno,
        remittance_purpose_id : this.todo.purpose,
        country : this.todo.country,
        provider : this.todo.provider,
        currency_type : (this.isFlexIndo || this.todo.country != 'Indonesia') ? this.todo.currency : 1,
        bank : this.todo.bank,
        purpose_sender_name : (this.todo.purpose == '9') ? this.todo.sname : ' ',
        purpose_sender_relationship : (this.todo.purpose == '9') ? this.todo.srelat : ' ',
        purpose_sender_country : (this.todo.purpose == '9') ? this.todo.scountry : ' ',
        purpose_sender_passport : (this.todo.purpose == '9') ? this.todo.spassport : ' ',
        purpose_sender_dob : (this.todo.purpose == '9') ? this.todo.sdob : '1970-01-01',
        purpose_sender_address : (this.todo.purpose == '9') ? this.todo.saddress : ' ',
        purpose_sender_purpose : (this.todo.purpose == '9') ? this.todo.spurpose : ' ',
        purpose_sender_document : (this.todo.purpose == '9') ? this.todo.sdocument : '0',
        purpose_sender_otherpurpose : (this.todo.purpose == '10') ? this.todo.otherpurpose : ' ',
        tac : this.todo.tac,
        appversion : myGlobals.version
      }; */

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      pin_amount: (this.pinType == 'Flexible') ? this.todo.amount : 0,
      card_no: this.todo.cardno,
      customer_hp: this.todo.hpno,
      pin_denomination_id: (this.pinType == 'Flexible') ? 30 : this.todo.pindeno,
      remittance_purpose_id: this.todo.purpose,
      country: this.todo.country,
      provider: this.todo.provider,
      currency_type: (this.pinType == 'Flexible') ? this.todo.currency : 1,
      bank: this.todo.bank,
      purpose_sender_name: (this.todo.purpose == '9') ? this.todo.sname : ' ',
      purpose_sender_relationship: (this.todo.purpose == '9') ? this.todo.srelat : ' ',
      purpose_sender_country: (this.todo.purpose == '9') ? this.todo.scountry : ' ',
      purpose_sender_passport: (this.todo.purpose == '9') ? this.todo.spassport : ' ',
      purpose_sender_dob: (this.todo.purpose == '9') ? this.todo.sdob : '1970-01-01',
      purpose_sender_address: (this.todo.purpose == '9') ? this.todo.saddress : ' ',
      purpose_sender_purpose: (this.todo.purpose == '9') ? this.todo.spurpose : ' ',
      purpose_sender_document: (this.todo.purpose == '9') ? this.todo.sdocument : '0',
      purpose_sender_otherpurpose: (this.todo.purpose == '10') ? this.todo.otherpurpose : ' ',
      tac: this.todo.tac,
      appversion: myGlobals.version,
      merchant_input_charge: this.todo.merchant_charge,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    //console.log(body)


    const options: HttpOptions = {
      url: myGlobals.url + '/IssueMoneyPin',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

      try {

        await loading.dismiss();

        console.log('IssueMoneypin : ', data);
        if (data.data.header.response_code == 0) {
          this.presentReceiptModal(data);
          this.saleType = 'PreSale';
          this.getBalance(false);
          this.list.scrollToTop()
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Sale Error Code : ' + data.data.header.response_code,
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
        await loading.dismiss();
        console.log("Sale Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Sale Ex Error',
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
      console.log("Sale ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Sale Error',
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


    /*END ISSUE PIN */

    // }

    // this.alertCtrl.create({
    //   title: 'Remit',
    //   message: 'start',
    //   buttons: [
    //     {
    //         text: 'OK',
    //         handler: () => {
    //         }
    //     }
    //   ]
    // }).present();

    //console.log(form.value)
    //window.getSelection().removeAllRanges();
    //console.log(form.value)
    //this.presentReceiptModal();
    //this.navCtrl.push(ReceiptPage);

    //saleType = 'AfterSale';
  }

  saleBack() {
    this.list.scrollToTop();
    this.saleType = 'PreSale';

    this.tap2pay.tac = '';
    this.OTPReqMsg = '';
    this.OTPTimer = '';
    this.todo.tac = '';
    this.tap2pay.isPayByMobileMoney = false;
  }

  generateOTP() {
    this.isGenerateOTP = true;
  }

  async getOTP() {
    this.isDisplayOTPMsg = false;
    if (this.tap2pay.cardno == '') {
      const alert = await this.alertCtrl.create({
        header: 'Invalid input',
        message: 'Please key in card no.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
      await alert.present();
      return;
    }

    /*START GET OTP */
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
      device: "ios",
      t2p_card_no: this.tap2pay.cardno,
      t2p_txn_amount: (this.pinType == 'Flexible') ? this.todo.amount : 0,
      t2p_ip: this.loggingProvider.myip != '' ? this.loggingProvider.myip : '0',
      t2p_txn_type: '2',
      t2p_description: "MerchantAppGetOTP",
      t2p_description2: '',
      t2p_system_id: '3'
    }

    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });



    const options: HttpOptions = {
      url: myGlobals.url + '/GetOTPT2P',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

      try {
        await loading.dismiss();

        console.log('GetOTPT2P : ', data);
        if (data.data.header.response_code == 0) {
          this.OTPReqMsg = data.data.header.response_description;
          this.OTPTimer = 'OTP expires in 3 minutes';
          this.isDisplayOTPMsg = true;
          this.tap2pay.otp_req_trans_id = data.data.body.trans_id ? data.data.body.trans_id : '';
          //this.tap2pay.tac = '';

          /*timer otp */
          // var countDownDate = new Date();
          // countDownDate.setMinutes(countDownDate.getMinutes() + 1); // 1 minutes to count down
          // countDownDate = new Date(countDownDate); 

          // // Update the count down every 1 second
          // var x = setInterval(function() {
          //   // Get today's date and time
          //   var now = new Date().getTime();

          //   // Find the distance between now and the count down date
          //   var distance = countDownDate.valueOf() - now;

          //   // Time calculations for minutes and seconds
          //   var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          //   var seconds = Math.floor((distance % (1000 * 60)) / 1000);

          //   this.OTPTimer = 'Approval code expires in ' + minutes + ":" + seconds;

          //   // If the count down is over, write some text 
          //   if (distance < 0) {
          //     clearInterval(x);
          //     this.OTPTimer = "Approval code expired!";
          //   }
          // }, 1000);
          /*timer otp */

        } else {
          const alert = await this.alertCtrl.create({
            header: 'Get OTP Error Code : ' + data.data.header.response_code,
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
        await loading.dismiss();
        console.log("Get OTP ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Get OTP Error',
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
      console.log("Get OTP ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Get OTP Error',
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


    /*END GET OTP */
  }

  async presentReceiptModal(data) {
    console.log ("present receipt modal ",data)
    let receiptModal = await this.modalCtrl.create({ component: ReceiptComponent, componentProps: { data: data, allow_redeem: this.allow_redeem, autofill_accno: this.todisplay.selectedbenearray[2], isnewpin: '1', cardno: this.todo.cardno, country: this.todo.country, merchantcode: this.tomain.merchantcode, password: this.tomain.password, purposearray: this.purposearray, purpose: this.todo.purpose, pinarray: this.pinarray, pindeno: (this.pinType == 'Flexible') ? 30 : this.todo.pindeno , flag:"moneypin" } });
    receiptModal.onDidDismiss().then(data => {
      this.tap2pay.cardno = '';
      this.tap2pay.tac = '';
      this.tap2pay.otp_req_trans_id = '';
      this.OTPReqMsg = '';
      this.OTPTimer = '';
    })
    await receiptModal.present();
  }


  async subvoidForm(form) {
    window.getSelection().removeAllRanges();
    //console.log(form.value)
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      void_trans_id: this.tovoid.pintxnid,
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    //console.log(body)



    const options: HttpOptions = {
      url: myGlobals.url + '/VoidMoneyPin',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

      try {
        await loading.dismiss();

        //console.log(data);
        if (data.data.header.response_code == 0) {
          const alert = await this.alertCtrl.create({
            header: 'Void',
            message: 'Void MoneyPin Status : ' + data.data.header.response_description,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
            ]
          })
          await alert.present();
          //this.presentReceiptModal(data);
          //this.saleType = 'AfterSale';
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Void Error Code : ' + data.data.header.response_code,
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
        await alert.present();

      }

    }).catch(async err => {

      await loading.dismiss();
      console.log("Void ERROR!: ", err);
      const alert = await this.alertCtrl.create({
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
      await alert.present();

    })




  }



  async checkForm() {
    window.getSelection().removeAllRanges();

    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      pin_txn_id: this.tovoid.pintxnid,
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    //console.log(body)
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    //   let options = new RequestOptions({ headers: headers });

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

        //console.log(data);
        if (data.data.header.response_code == 0) {
          const alert = await this.alertCtrl.create({
            header: 'Check Pin Status',
            message: 'Pin Status : ' + data.data.body.pin_status,
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
            header: 'Check Pin Error Code : ' + data.data.header.response_code,
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

  async requestTac() {
    window.getSelection().removeAllRanges();

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
      device: "ios"
    };
    //console.log(body)

    const options: HttpOptions = {
      url: myGlobals.url + '/GenerateTAC',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {

        await loading.dismiss();

        //console.log(data);
        if (data.data.header.response_code == 0) {
          const alert = await this.alertCtrl.create({
            header: 'Generate Tac',
            message: data.data.header.response_description,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.isTacRequested = true;
                }
              }
            ]
          })
          await alert.present();
          //this.saleType = 'AfterSale';
        } else {
          const alert = await this.alertCtrl.create({
            header: 'GenTac Error Code : ' + data.data.header.response_code,
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
        await loading.dismiss();
        console.log("GenTac Ex ERROR!: ", e);
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

        await alert.present();

      }
    }).catch(async err => {
      await loading.dismiss();
      console.log("GenTac ERROR!: ", err);
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

      await alert.present();

    })

    //this.isTacRequested = true;
  }



  public init() {
    console.log("init----")
    //console.log(this.countrylist);
    this.countryarray = this.countrylist.split('|');
    this.todo.country = this.countryarray[0];

    //this.dropdownCurrency(this.countryarray[0]);
    //console.log(this.providerlist);
    this.providerarray = this.providerlist.split('|');
    for (let x = 0; x < this.providerarray.length; x++) {
      this.hdummyarray = this.providerarray[x];
      this.providerarray[x] = this.hdummyarray.split(',');
    }
    this.todo.provider = this.providerarray[0][1];
    this.todo.card_type_flag = this.providerarray[0][3];

    //console.log(this.banklist);
    this.bankarray = this.banklist.split('|');
    for (let x = 0; x < this.bankarray.length; x++) {
      this.hdummyarray = this.bankarray[x];
      this.bankarray[x] = this.hdummyarray.split(',');
    }
    this.todo.bank = this.bankarray[0][2];

    //console.log(this.purposelist);
    this.purposearray = this.purposelist.split('|');
    for (let x = 0; x < this.purposearray.length; x++) {
      this.hdummyarray = this.purposearray[x];
      this.purposearray[x] = this.hdummyarray.split(',');
    }
    //this.todo.purpose = this.purposearray[0][0];

    /*       this.ratearray = this.ratelist.split('|'); */
    /*       for(let x = 0; x<this.ratearray.length;x++) */
    /*       { */
    /*         this.hdummyarray = this.ratearray[x]; */
    /*         this.ratearray[x] = this.hdummyarray.split(','); */
    /*       } */
    //console.log(this.pindenolist);
    this.pinarray = this.pindenolist.split('|');
    for (let x = 0; x < this.pinarray.length; x++) {
      this.hdummyarray = this.pinarray[x];
      this.pinarray[x] = this.hdummyarray.split(',');
    }

    this.currencyarray = this.currencylist.split('|');
    for (let x = 0; x < this.currencyarray.length; x++) {
      this.hdummyarray = this.currencyarray[x];
      this.currencyarray[x] = this.hdummyarray.split(',');
    }
  }

  async viewreceipt(log: any) {
    let receiptModal = await this.modalCtrl.create({ component: ReceiptComponent, componentProps: { data: JSON.parse(log.server_response), isnewpin: '0', merchantcode: this.tomain.merchantcode, password: this.tomain.password, cardno: log.cardno, country: log.country, purposearray: this.purposearray, purpose: log.purpose, pinarray: this.pinarray, pindeno: log.pindeno } });
    receiptModal.onDidDismiss().then(data => {
      this.tap2pay.cardno = '';
      this.tap2pay.tac = '';
      this.tap2pay.isPayByMobileMoney = false;
      this.OTPReqMsg = '';
      this.OTPTimer = '';
    })
    await receiptModal.present();
  }

  void(log: any) {
    this.appType = 'Void';
    this.tovoid.pintxnid = log.moneypintrxid
  }


  async getBalance(bool) {

    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    if (bool) {
      await loading.present();
    }
    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };


    const options: HttpOptions = {
      url: myGlobals.url + '/CheckBalance',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

      console.log("check balance", data)

      try {

        if (bool) {
          loading.dismiss();
        }
        //console.log(data);
        if (data.data.header.response_code == 0) {
          this.balance = data.data.body.balance;
          this.getDateNow();
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Check Balance Error Code : ' + data.data.header.response_code,
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
        if (bool) {
          loading.dismiss();
        }
        console.log("Check Balance Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Check Balance Ex Error',
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

      if (bool) {
        await loading.dismiss();
      }
      console.log("Check Balance ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Check Balance Error',
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

      console.log("get rate---", data.data.header)
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
            console.log("ratedummyarray", this.ratearray[x])
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



  getTopUpLog(refresher: any, loader: any) {
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
      url: myGlobals.url + '/GetTopUpTransactionLog',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {

        if (refresher) {
          await refresher.target.complete()
        }
        if (loader) {
          await loader.dismiss();
        }
        console.log(data);
        if (data.data.header.response_code == 0) {
          this.topuplog = data.data.body.result;//this.topuplog.concat(data.body.result);
          // let ratedummyarray : any;
          // this.ratearray = data.body.rate_list.split('|');
          // for(let x = 0; x<this.ratearray.length;x++)
          // {
          //   ratedummyarray = this.ratearray[x];
          //   this.ratearray[x] = ratedummyarray.split(',');
          // }
          //this.getBalance()
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Get TopUp Log Error Code : ' + data.data.header.response_code,
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
          await refresher.target.complete()
        }
        if (loader) {
          loader.dismiss();
        }
        console.log("TopUp Log Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'TopUp Log Ex Error',
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
        await refresher.target.complete()
      }
      if (loader) {
        await loader.dismiss();
      }
      console.log("ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'TopUp Log Error',
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
  //endregion main functions

  /*region suppport functions*/
  getDateNow() {
    let newDt = new Date();
    this.dateNow = newDt.toLocaleString('en-GB', { hour12: true });  //format: 19/06/2018, 4:02:08 pm
  }

  passfloat() {
    if (parseFloat(this.todo.amount) >= 3001 && this.todo.currency == 1) {
      return false;
    }
    else {
      return true;
    }
  }

  async checkDateInputValidation(fmdt: any, todt: any, limit = 6) {
    console.log(fmdt);
    console.log(todt);
    console.log('limit: ' + limit);

    var fdt = new Date(fmdt);
    var tdt = new Date(todt);

    console.log(fdt);
    console.log(tdt);

    var firstDay = new Date(fdt.getFullYear(), fdt.getMonth(), 1);
    var lastDay = new Date(tdt.getFullYear(), tdt.getMonth() + 1, 0);

    console.log(firstDay);
    console.log(lastDay);

    let monthDiff = this.getMonthDifference(firstDay, lastDay);
    console.log(monthDiff);

    if (monthDiff >= 6 && limit == 6) {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Maximum 6 months record only.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })

      await alert.present();
      return false;

    } else if (monthDiff >= 3 && limit == 3) {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Maximum 3 months record only.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
      await alert.present();
      return false;
    }
    return true;
  }




  doRefreshTopUpLog(refresher: any) {
    //console.log('Begin async operation', refresher);
    let dummy;
    this.getTopUpLog(refresher, dummy);
  }

  fpxReset() {
    //form.reset();
    this.active = false;
    setTimeout(() => this.active = true, 0);

    this.tofpx.fpxamount = '';
    this.tofpx.fpxbuyer_email = '';
  }

  decimalAdjust(type: any, value: any, exp: any) {
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

  numberWithCommas(x: any) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  
  
  async openModal() {

      console.log ("open modal country",this.todo.country)
   
    const myModal = await this.modalCtrl.create({ component: CustomSelectComponent, componentProps: { data: this.cardarray, country: this.todo.country, cardtypeflag: this.todo.card_type_flag } });

     myModal.onDidDismiss().then((data: any) => {
      if (data) {
        console.log("data dimiss",data.data.return)
        this.todisplay.selectedbenearray = data.data.return;
        console.log("todisplay",  this.todisplay.selectedbenearray )
        this.todo.cardno = data.data.return[0];
      }
    });
    return await myModal.present();
  }

  checkIfCardByCountryExist() {
    if (this.cardlist.indexOf(this.todo.country) > -1) {
      return true;
    }
    else {
      return false;
    }
  }


  getUriEncodeUrl(category, name) {
    return 'https://mmwalletapp.ezeemoney.biz:4322/' + category + '/' + encodeURI(name) + '.png'
  }


  isEmpty(obj: any) {
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

  isValidEmail(value: any) {
    value = value.trim();
    if (value === '') {
      return true;
    }
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
  }





  reportProblemValidation(): boolean {
    const check_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    this.reportprob.email = this.reportprob.email.trim(); // trim white space before checking
    if (!this.reportprob.email) {
      this.alertHelper('Invalid email', 'Please insert email.', null, null);
      return false;
    } else if (!check_email.test(this.reportprob.email)) {
      this.alertHelper('Invalid email', 'Invalid email. We will contact you through email, please insert a valid email address.', null, null);
      return false;
    } else if (!this.reportprob.phone) {
      this.alertHelper('Invalid phone no.', 'Please insert phone number.', null, null);
      return false;
    } else if (this.reportprob.phone && this.reportprob.phone.length < 7) {
      this.alertHelper('Invalid phone no.', 'Please insert valid phone number.', null, null);
      return false;
    } else if (!this.reportprob.category) {
      this.alertHelper('Invalid problem', 'Please select problem.', null, null);
      return false;
    } else if (this.reportprob.category == 2 && !this.reportprob.bank) {
      this.alertHelper('Invalid bank', 'Please select which bank to top up for merchant account.', null, null);
      return false;
    } else if (!this.reportprob.subject) {
      this.alertHelper('Invalid subject', 'Please insert subject.', null, null);
      return false;
    } else if (this.reportprob.subject && this.reportprob.subject.length < 3) {
      this.alertHelper('Invalid subject', 'Please make sure your subject is correct.', null, null);
      return false;
    } else if (!this.reportprob.message) {
      this.alertHelper('Invalid message', 'Please insert message.', null, null);
      return false;
    } else if (this.reportprob.message && this.reportprob.message.length < 3) {
      this.alertHelper('Invalid message', 'Please make sure your message is correct.', null, null);
      return false;
    }

    return true;
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

  dropdownCurrency(val: any) {
    switch (val) {
      case 'Indonesia':
        this.todisplay.countrycurrency = 'Rupiah';
      case 'Nepal':
        this.todisplay.countrycurrency = 'Rupee';
      case 'Bangladesh':
        this.todisplay.countrycurrency = 'Taka';
      case 'Philippines':
        this.todisplay.countrycurrency = 'Peso';
      case 'Myanmar':
        this.todisplay.countrycurrency = 'Kyat';
      case 'Vietnam':
        this.todisplay.countrycurrency = 'Dong';
    }

  }

  doRefresh(refresher: any) {
    //console.log('Begin async operation', refresher);
    this.getRate(refresher);
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


  clearkeyboard() {
    window.getSelection().removeAllRanges();
  }


  yyyymmddFormatDate(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
    var dd = dateIn.getDate();
    var yyyymmdd = String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
    var yr = yyyymmdd.substr(0, 4);
    var m = yyyymmdd.substr(4, 2);
    var d = yyyymmdd.substr(6, 2);
    return yr + '-' + m + '-' + d;
  }

  ddmmyyyyFormatDate(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
    var dd = dateIn.getDate();
    var yyyymmdd = String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
    var yr = yyyymmdd.substr(0, 4);
    var m = yyyymmdd.substr(4, 2);
    var d = yyyymmdd.substr(6, 2);
    return d + m + yr;
  }

  b64toBlob(b64Data, contentType, sliceSize): Blob {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  testb642blob(b64Data): Blob {
    var byteCharacters = atob(b64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {
      type: undefined
    });

    return blob;
  }


  getMonthDifference(from, to) {
    return to.getMonth() - from.getMonth()
      + (12 * (to.getFullYear() - from.getFullYear()));
  }

  selectRate(rates: any) {
    if (this.todo.country != rates[0]) {
      this.todo.cardno = "";
      this.todisplay.selectedbenearray = "";
    }
    this.todo.country = rates[0];
    if (rates[0] != 'Indonesia') {
      //this.todo.hpno = '000'
      //this.requireHP = false;
      this.pinType = 'Flexible';
    } else {
      this.todo.currency = 1
      //this.todo.hpno = '';
      //this.requireHP = true
    }
    //this.dropdownCurrency(this.countryarray[0]);

    let i = 0;
    for (i = 0; i < this.providerarray.length; i++) {
      if (this.providerarray[i][2] == rates[1] && this.providerarray[i][0] == rates[0]) {
        this.todo.provider = this.providerarray[i][1];
        break;
      }
    }
    let y = 0;
    for (y = 0; y < this.bankarray.length; y++) {
      if (this.bankarray[y][0] == rates[0] && this.bankarray[y][1] == this.todo.provider) {
        this.todo.bank = this.bankarray[y][2];
        break;
      }
    }
    this.appType = 'Sale';
    this.changed();
  }

  changed() {
    this.list.scrollToTop()
  }

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

  onChange2(val: any) {
    let y = 0;
    for (y = 0; y < this.bankarray.length; y++) {
      if (this.bankarray[y][1] == val && this.bankarray[y][0] == this.todo.country) {
        this.todo.bank = this.bankarray[y][2];
        break;
      }
    }

    // get provider's card type flag
    for (let x = 0; x < this.providerarray.length; x++) {
      if (this.providerarray[x][1] == val && this.providerarray[x][0] == this.todo.country) {
        this.todo.card_type_flag = this.providerarray[x][3];
        break;
      }
    }

    // get provider's pickup method
    // for(let x = 0; x < this.providerarray.length; x++) {
    //   if ( this.providerarray[x][1] == val && this.providerarray[x][0] == this.todo.country){
    //     this.todo.pickup_method = this.providerarray[x][2];
    //     break;
    //   }
    // }

    /* 1/3/2022 reset ongkos value when provider changed */
    this.todo.merchant_charge = 0;
    this.ongkosCheck.is_allowFlexibleOngkos = -1;
    this.ongkosCheck.mm_cajkedai = 0;
  }

  onChangeHP(event: Event) {
    const inputElement = (event.target as HTMLInputElement).value;
    this.hidecardlist = true;
    this.hidemsgattnsender = true;
    this.todisplay.msgattnsender = "";
    this.todo.cardno = "";
    this.todisplay.selectedbenearray = "";
  }

  clear() {
    this.toquery.colname = '';
    this.toquery.colparam = '';
  }

  active = true;
  async menuReset(page) {
    this.pageType = page;
    if (page == 'TopUpLog') {
      let dummy;

      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });
      loading.present();

      this.getTopUpLog(dummy, loading);
    } else if (page == 'Logout') {

      //this.oneSignal.deleteTag('merchantCode');
      // const index = this.viewCtrl.index;

      this.router.navigate(['/login'])
      // this.navCtrl.push(LoginPage).then(() => {
      //   this.navCtrl.remove(index);
      // });
    }
  }

  selectdate() {
    DatePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: DatePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => this.todo.sdob = this.getDate(date),//console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
    );

  }

  async openLog(val: any) {
    let col = ''
    let filter_type = 0;

    if (val == 1) {
      col = '';
    }
    else if (val == 2) {
      filter_type = 1
      col = 'hpno';
    }
    else if (val == 3) {
      filter_type = 2
      col = 'cardno';
    }
    else if (val == 4) {
      filter_type = 3
      col = 'moneypintrxid';
    }
    else if (val == 5) {

      return;
    }
    else {
      col = '';
    }

    if (!this.fromDt) {
      this.fromDt = this.maxDate;
    }

    if (!this.toDt) {
      this.toDt = this.maxDate;
    }

    if (await this.checkDateInputValidation(this.fromDt, this.toDt) == true) {

      let navigationExtras: NavigationExtras = {
        queryParams: {
          merchantcode: this.tomain.merchantcode,
          password: this.tomain.password,
          purposearray: this.purposearray,
          pinarray: this.pinarray,
          column: col,
          filter_type: filter_type,
          filter_value: this.tosearch.filtervalue,
          fromdate: this.fromDt,
          todate: this.toDt
        }
      };

      console.log ("navigation log",navigationExtras)

      this.navCtrl.navigateForward(['/log'], navigationExtras)


      // this.navCtrl.push(LogPage,
      //   {
      //     merchantcode: this.tomain.merchantcode,
      //     password: this.tomain.password,
      //     purposearray : this.purposearray,
      //     pinarray : this.pinarray,
      //     column : col,
      //     filter_type : filter_type,
      //     filter_value : this.tosearch.filtervalue,
      //     fromdate: this.fromDt,
      //     todate: this.toDt
      //   }
      // )
    }

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
    return yyyy + '-' + mmstr + '-' + ddstr;
  }


  isValidDate(str: any) {
    let darray = str.split('-');
    let d = new Date(darray[0], darray[1], darray[2]);
    if (d.getFullYear() == darray[0] && d.getMonth() == darray[1] && d.getDate() == darray[2]) {
      return true;
    }
    return false;
  }


  async click2() {
    if (this.todo.hpno.length < 10) {
      this.alertHelper('Invalid HP Details', 'Please Enter Valid HP Number', this.hpno, 0)
      return;
    }
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      hp: this.todo.hpno,
      appversion: myGlobals.version
    };

    //console.log(body)
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    const options: HttpOptions = {
      url: myGlobals.url + '/GetCardNoByHP',
      method: "POST",
      connectTimeout: myGlobals.timeout,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {

        console.log("Invalid HP invalid", data)

        await loading.dismiss();

        if (data.data.header.response_code == 0) {
          this.hidecardlist = false;
          if (data.data.body.rba011_highrisk == "200") {
            this.hidemsgattnsender = false;
            this.todisplay.msgattnsender = data.data.body.highrisk_msg;
            const alert = await this.alertCtrl.create({
              header: 'Attention : ',
              message: data.data.body.highrisk_msg,
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                  }
                }
              ]
            })
            await alert.present()
          } else {
            this.hidemsgattnsender = true;
            this.todisplay.msgattnsender = "";
          }
          this.cardlist = data.data.body.card_list;
          this.todo.cardno = "";
          this.todisplay.selectedbenearray = "";
          this.cardarray = this.cardlist.split('|');
          for (let x = 0; x < this.cardarray.length; x++) {
            this.hdummyarray = this.cardarray[x];
            this.cardarray[x] = this.hdummyarray.split(',');
          }
        } else {
          this.hidecardlist = true;
          this.hidemsgattnsender = true;
          this.todisplay.msgattnsender = "";
          this.todo.cardno = "";
          this.todisplay.selectedbenearray = "";
          const alert = await this.alertCtrl.create({
            header: 'Get Sender Card Error Code : ' + data.data.header.response_code,
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
        console.log("Get Sender Card Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Get Sender Card Ex Error',
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
      console.log("ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Get Sender Card Error',
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

  async doPreFpxFetch(form) {
    window.getSelection().removeAllRanges();

    if (this.tofpx.fpxamount == '') {
      // let browser = this.iab.create('https://google.com.my','_self');

      // browser.on('loadstop').subscribe(event => {
      //   console.log(event);
      // })
      this.alertHelper('Invalid Amount', 'Please Input Correct Amount', this.fpxamount, 1)
      return;
    }
    if (!this.isValidEmail(this.tofpx.fpxbuyer_email)) {
      this.alertHelper('Invalid Email', 'Please Input Correct Email', this.fpxbuyer_email, 1)
      return;
    };
    console.log(form.value)
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      app_id: 1,
      appversion: myGlobals.version,
      amount: this.tofpx.fpxamount,
      payment_desc: this.tomain.merchantcode + ';MMMerchantAppFpxTopup',
      buyer_email: this.tofpx.fpxbuyer_email,
      isMobile: true,
      sub_stem_id: 2
    };
    console.log(body)


    const options: HttpOptions = {
      url: myGlobals.url + '/GetPaymentRequest',
      method: "POST",
      connectTimeout: myGlobals.timeout,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    }


    Http.request(options).then(async (data: any) => {

      try {
        await loading.dismiss();
        if (data.data.header.response_code == 0) {
          let browser = this.iab.create(data.data.body.url, '_blank');
          

          browser.on('loadstop').subscribe(event => {
            console.log('------loadstop started-----') 
            //console.log(event);
            if (event.url.indexOf('/EZNewMobileApp/api/EzMobileApp/onFPXResponse') > -1) {
              // if(event.url.indexOf('/close.html')>-1){
              browser.executeScript({
                code: "document.body.innerText"
              })
                .then(async res => {
                  try {
                    console.log("---res---",res[0]);
                    
                    browser.close();


                    let fpxResp = JSON.parse(res[0]);
                    //{"header":{"timestamp":"2018-12-05 16:03:18","response_code":"10000","response_description":"Missing Parameter [fpxTxnId]"},
                    //"body":{"fpx_response_code":"DB","fpx_response_msg":"[DB] Invalid Email Format DC Invalid Maximum Frequency","request_id":10019,"amount":0.0,"fpx_trx_id":null}}
                    if (fpxResp.header.response_code == 0) {
                      const alert = await this.alertCtrl.create({
                        //title: 'FPX TopUp Success',
                        // message: 'Request ID :'+fpxResp.body.request_id+'<br/>' +
                        // 'FPX Txn ID :'+fpxResp.body.fpx_trx_id+'<br/>' +
                        // 'Amount :'+fpxResp.body.amount+ '<br/><br/>' +
                        // fpxResp.header.response_description,
                        message: fpxResp.header.response_description,
                        buttons: [
                          {
                            text: 'OK',
                            handler: () => {
                              this.menuReset('TopUpLog');
                              this.fpxReset();
                              this.getBalance(false);
                            }
                          }
                        ],
                        backdropDismiss: false
                      })
                      await alert.present();
                    } else {
                      const alert = await this.alertCtrl.create({
                        // title: 'FPX TopUp FAILURE : ' + fpxResp.header.response_code,
                        // message: 'Request ID :'+fpxResp.body.request_id+'<br/>' +
                        // 'FPX Txn ID :'+fpxResp.body.fpx_trx_id+'<br/>' +
                        // 'Amount :'+fpxResp.body.amount+ '<br/><br/>' +
                        message: fpxResp.header.response_description,
                        buttons: [
                          {
                            text: 'OK',
                            handler: () => {
                            }
                          }
                        ],
                        backdropDismiss: false
                      })
                      await alert.present()
                    }
                  } catch (e) {
                    console.log(e);
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            }
            // browser.insertCSS({ code: "body{color: red;" });




          })
        } else {
          const alert = await this.alertCtrl.create({
            header: 'FPX Error Code : ' + data.data.header.response_code,
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
        console.log("FPX Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'FPX Ex Error',
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
      console.log("FPX ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'FPX Error',
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

  compareFnn(e1 , e2): boolean {
    return e1 && e2 ? e1.id == e2.id : e1 == e2;
  }




  /*region upload attachment*/
  async selectUploadSource() {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: 1,
      mediaType: this.camera.MediaType.PICTURE,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: false
    };

    let actionSheet = await this.actionSheetCtrl.create({
      header: 'Attachment',
      buttons: [
        {
          text: 'Capture photo', //'Use Camera',
          handler: () => {
            options.sourceType = 1;
            //this.uploadImage(options);
            this.captureImage(); // use media capture plugin
          }
        },
        {
          text: 'From Gallery',
          handler: () => {
            options.sourceType = 2;
            this.uploadImage(options);
          }
        }
      ]
    });
    await actionSheet.present();
  }


  async uploadImage(options: CameraOptions) {
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();
    this.camera.getPicture(options).then((imageData) => {
      console.log('from camera plugin: ');
      let base64data = 'data:image/jpeg;base64,' + imageData;

      // resize image
      this.generateFromImage(base64data, 700, 700, 0.9, resImgData => {
        this.reportprob.attachement = resImgData;

      });
    }, (err) => {
      //this.logger.showAlertNoTitle('No image selected.', ['OK']);
    });
    await loading.dismiss();
  }


  
  //added 2/11/2021
 captureImage() {
    console.log ("capture image")
    let options: CaptureImageOptions = { limit: 1 }
    this.mediaCapture.captureImage(options)
      .then(async (data: MediaFile[]) => {
          
          var fileURL = data[0].fullPath;
          let fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1);
          let filePath = fileURL.substring(0, fileURL.lastIndexOf("/") + 1);

          // console.log ("data ",data)

          // console.log ("fileURL ",fileURL)

          // console.log ("fileName ",fileName)

          // console.log ("filePath ",filePath)

          const base64 = await this.base64FromPath(fileURL)

          let base64imagedata = 'data:image/jpeg;base64,' + base64;

           this.generateFromImage(base64imagedata , 700, 700, 0.9, (resImgData:any) => {
            this.reportprob.attachement = resImgData;

            console.log ("this.reportprob",resImgData )
          });

       
            // this.file.readAsDataURL(filePath, fileName).then(file64 => {
            //   // resize image
            //   console.log("file",file64)

            //   console.log ("not working")
  
            
            // }).catch(err => {
            //   console.log('encode base 64 err: ' + err);
            // });

      
           
           
                 
        
        },
        (err: CaptureError) => console.error(err)
      );
  }


 async base64FromPath(paths) {

  // const file = await Filesystem.readFile({
  //      path:paths,
      
  // })

        // const response  = await fetch (path);
        // const blob  = await response.blob();

        // console.log("blob",file.data)
      //  return file.data  
    }

 



  generateFromImage(img, MAX_WIDTH: number = 800, MAX_HEIGHT: number = 800, quality: number = 1, callback:any) {
    var canvas: any = document.createElement("canvas");
    var image = new Image();

    image.onload = () => {
      var width = image.width;
      var height = image.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, width, height);

      // IMPORTANT: 'jpeg' NOT 'jpg'
      var dataUrl = canvas.toDataURL('image/jpeg', quality);

      callback(dataUrl)
    }
    image.src = img;

 
    // console.log(image.src);
  }
  /*endregion upload attachment*/




  async reportProblem() {
    if (this.reportProblemValidation()) {
      //this.alertHelper('OK', 'verification ok', null, null);
      //console.log(this.reportprob.attachement);
      //region sample input
      // "appversion":"0.0.13",
      //   "merchant_trans_id": "20190522",
      //   "name":"ks",
      //   "email": "mmkaishin@gmail.com",
      //   "subject": "Test",
      //   "category": "38",
      //   "message":"Testing",
      //   "photo": "sdamldald"

      // params.putOpt("custom1", strBank);
      // //params.put("custom2", "TNB");
      // params.putOpt("custom3", mphone);
      // params.putOpt("custom5", mid);
      // params.putOpt("custom7", strTransactionId);
      //endregion

      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();

      let attachement2 = '';
      if (this.reportprob.attachement) {
        attachement2 = this.reportprob.attachement.replace(/^data:image\/\w+;base64,/, "");
      }
      // param follow api's param
      let body = {
        appversion: myGlobals.version,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        name: this.tomain.merchantcode,
        email: this.reportprob.email,
        subject: this.reportprob.subject,
        category: this.reportprob.category,
        message: this.reportprob.message,
        photo: attachement2,
        custom1: this.reportprob.bank,
        custom3: this.reportprob.phone,
        custom5: this.tomain.merchantcode,
        custom7: this.reportprob.trans_id,
        platform: this.platform.platforms()[0],
        device: "ios"
      };

      const options: HttpOptions = {
        url: myGlobals.url + '/LaporMasalah',
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
              header: 'Successful',
              message: 'New ticket submitted, please check your email. Ticket No. ' + data.data.body.ticket,
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    // this.sql.set('reportProbEmail', this.reportprob.email); //save email value
                    // this.sql.set('reportProbPhone', this.reportprob.phone); //save phone value

                    var ls = new SecureLS({ encodingType: 'aes' });
                    ls.set('reportProbEmail', this.reportprob.email);
                    ls.set('reportProbPhone', this.reportprob.phone);
                    this.resetReportProblem(); // clear all input if success
                  }
                }
              ]
            })
            await alert.present();
          } else {
            const alert = await this.alertCtrl.create({
              header: 'Report problem Error Code : ' + data.data.header.response_code,
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
          console.log("Report problem ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'Report problem Error',
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
        console.log("Report problem 2 ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'Report problem Error',
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

  resetReportProblem() {
    this.reportprob.subject = '';
    this.reportprob.message = '';
    this.reportprob.attachement = '';
    this.reportprob.category = 0;
    this.reportprob.phone = '';
    this.reportprob.trans_id = '';
    this.reportprob.bank = '';

    //get saved email address for report problem
    this.sql.get('reportProbEmail').then((email) => {
      if (email) {
        this.reportprob.email = email;
      } else {
        this.reportprob.email = '';
      }
    });

    this.sql.get('reportProbPhone').then((phone) => {
      if (phone) {
        this.reportprob.phone = phone;
      } else {
        this.reportprob.phone = '';
      }
    });
  }
  /*endregion report problem*/


  /*region topup bank*/
  selectBank(bank) {
    this.selectedBank = bank;
    console.log(this.selectedBank);
  }

  resetBankOption() {
    this.selectedBank = [];
    this.resetTopUp();
  }


  submitBankTopUpValidation(selectedBank): boolean {
    if (this.topup.amount == 0) {
      this.alertHelper('Invalid Amount', 'Please make sure amount is correct.', null, null);
      return false;
    } else if (this.topup.amount.toString().endsWith(".")) {
      this.topup.amount = parseFloat(this.topup.amount.toString().replace(".", ""));
    } else if (this.reportprob.attachement == '') {
      this.alertHelper('Invalid attachment', 'Please select topup receipt.', null, null);
      return false;
    }

    if (selectedBank.bank == 'RHB') {
      if (this.topup.seqNo == '' || !this.topup.seqNo) {
        this.alertHelper('Invalid Seq No.', 'Please make sure Seq No. is correct.', null, null);
        return false;
      } else if (this.topup.seqNo && (this.topup.seqNo.length < 4 || this.topup.seqNo.length > 6)) {
        this.alertHelper('Invalid Seq No.', 'Please make sure Seq No. is correct.', null, null);
        return false;
      }
    } else if (selectedBank.bank != 'RHB') {
      if (this.topup.tempat == '') {
        this.alertHelper('Invalid Location', 'Please make sure Location is correct.', null, null);
        return false;
      } else if (this.topup.tempat != '' && this.topup.tempat.length < 3) {
        this.alertHelper('Invalid Location', 'Please make sure Location is correct.', null, null);
        return false;
      } else if (!this.topup.tudate) {
        this.alertHelper('Invalid Date', 'Please select top up Date.', null, null);
        return false;
      } else if (!this.topup.tutime) {
        this.alertHelper('Invalid Time', 'Please select top up Time.', null, null);
        return false;
      }
    }
    return true;
  }


  async submitBankTopUp(selectedBank) {
    console.log('date: ' + this.topup.tudate);
    console.log('time: ' + this.topup.tutime);
    console.log('amount: ' + this.topup.amount);
    console.log('seq: ' + this.topup.seqNo);

    if (this.submitBankTopUpValidation(selectedBank)) {
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();

      // combine all data in message field
      // convert photo to byte array
      var strX = "#EM#";
      var strDate = this.ddmmyyyyFormatDate(new Date(this.topup.tudate)) + this.topup.tutime.split('T')[1].replace(':', '');
      var topupStr = "";
      var mtype = 1;
      
      console.log("strdate",strDate)
      console.log ("time",this.topup.tutime.split('T')[1].replace(':', ''))

      try {
        if (selectedBank.bank == 'RHB') {
          topupStr = "TRHB" + strX + this.tomain.merchantcode + "#" + this.topup.amount + "#" + this.topup.seqNo;
        } else {
          topupStr = 'T' + selectedBank.bank + strX + this.tomain.merchantcode + '#' +
            this.topup.amount + '#' + strDate + '#' + this.topup.tempat;
        }
        console.log(topupStr);
        // let blobImg = this.b64toBlob(this.reportprob.attachement, '', '');
        // console.log(blobImg);
        // let blobImg2 = this.testb642blob(this.reportprob.attachement);
        // console.log(blobImg2);

        let body = {
          merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
          merchant_code: this.tomain.merchantcode,
          password: this.tomain.password,
          appversion: myGlobals.version,
          mtype: mtype,
          message: topupStr,
          photo: this.reportprob.attachement.replace(/^data:image\/\w+;base64,/, ""),
          platform: this.platform.platforms()[0],
          device: "ios"
        }


        const options: HttpOptions = {
          url: myGlobals.url + '/BankTopUp',
          data: body,
          method: 'POST',
          connectTimeout: myGlobals.timeout,
          headers: { 'Content-Type': 'application/json' }
        }

        Http.request(options).then(async (data: any) => {

          try {

            if (data.data.header.response_code == 0) {
              await loading.dismiss();
              const alert = await this.alertCtrl.create({
                header: 'Successful',
                message: data.data.header.response_description,
                buttons: [
                  {
                    text: 'OK',
                    handler: () => {
                      this.resetTopUp(); // clear all input if success
                    }
                  }
                ]
              })
              await alert.present();
            } else {
              await loading.dismiss();
              const alert = await this.alertCtrl.create({
                header: 'Bank Top up Error Code : ' + data.data.header.response_code,
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
            await loading.dismiss();
            console.log("Bank Top up Ex ERROR!: ", e);
            const alert = await this.alertCtrl.create({
              header: 'Bank Top up Ex Error',
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
          console.log("Bank Top up ERROR!: ", err);
          const alert = await this.alertCtrl.create({
            header: 'Bank Top up Error',
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

      } catch (e) {
        await loading.dismiss();
        console.log("Submit Bank Top up Ex ERROR!: ", e);
        this.alertHelper('Bank TopUp Ex', e.message, null, null);
      }
    }
  }


  resetTopUp() {
    this.reportprob.attachement = '';
    this.topup.amount = 0;
    this.topup.seqNo = '';
    this.topup.tempat = '';
    this.topup.tudate = this.yyyymmddFormatDate(new Date());
    this.topup.tutime = '';
    this.selectedBank = [];
  }
  /*endregion topup bank*/


  //region eremit
  checkTxnStatus() {

  }

  getBookingDetails() {

  }

  payBooking() {

  }
  //endregion eremit


  async updatePin() {
    let checkNumber = /^([0-9][0-9]*)$/;
    this.newpin = this.newpin.replace(/\s/g, ""); //remove whitespace
    this.cnewpin = this.cnewpin.replace(/\s/g, ""); //remove whitespace

    if (!this.oldpin || !this.newpin || !this.newpin) {
      this.alertHelper('Error', 'Please insert old PIN, New PIN and confirm PIN', null, 0);
    }
    else if (this.newpin.length != 6 || this.cnewpin.length != 6) {
      this.alertHelper('Error', 'Please make sure your PIN is 6 digit', null, 0);
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
        device: "ios",
        oldpin: this.oldpin,
        newpin: this.newpin
      };
      //console.log(body)

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
                    this.navCtrl.pop();
                  }
                }
              ]
            })
            await alert.present();
            //this.saleType = 'AfterSale';
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
            await alert.present();
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
          await alert.present();

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
        await alert.present();
      })

    }
  }




  // region eremit
  async eremitGetBooking() {
    if (!this.todoeremit.booking_idx || this.todoeremit.booking_idx == '') {
      this.alertHelper('Invalid', 'Please insert valid Booking ID.', null, null);
      return false;
    } else if (this.senderhp == '' || !this.senderhp) {
      this.alertHelper('Invalid', 'Please insert Sender HP.', null, null);
      return false;
    } else if (this.senderhp.length < 10 || this.senderhp.length > 11) {
      this.alertHelper('Invalid', 'Please insert valid Sender HP.', null, null);
      return false;
    }
    else {
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();

      this.todoeremit.booking_idx = this.todoeremit.booking_idx.toString().trim();

      console.log ("booking ", this.todoeremit.booking_idx)

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios",
        booking_id: Number(this.todoeremit.booking_idx)
      };
      //console.log(body)
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });

      const options: HttpOptions = {
        url: myGlobals.url + '/ERemitGetBooking',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }

      Http.request(options).then(async (data: any) => {
        try {
          await loading.dismiss();
          this.bookingRes = [];
          if (data.data.header.response_code == 0) {
            this.senderhp = this.senderhp.toString().replace(' ', '');
            this.senderhp = this.senderhp.toString().replace('-', '');
            this.senderhp = this.senderhp.toString().trim();

            if (this.senderhp == data.data.body.customer_hp) {
              this.bookingRes = data.data.body;
            } else {
              this.alertHelper('Invalid', 'Booking not found.', null, null);
            }


          } else {
            this.senderhp = this.senderhp.toString().replace(' ', '');
            this.senderhp = this.senderhp.toString().replace('-', '');
            this.senderhp = this.senderhp.toString().trim();

            if (this.senderhp == data.data.body.customer_hp) {
              const alert = await this.alertCtrl.create({
                header: 'Get Booking Error Code : ' + data.data.header.response_code,
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
              this.alertHelper('Invalid', 'Booking not found.', null, null);
            }
          }

        } catch (e) {

          await loading.dismiss();
          console.log("Getbooking Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'Get Booking Ex Error',
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
        console.log("Getbooking ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'Get Booking Error',
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


  async eremitPayBooking() {
    const mainalert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Do you want to pay now?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'OK',
          handler: async () => {
            if (!this.todoeremit.booking_idx || this.todoeremit.booking_idx == '') {
              this.alertHelper('Invalid', 'Please insert valid Booking ID.', null, null);
              return false;
            }
            else {
              let loading = await this.loadingCtrl.create({
                message: 'Please wait...'
              });

              await loading.present();
              this.todoeremit.booking_idx = this.todoeremit.booking_idx.trim();

              let body = {
                merchant_code: this.tomain.merchantcode,
                password: this.tomain.password,
                merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
                appversion: myGlobals.version,
                platform: this.platform.platforms()[0],
                device: "ios",
                booking_id: Number(this.todoeremit.booking_idx)
              };
              //console.log(body)
              // let headers = new Headers({ 'Content-Type': 'application/json' });
              // let options = new RequestOptions({ headers: headers });

              const options: HttpOptions = {
                url: myGlobals.url + '/ERemitPayBooking',
                data: body,
                method: 'POST',
                connectTimeout: myGlobals.timeout,
                headers: { 'Content-Type': 'application/json' }
              }


              Http.request(options).then(async (data: any) => {
                try {

                  if (data.data.header.response_code == 0) {
                    //{"header":{"timestamp":"2020-05-15 17:20:15","response_code":"999","response_description":"INVALID"},
                    // //"body":{"merchant_trans_id":"68095215202005150553","trans_id":"0","pin_status":"INVALID"}}
                    this.bookingRes = [];
                    this.receiptRes = [];
                    this.receiptRes = data.body;
                    this.isPaid = true;

                    const alert = await this.alertCtrl.create({
                      header: 'Successful',
                      message: 'Your booking is successfully paid.',
                      buttons: [
                        {
                          text: 'OK',
                          handler: () => {
                            //this.navCtrl.pop();
                          }
                        }
                      ]
                    })
                    await alert.present();
                  } else {
                    const alert = await this.alertCtrl.create({
                      header: 'Pay Booking Error Code : ' + data.data.header.response_code,
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

                  await loading.dismiss();
                  console.log("Paybooking Ex ERROR!: ", e);
                  const alert = await this.alertCtrl.create({
                    header: 'Pay Booking Ex Error',
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
                console.log("Paybooking ERROR!: ", err);
                const alert = await this.alertCtrl.create({
                  header: 'Pay Booking Error',
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
        }
      ]
    })
    await mainalert.present();
  }


  async eremitCheckStatus() {
    if (!this.todoeremit.check_trans_id || this.todoeremit.check_trans_id == '') {
      this.alertHelper('Invalid', 'Please insert valid transaction No.', null, null);
      return false;
    }
    else {
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();
      this.todoeremit.check_trans_id = this.todoeremit.check_trans_id.toString().trim();

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios",
        check_trans_id: this.todoeremit.check_trans_id
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
          this.todoeremit.pin_status_ms = data.data.body.pin_status;


        } catch (e) {

          await loading.dismiss();
          console.log("CheckStatus Ex ERROR!: ", e);
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
      }).catch(async err => {

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


 async shareTrxn(log: any) {
    try {
      let share_data = '';

      if (log) {
        share_data = "eRemit Receipt";
        share_data += log['merchant_name'] ? "\nMerchant: " + log['merchant_name'] : '';
        share_data += this.tomain.merchantcode ? "\nMerchant ID: " + this.tomain.merchantcode : '';
        share_data += log['booking_paidtime'] ? "\nPayment DateTime: " + log['booking_paidtime'] : '';
        share_data += log['remit_ref_trans_id'] ? "\nTransaction ID.: " + log['remit_ref_trans_id'] : '';
        share_data += log['pin_number'] != '0' ? "\nPin No.: " + log['pin_number'] : '';
        share_data += log['pymt_rm_amt'] ? "\nAmount Collected: RM " + log['pymt_rm_amt'] : '';
        share_data += log['remit_rm_amt'] ? "\nRemit Amount: RM " + log['remit_rm_amt'] : '';
        share_data += log['remit_ex_rate'] ? "\nExchange Rate: " + log['remit_ex_rate'] : '';
        share_data += log['remit_foreign_currency'] ? "\nForeign Currency: " + log['remit_foreign_currency'] : '';
        share_data += log['remit_foreign_amt'] ? "\nForeign Amount: " + log['remit_foreign_amt'] : '';
        share_data += log['service_change'] ? "\nService Charge: RM " + log['service_change'] : '';
        share_data += log['bene_name'] ? "\nBeneficiary Name: " + log['bene_name'] : '';
        share_data += log['customer_name'] ? "\nCustomer Name: " + log['customer_name'] : '';
        share_data += log['customer_hp'] ? "\nCustomer HP: " + log['customer_hp'] : '';
        share_data += log['country'] ? "\nCountry: " + log['country'] : '';
        share_data += log['provider'] ? "\nProvider: " + log['provider'] : '';
        share_data += log['bank_name'] != '' ? "\nBank Name: " + log['bank_name'] : '';
        share_data += log['bank_acc_number'] != 0 ? "\nAccount No.: " + log['bank_acc_number'] : '';
        share_data += "\n\n";
      } else {
        this.alertHelper('Error', 'Error sharing. Data not found.', null, null);
        return;
      }

      // if (log && log.pin_number != 0) {
      //   share_data = "eRemit Receipt" + "\nMerchant: " + log['merchant_name'] +
      //     "\nMerchant ID: " + this.tomain.merchantcode +
      //     // "\nBooking ID: " + log['booking_id'] +
      //     "\nPayment DateTime: " + log['booking_paidtime'] +
      //     // "\nBooking DateTime: " + log['booking_datetime'] +
      //     "\nTransaction ID.: " + log['remit_ref_trans_id'] +
      //     "\nPin No.: " + log['pin_number'] +
      //     "\nAmount Collected (RM): " + log['total_charge'] +
      //     "\nRemit Amount (RM): " + log['remit_rm_amt'] +
      //     "\nExchange Rate: " + log['remit_ex_rate'] +
      //     "\nForeign Currency: " + log['remit_foreign_currency'] +
      //     "\nForeign Amount: " + log['remit_foreign_amt'] +
      //     "\nService Charge (RM): " + log['service_change'] +
      //     "\nBeneficiary Name: " + log['bene_name'] +
      //     // "\nCard No.: " + log['bene_card_no'] +
      //     "\nCustomer Name: " + log['customer_name'] +
      //     "\nCustomer HP: " + log['customer_hp'] +
      //     "\nCountry: " + log['country'] +
      //     "\nProvider: " + log['provider'] + "\n\n";
      //     // "\nBooking Expiry: " + log['booking_expiry'] +
      //
      // } else if (log && log.ic_bank_name != 0) {
      //   share_data = "eRemit Receipt" +
      //     "\nMerchant ID: " + this.tomain.merchantcode +
      //     // "\nBooking ID: " + log['booking_id'] +
      //     "\nPayment DateTime: " + log['booking_paidtime'] +
      //     // "\nBooking DateTime: " + log['booking_datetime'] +
      //     "\nTransaction ID.: " + log['remit_ref_trans_id'] +
      //     "\nPin No.: " + log['pin_number'] +
      //     "\nAmount Collected (RM): " + log['total_charge'] +
      //     "\nRemit Amount (RM): " + log['remit_rm_amt'] +
      //     "\nExchange Rate: " + log['remit_ex_rate'] +
      //     "\nForeign Currency: " + log['remit_foreign_currency'] +
      //     "\nForeign Amount: " + log['remit_foreign_amt'] +
      //     "\nService Charge (RM): " + log['service_change'] +
      //     "\nBeneficiary Name: " + log['bene_name'] +
      //     // "\nCard No.: " + log['bene_card_no'] +
      //     "\nCustomer Name: " + log['customer_name'] +
      //     "\nCustomer HP: " + log['customer_hp'] +
      //     "\nCountry: " + log['country'] +
      //     "\nProvider: " + log['provider'] +
      //     "\nBank Name: " + log['ic_bank_name'] +
      //     "\nAccount No.: " + log['ic_acc_number'] + "\n\n";
      //
      // } else if (!log) {
      //   this.alertHelper('Error', 'Error sharing. Param missing.', null, null);
      //   return;
      // }

      if (share_data) {

        await Share.share({
            text:share_data
        })
    //     this.socialSharing.share(share_data, null, null, null)
    //       .then((res) => {
    //         console.log(res);
    //         console.log('Shared via SharePicker');
    //       })
    //       .catch((err) => {
    //         this.alertHelper('Error', 'Error sharing.', null, null);
    //         console.log('Was not shared via SharePicker: ' + err);
    //       });
    //   } else {
    //     this.alertHelper('Error', 'Error sharing. Param missing[2].', null, null);
    //     return;
    //   }
      }
    } catch (ex) {
      this.alertHelper('Catch', ex.message, null, null);
    }

  }
  // endregion eremit


  async checkMsg3() {
    try {
      this.loggingProvider.postLog('Login', 'Remittance', this.tomain.merchantcode, 'authentication', 'auth_ok');
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'ELK Logging Error',
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
    }

  }


  checkMsg() {

  }


  checkMsg2() {
    let body = {
      merchant_code: this.tomain.merchantcode,
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    //console.log(body)
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    const options: HttpOptions = {
      url: myGlobals.url + '/login',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {

      try {

        if (data) {
          const alert = await this.alertCtrl.create({
            header: 'ELK Logging',
            message: 'Res ELK',
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
          console.log('Error logging');
        }

      } catch (e) {

        console.log("ELK Logging Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Elk Logging Ex Error',
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

      console.log("Elk logging ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'ELK Loggin Error',
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
  };

  onChangePaymentMethod() {
    console.log('gerere', this.paymentMethod)
  };


  back(){
    this.navCtrl.pop();
  }

  topupWalletScanQR(){

    this.barcodeScanner.scan().then(async barcodeData => {
      console.log('Barcode data', barcodeData);

        var regex = /^\d+$/;   
        if (barcodeData.cancelled == false && barcodeData.text.length == 0){
        const alert = await  this.alertCtrl.create({
            header: '',
            message: 'Invalid QR code, please try again.',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
            ]
          });
          await alert.present();
        } else {
           
            if(barcodeData.cancelled== false){
                let  qrData = barcodeData.text;

                if(qrData){

                    try{
                          this.loader = await this.loadingCtrl.create();
                           await this.loader.present();

                          let body = {

                            merchant_code: this.tomain.merchantcode,
                            password: this.tomain.password,
                            merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
                            appversion : myGlobals.version,
                            platform: this.platform.platforms()[0],
                            device:"ios",
                            qrvalue: qrData,
                            fid: 4 //  function id:Top-up user wallet
                             
                          };

                          const options: HttpOptions = {
                            url: myGlobals.url + '/GetUserDetails',
                            data: body,
                            method: 'POST',
                            connectTimeout: myGlobals.timeout,
                            headers: { 'Content-Type': 'application/json' }
                          }

                          Http.request(options).then(async (data:any) => {
                               try {
                                   await this.loader.dismiss();
                                   if(data.data.header.response_code == 0){

                                    if(data.body){

                                      if( data.body.aa_uuid == '' || data.body.aa_uuid == null || 
                                      data.body.prod_code == '' || data.body.prod_code == null) {
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

                                      this.toTopup.username = data.body.name;
                                      this.toTopup.mmappId = data.body.aa_uuid;
                                      this.toTopup.remark = data.body.prod_name;
                                      this.toTopup.merchant_id = data.merchant_code;
                                      this.toTopup.prod_code = data.body.prod_code;
          
                                    let modalPage = await this.modalCtrl.create({component:GmodalComponent, componentProps: { merchantcode: this.tomain.merchantcode,
                                    password: this.tomain.password, action: 6, data: this.toTopup}});
                                      
                                    modalPage.onDidDismiss();
                                    await modalPage.present();
                                   }
                                         
                                    }else{
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

                                   }else{

                                    const alert = await this.alertCtrl.create({
                                      header: 'Attention',
                                      message: data.header.response_description,
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
                          }).catch(async err =>{
                            await this.loader.dismiss();
                            console.log("ERROR evoucher redeem!: ", err);
                          const alert =await this.alertCtrl.create({
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
                        
                        } catch (e){
                           console.log('scan qr error',e);

                         const alert =await this.alertCtrl.create({
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
        // else if (barcodeData.text.length > 10 || barcodeData.text.length < 10) {
          // this.alertCtrl.create({
          //   title: 'Error',
          //   message: 'Invalid QR code.',
          //   buttons: [
          //     {
          //       text: 'OK',
          //       handler: () => {
          //       }
          //     }
          //   ]
          // }).present();
        // } 
        // else {
        //   this.topupwallet.cardno = barcodeData.text;

        //   console.log ("toupup value",this.topupwallet.cardno)
        // }

     }).catch(err => {
         console.log('Error', err);
     });
  }

  async topupWallet() {
    if (this.topupwallet.amount == 0) {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please key in amount to proceed.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
      await alert.present();

    } else if (this.topupwallet.cardno == '') {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please key in Card No. to proceed.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })

      await alert.present();

    } else if (this.topupwallet.pin == '') {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please key in PIN to proceed.',
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
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });

      await loading.present();

      let body = {
        appversion: myGlobals.version,
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        platform: this.platform.platforms()[0],
        device: "ios",
        amount: this.topupwallet.amount,
        cardno: this.topupwallet.cardno,
        tac: this.topupwallet.pin,
        ip: this.loggingProvider.myip != '' ? this.loggingProvider.myip : '0'
      };

      console.log(body);

      //  let headers = new Headers({ 'Content-Type': 'application/json' });
      //  let options = new RequestOptions({ headers: headers });

      const options: HttpOptions = {
        url: myGlobals.url + '/TopUpUserWalletT2P',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }

      Http.request(options).then(async (data: any) => {
        try {

          await loading.dismiss();

          if (data.data.header.response_code == 0) // value 1 = success
          {
            const alert = await this.alertCtrl.create({
              header: 'Success',
              message: data.data.header.response_description != '' ? data.data.header.response_description : '',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    this.topupwallet.amount = 0;
                    this.topupwallet.cardno = '';
                    this.topupwallet.pin = '';
                    this.navCtrl.pop();
                  }
                }
              ]
            })
            await alert.present();

          } else {
            const alert = await this.alertCtrl.create({
              header: 'TopUpUserWallet Error Code : ' + data.data.header.response_code,
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
          await loading.dismiss();
          console.log("TopUpUserWallet Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'TopUpUserWallet Ex Error',
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
        console.log("TopUpUserWallet ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'TopUpUserWallet Error',
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

  // added 8/9/2021 



  /*precheck checking */
  async saleInputChecking(form, actionid) {
    window.getSelection().removeAllRanges();

    if (!form.controls.country.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Country', this.country, 1)
      return;
    }
    if (!form.controls.provider.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Provider', this.provider, 1)
      return;
    }
    if (!form.controls.bank.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Bank', this.bank, 1)
      return;
    }

    /*    	if(!form.controls.cardno.valid){ */
    /*    		this.alertHelper('Invalid Sale Details','Please Enter Valid Card Number', this.cardno, 0) */
    /*    		return; */
    /*    	} */
    if (this.todo.cardno == "") {
      if (this.hidecardlist) {
        this.click2();
        return;
      }
      if (this.todisplay.selectedbenearray.length == 0) {
        if (this.checkIfCardByCountryExist()) {
          this.alertHelper('Invalid Sale Details', 'Please Select A Beneficiary', this.cardno, 0)
        } else {
          this.alertHelper('Invalid Sale Details', 'No Beneficiary for Country : ' + this.todo.country, this.cardno, 0)
        }
        return;
      }
      this.alertHelper('Invalid Sale Details', 'Please Select A Beneficiary', this.cardno, 0)
      return;
    }
    if (!form.controls.hpno.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Enter Valid HP Number', this.hpno, 0)
      return;
    }
    if (!form.controls.purpose.valid) {
      this.alertHelper('Invalid Sale Details', 'Please Select Valid Purpose', this.purpose, 1)
      return;
    }
    if (this.todo.purpose == '10') {
      if (!form.controls.otherpurpose.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Other Purpose', this.otherpurpose, 0)
        return;
      }
    }
    if (this.todo.purpose == '9') {
      if (!form.controls.sname.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Name', this.sname, 0)
        return;
      }
      if (!form.controls.srelat.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Relationship', this.srelat, 0)
        return;
      }
      if (!form.controls.scountry.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Country', this.sname, 0)
        return;
      }
      if (!form.controls.spassport.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Passport', this.spassport, 0)
        return;
      }
      if (!form.controls.sdob.valid || !this.isValidDate(form.controls.sdob.value)) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Date Of Birth', this.sdob, 0)
        return;
      }
      if (!form.controls.saddress.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Address', this.saddress, 0)
        return;
      }
      if (!form.controls.spurpose.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Sender\'s Purpose', this.spurpose, 0)
        return;
      }
      if (!form.controls.sdocument.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Select if Sender Able to Provide Document', this.sdocument, 1)
        return;
      }
    }

    if ((this.pinType == 'Flexible')) {
      if (!this.todo.amount || this.todo.amount == '0') {
        // if(!form.controls.amount.valid){
        this.alertHelper('Invalid Sale Details', 'Please Enter Valid Amount', this.amount, 0)
        return;
      } else {
        if (parseFloat(this.todo.amount) >= 3001 && this.todo.currency == 1) {
          if (this.todo.camount != this.todo.amount) {
            this.alertHelper('Invalid Sale Details', 'Please make sure the Amount is the same as Amount Confirmation', this.camount, 0)
            return;
          }
        } else {
        }
      }

      if (!this.todo.merchant_charge || this.todo.merchant_charge <= 0) {
        if (this.todo.country == 'Indonesia' && this.pinType == 'Flexible') {
          this.alertHelper('Invalid Charge(Ongkos)', 'Please enter valid charge.', null, 0);
          return;
        }
      }

      console.log('this.ongkosCheck.mm_cajkedai', this.ongkosCheck.mm_cajkedai);

      if (actionid == 2) { // issue precheck
        /*4/3/2022 added checking ongkos > 0 and <=50  */
        if (this.pinType == 'Flexible' && this.todo.country != 'Indonesia') {
          if (this.ongkosCheck.mm_cajkedai) {
            if (!this.todo.merchant_charge || this.todo.merchant_charge == 0)
            //|| (this.todo.merchant_charge < this.ongkosCheck.mm_cajkedai || this.todo.merchant_charge > 50)
            {
              this.alertHelper('Invalid Charge(Ongkos)', 'Please enter valid charge.', null, 0);
              return;

              // this.alertHelper('Invalid Charge(Ongkos)', 'Charge(Ongkos) must be at the range of RM ' + 
              //                 this.ongkosCheck.mm_cajkedai.toString() + ' AND RM 50.', null, 0);
            }
            //  else {
            //   merchant_charge = this.todo.merchant_charge.toString() + '|' + actionid.toString();
            // }

          } else {
            this.alertHelper('Invalid Sale Details', 'Invalid ongkos, please Semak Ongkos.', null, 0);
            return;
          }
        }
      }

    } else {
      if (!form.controls.pindeno.valid) {
        this.alertHelper('Invalid Sale Details', 'Please Select Valid Amount', this.pindeno, 1)
        return;
      }
    }

    // request to issuePrecheck API
    let loading = await this.loadingCtrl.create({
      message: 'PreChecking...'
    });

    await loading.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      pin_amount: (this.pinType == 'Flexible') ? this.todo.amount : 0,
      card_no: this.todo.cardno,
      customer_hp: this.todo.hpno,
      pin_denomination_id: (this.pinType == 'Flexible') ? 30 : this.todo.pindeno,
      remittance_purpose_id: this.todo.purpose,
      country: this.todo.country,
      provider: this.todo.provider,
      currency_type: (this.pinType == 'Flexible') ? this.todo.currency : 1,
      appversion: myGlobals.version,
      merchant_input_charge: this.todo.merchant_charge,
      platform: this.platform.platforms()[0],
      device: "ios",
      precheck_actionid: actionid.toString()
      // device_id: this.device.uuid,
      // device_info: this.platform['_ua'].toString(),
    };

    //console.log(body)
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    const options: HttpOptions = {
      url: myGlobals.url + '/IssueMoneyPinPreChecking',
      data: body,
      method: 'POST',
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {

        if (data.data.header.response_code == 0) {
          await loading.dismiss();
          if (actionid == 1) {  /*semak ongkos start */

            console.log('ongkos checking');
            console.log('amount in RM', data.data.body.myr_amount.toFixed(2));

            if (this.todo.currency == 1) { // sending in RM
              if (this.todo.amount) {
                this.getOngkos(true, this.todo.amount);
              } else {
                this.alertHelper("Invalid Sale Details", "Error get Amount. Please try again.", null, 0);
              }
            } else { // sending in home currency
              if (data.body.myr_amount.toFixed(2)) {
                this.getOngkos(true, data.data.body.myr_amount.toFixed(2)); //amt data from issuePrecheck response
              } else {
                this.alertHelper("Invalid Sale Details", "Error get Amount. Please Semak Ongkos again.", null, 0);
              }
            }
            // this.alertHelper('Hey hey','Semak ongkos', null, 0)
            // return;
            /*semak ongkos end */
          } else if (actionid == 2) {  /*issuePrecheck start */

            console.log('issuePrecheck');
            if (data.data.header.response_description.toUpperCase() != "OK" && data.data.header.response_description != "") {
              this.hidemsgattnsender2 = false;
              this.todisplay.msgattnsender2 = data.data.header.response_description;
              const alert = await this.alertCtrl.create({
                header: 'Attention : ',
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
              this.hidemsgattnsender2 = true;
              this.todisplay.msgattnsender2 = "";
            }

            this.todisplay.benename = data.data.body.bene_name;
            this.todisplay.sendamount = data.data.body.sending_amount;
            this.todisplay.currencyinquestion = data.data.body.sending_currency;
            this.todisplay.exrate = data.data.body.ex_rate;
            this.todisplay.pinamount = data.data.body.mpin_value.toFixed(2);
            this.todisplay.keyinamount = data.data.body.keyin_amt.toFixed(2);
            this.todisplay.servicecharge = data.data.body.service_charge.toFixed(2);
            this.todisplay.gst = (data.data.body.hasOwnProperty('gst')) ? data.data.body.gst.toFixed(2) : (new Date("2018-06-01") >= new Date(data.data.header.timestamp)) ? (0).toFixed(2) : this.round10(parseFloat(data.data.body.service_charge) * 6 / 106, -2).toFixed(2); //(0).toFixed(2);//this.round10(parseFloat(data.body.service_charge) * 6 / 106,-2).toFixed(2);
            this.todisplay.gst_percent = (data.data.body.hasOwnProperty('gst_percent')) ? data.data.body.gst_percent : (new Date("2018-06-01") >= new Date(data.data.header.timestamp)) ? '0%' : '6%';
            this.todisplay.totalamount = data.data.body.collect_amt.toFixed(2)
            this.saleType = 'AfterSale';
            this.todo.tac = '';
            this.list.scrollToTop();

            // this.alertHelper('Yo hooo','issueprecheck', null, 0)
            // return;
          }
          /*issuePrecheck end */

        } else {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Sale Precheck Error Code : ' + data.data.header.response_code,
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
        await loading.dismiss();
        console.log("Sale Precheck Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Sale Precheck Ex Error',
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
      console.log("ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Sale Precheck Error',
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

  /*added 1/3/2022*/
  async getOngkos(bool, amount_myr) {
    console.log('isloading', bool);
    this.todo.merchant_charge = 0;
    if (this.todo.amount == '') {
      //this.todo.amount = '0';
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Please key in amount to semak ongkos.',
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
      let loading = await this.loadingCtrl.create({
        message: 'Retrieving Ongkos...'
      });
      if (bool) {
        await loading.present();
      }

      if (this.todisplay.selectedbenearray[9]) {
        console.log('pickup method flag', this.todisplay.selectedbenearray[9]);
      }

      console.log('pickup method', this.todo.pickup_method);

      if (this.todisplay.selectedbenearray[9] == '') {
        this.alertHelper("Error", "Internal Error. Please select card again.", null, 0);
      }

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios",
        amount: amount_myr, // this.todo.amount,
        country_abbr: this.todo.provider,
        pickup_method: this.todo.pickup_method,
        pickup_method_flag: this.todisplay.selectedbenearray[9] != '' ? this.todisplay.selectedbenearray[9] : '',
        country: this.todo.country
      };

      const options: HttpOptions = {
        url: myGlobals.url + '/GetOngkos',
        data: body,
        method: 'POST',
        connectTimeout: myGlobals.timeout,
        headers: { 'Content-Type': 'application/json' }
      }

      Http.request(options).then(async (data: any) => {
        try {

          if (bool) {
            await loading.dismiss();
          }

          if (data.data.header.response_code == 0) {
            this.ongkosCheck.is_allowFlexibleOngkos = data.data.body.is_allowflexibleongkos;
            this.ongkosCheck.mm_cajkedai = data.data.body.mm_cajkedai;
            this.todo.merchant_charge = data.data.body.ongkos;
            this.isAmountDisabled = true; // locked amount field

            if (data.data.body.is_allowflexibleongkos == 1) {
              this.isOngkosDisabled = false;
            } else {
              this.isOngkosDisabled = true;
            }

            console.log('isAmountEditable', this.isAmountDisabled);
            console.log('isOngkosDisabled', this.isOngkosDisabled);

            // if(data.body.is_allowflexibleongkos && data.body.is_allowflexibleongkos == 1){ // allow 
            //   this.todo.merchant_charge = data.body.ongkos;
            //   console.log('ongkos',  data.body.ongkos);
            //   console.log('ongkos2', this.todo.merchant_charge);

            // } else {
            //    this.todo.merchant_charge = data.body.mm_cajkedai;
            //    console.log('ongkos',  data.body.mm_cajkedai);
            //    console.log('ongkos2', this.todo.merchant_charge);
            // }
          } else {
            this.todo.merchant_charge = 0;
            const alert = await this.alertCtrl.create({
              header: 'Get Ongkos Error Code : ' + data.data.header.response_code,
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
          if (bool) {
            await loading.dismiss();
          }
          console.log("Get Ongkos Ex ERROR!: ", e);
          this.todo.merchant_charge = 0;
          const alert = await this.alertCtrl.create({
            header: 'Get Ongkos Ex Error',
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
        if (bool) {
          await loading.dismiss();
        }
        console.log("Get Ongkos ERROR!: ", err);
        this.todo.merchant_charge = 0;
        const alert = await this.alertCtrl.create({
          header: 'Get Ongkos Error',
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

  /*added 1/3/2022*/
  onRemitAmountChange(e) {
    // setTimeout(()=>{ 
    //  if (this.todo.country!='Indonesia'){
    //   this.alertCtrl.create({
    //     title: 'Amount changed!' + e,
    //     message: 'Amount: ' + this.todo.amount,
    //     buttons: [
    //       {
    //         text: 'OK',
    //         handler: () => {
    //         }
    //       }
    //     ]
    //    }).present();
    //   } else {
    //     this.alertCtrl.create({
    //       title: 'Indonesia' + e,
    //       message: 'No changes',
    //       buttons: [
    //         {
    //           text: 'OK',
    //           handler: () => {
    //           }
    //         }
    //       ]
    //     }).present();
    //   }
    // },2000)  
  }

  isAllowFlexibleOngkos() {
    if (this.ongkosCheck.is_allowFlexibleOngkos == 1) { // allow to edit
      return false;
    } else {
      return true;
    }
  }

  onChangeCurrency(e) { // reset the charge value when currency is changed
    
    if (this.todo.country != 'Indonesia') {
      this.todo.merchant_charge = 0;
      this.ongkosCheck.mm_cajkedai = 0;
    }
  }

  resetAmount() {
    this.todo.amount = '';
    this.todo.camount = '';
    this.todo.merchant_charge = 0;
    this.ongkosCheck.is_allowFlexibleOngkos = -1;
    this.ongkosCheck.mm_cajkedai = 0;
    this.isAmountDisabled = false;

  }

  onIndonPinChange(pin_deno) {
    for(let i = 0; i < this.pinarray.length; i++) {
      if(this.pinarray[i][0] == pin_deno) {
       this.todo.merchant_charge = this.pinarray[i][2];
      //  console.log('this.pinarray[i][2];', this.pinarray[i][2]);
      //  console.log('this.pinarray[i][2];', this.pinarray[i][0]);
      }  
    }

    // console.log('pin deno', pin_deno);
    // console.log('pin deno', this.todo.merchant_charge);
  }

}