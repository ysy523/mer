import { ActivatedRoute } from '@angular/router';
import { PrinterListModalPage } from './../printer-list-modal/printer-list-modal.page';
import { PrepaidmodalComponent } from './../prepaidmodal/prepaidmodal.component';

import { Component, OnInit } from '@angular/core';
import { Platform, NavController, NavParams, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import * as myGlobals from '../../services/global';
import * as SecureLS from 'secure-ls';
import { PrintService } from '../../services/print/print.service';

import { loggingService } from '../../services/logging/logging.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-prepaid',
  templateUrl: './prepaid.component.html',
  styleUrls: ['./prepaid.component.scss'],
})
export class PrepaidComponent implements OnInit {

  showversion = ''
  telcolist = '';
  telcoArray = [];  
  selectedTelcoArray = []; // added 18/4/2022
  selectedTelco:any = [];
  denolist = '';
  denoArray = [];
  selectedDenoArray = [];
  hdummyarray = '';
  tomain = {
    merchantcode: '',
    password: ''
  }
  prepaid:any= {
    telco: '',
    deno_description: '',
    deno_prod_id: 0,
    mobileno: '',
    tac: '',
    topupType: 1,
    telco_provider: '',
    value: ''
    // value = 0
  }
  selectedDeno = {};

  loader: any;
  page_section = 'sales';
  selectedPrinter: any = [];
  toPrintTemplate = '';

  prepaidResp = {
    trans_id: '',
    pin_string: '',
    pin_serial: '',
    pin_key_string: '',
    ppin_ean_code: '',
    pin_expiry_date: '',
    is_gst: 0,
    footer: '',
    pin_value: '',
    telco: '',
    timestamp: ''
  }
  deno = [];
  ip = '';

  telcoType = [
    {'type': 1, 'name': 'eReload'},
    {'type': 0, 'name': 'Prepaid'}
  ]; //added 18/4/2022

  MyDefaultYearIdValue : number ;

  jsonstring;
  softpintype_list = '';
  softpintypeArr = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private platform: Platform, private alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private PrintService: PrintService,
    private modalCtrl: ModalController, private loggingService: loggingService ,private route:ActivatedRoute)
  {
   this.route.queryParams.subscribe(params =>{

    this.showversion = myGlobals.version;
    this.tomain.merchantcode = params['merchantcode'];
    this.tomain.password = params['password'];

   })
    
  }

  ngOnInit() {


    console.log('ionViewDidLoad PrepaidPage');
    this.loggingService.getIP().then((res) => {
    
      this.ip = res.toString();
      console.log('get ip con');
      console.log(this.ip);
    })
    // this.getTelco();
    this.getTelcoIIMMPACT();


  }

  ngAfterViewInit(){
    

  }

  async getTelco() {
    this.loader = await this.loadingCtrl.create();
    await this.loader.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device:this.platform.win.navigator.userAgent.toString()
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    const option: HttpOptions = {
      url: myGlobals.url + '/GetSoftPinTelco',
      data: body,
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      connectTimeout: myGlobals.timeout
    }


    Http.request(option).then(async (data: any) => {

      // console.log("-----getTelco-----",data.data)
      try {
        await this.loader.dismiss();

        if (data.data.header.response_code == 0) {
          if (data.data.body.telco_list) {
            this.telcolist = data.data.body.telco_list;
            this.telcoArray = JSON.parse(data.data.body.telco_list);


            for (let x = 0; x < this.telcoArray.length; x++) {
              this.deno.push(JSON.parse(this.telcoArray[x]['deno_list']));
            }

            console.log("deno deno",this.deno);
            console.log(this.deno[1]);
            console.log(this.deno[1][0]);

            for (let x = 0; x < this.deno.length; x++) {
              for (let y = 0; y < this.deno[x].length; y++) {
                this.denoArray.push(this.deno[x][y]);
              }
            }

            console.log(this.denoArray);

            this.prepaid.telco = this.telcoArray ? this.telcoArray[0]['telco'] : ''; //selected telco 
            this.telcoSelected(); // get deno list of first telco as default value list

          } else {

            const alert = await this.alertCtrl.create({
              header: 'Get Telco Error: ' + data.data.header.response_code,
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
        } else {

          await this.loader.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Get Telco Error Code : ' + data.data.header.response_code,
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
        console.log("Telco Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Telco Ex Error',
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
        header: 'Telco Error',
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


  telcoSelected() {
    
    //this.prepaid.deno_prod_id = this.denoArray ? this.denoArray[0]['prod_id'] : 0;

    for (let i = 0; i < this.denoArray.length; i++) {
      if (this.denoArray[i]['telco'] == this.prepaid.telco) {
        this.prepaid.deno_prod_id = this.denoArray[i]['prod_id'];
        break;
      }
    }

    for (let i = 0; i < this.denoArray.length; i++) {
      if (this.denoArray[i]['prod_id'] == this.prepaid.deno_prod_id) {
        this.prepaid.deno_description = this.denoArray[i]['pin_value'];
        console.log("deno array", this.prepaid.deno_description )
        break;
      }
    }

    // var templist = [];
    // for(let y = 0; y<this.denoArray.length;y++){
    //   if(this.prepaid.telco == this.denoArray[y]['telco']){
    //     templist.push(this.denoArray[y]); 
    //     this.prepaid.deno_prod_id = templist ? templist[0]['prod_id'] : 0;
    //   }
    // }

    // console.log(templist);
    // this.denoArray = [];
    // this.denoArray = templist;

  }


  pop(){
       this.navCtrl.pop()
  }

 

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  // get denomination list
  async telcoSelected2() {
    if (this.prepaid.telco == '' || this.prepaid.telco == null) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please select telco',
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

      this.loader =  await this.loadingCtrl.create();
      await this.loader.present();

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: this.platform.win.navigator.userAgent.toString(),
        telco_name: this.prepaid.telco
      };
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });

      const option: HttpOptions = {
        url: myGlobals.url + '/GetSoftPinDeno',
        data: body,
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        connectTimeout: myGlobals.timeout
      }

      Http.request(option).then(async (data: any) => {
        try {
           await this.loader.dismiss();

          if (data.data.header.response_code == 0) {
            if (data.data.body.deno_list) {
              this.denolist = data.data.body.deno_list;

              this.denoArray = this.denolist.split('|');
              for (let x = 0; x < this.denoArray.length; x++) {
                this.hdummyarray = this.denoArray[x];
                this.denoArray[x] = this.hdummyarray.split(',');
              }
              this.prepaid.deno_prod_id = this.denoArray ? this.denoArray[0][0] : 0;

              for (let i = 0; i < this.denoArray.length; i++) {
                if (this.denoArray[i][0] == this.prepaid.deno_prod_id) {
                  this.prepaid.deno_description = this.denoArray[i][1];
                }
              }

            }
            else {
             await this.loader.dismiss();
              const alert = await this.alertCtrl.create({
                header: 'Get Deno Error: ' + data.data.header.response_code,
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

          } else {
            await this.loader.dismiss();
            const alert = await this.alertCtrl.create({
              header: 'Get Deno Error Code : ' + data.data.header.response_code,
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

         await this.loader.dismiss();
          console.log("Telco Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'Telco Ex Error',
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

        await this.loader.dismiss();
        console.log("ERROR!: ", err);
        const alert = await this.alertCtrl.create({
          header: 'Telco Error',
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


 async next() {

  console.log("next",this.prepaid.value)

   
    if(this.prepaid.mobileno == '' || this.prepaid.mobileno.toString().length < 10 || !String(this.prepaid.mobileno).startsWith("01")) {
     const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please key in valid customer mobile no.',
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
    else if(this.prepaid.telco == '') {
     const alert= await this.alertCtrl.create({
        header: 'Error',
        message: 'Please select telco.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      })
     await alert.present();
    } else if(this.prepaid.value == 0 || this.prepaid.value == null) {
     const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please select amount or enter amount.',
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
    else {
       this.page_section = 'confirmation';
    }
  }



  denoSelected(deno) {
      
        // let selected =  this.denoArray.find((f)=>{
        //     return f.pin_deno === deno
        //  })

        //  this.prepaid.value= selected
    
    // for(let i = 0; i < this.denoArray.length; i++) {
    //   //console.log(this.denoArray[i]['prod_id']);
    //   if(this.denoArray[i]['prod_id'] == this.prepaid.deno_prod_id) {
    //     this.prepaid.value = this.denoArray[i]['pin_value'];

    //     console.log ("selected deno",i)
    //   }  
    // }
  }

  previous() {
    this.page_section = 'sales';
    this.prepaid.tac = '';
  }

  async submit() {
    if(this.prepaid.tac == '') {
    const alert = await  this.alertCtrl.create({
        header: 'Error',
        message: 'Please key in PIN to proceed.',
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
      let loading = await this.loadingCtrl.create({
          message: 'Please wait...'
      });

      await loading.present();

        /* 
        "appversion":"0.0.27",
        "merchant_code":"73016293", 
        "password":"desmondverycute",
        "merchant_trans_id":"20210210064303",
        "platform":"android", 
        "device":"r7s",
        "pin_value":"5.00",
        "customer_hp":"0179822155",
        "pin_prod_id":"3005",
        "telco":"Celcom",
        "tac":"123455" 
        */
        
      let body = {
        appversion : myGlobals.version,
        merchant_code : this.tomain.merchantcode,
        password : this.tomain.password,
        merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
        platform:this.platform.platforms()[0],
        device: this.platform.win.navigator.userAgent.toString(),
        pin_value: this.prepaid.value,
        customer_hp : this.prepaid.mobileno,
        pin_prod_id: this.prepaid.deno_prod_id,
        telco: this.prepaid.telco,
        tac : this.prepaid.tac,
        ip: this.ip!= '' ? this.ip : '0' // modified 8/9/2021
        //ip: this.ip != null ? this.ip : '0'
      };

   
      //console.log(body)

      const option :HttpOptions ={
        url:myGlobals.url + '/IssuePrepaidSoftPin',
        data:body,
        method:"POST",
        headers: {'Content-Type': 'application/json' },
        connectTimeout: myGlobals.timeout}

        Http.request(option).then(async(data:any)=>{
                   try{

                    await loading.dismiss();

                    console.log('IssueSoftPin : ', data);
                    console.log(data.data.body);

                     if(data.data.header.response_code == 1){ //value 1 =success
                          try{

                            this.prepaidResp.trans_id = data.data.body.trans_id;
                            this.prepaidResp.pin_string = data.data.body.pin_string;
                            this.prepaidResp.pin_serial = data.data.body.pin_serial;
                            this.prepaidResp.pin_key_string = data.data.body.pin_key_string;
                            this.prepaidResp.ppin_ean_code = data.data.body.ppin_ean_code;
                            this.prepaidResp.pin_expiry_date = data.data.body.pin_expiry_date;
                            this.prepaidResp.is_gst = data.data.body.is_gst;
                            this.prepaidResp.footer = data.data.body.footer; 
                            this.prepaidResp.pin_value = data.data.body.pin_value;
                            this.prepaidResp.telco = data.data.body.telco;
                            this.prepaidResp.timestamp = data.data.body.timestamp;

                            // push to receipt page 

                      var dt =  this.prepaidResp.timestamp.toString();
                      dt = dt.replace('T', ' ');
                      var arr = dt.split('.');
                      dt = arr[0];
                      dt = dt.replace('.', '');
                      this.prepaidResp.timestamp = dt;

                      let receiptModal = await this.modalCtrl.create({component: PrepaidmodalComponent, componentProps:{ from: 'new', data: this.prepaidResp, merchantcode : this.tomain.merchantcode, password : this.tomain.password}});
                      
                      receiptModal.onDidDismiss().then(data => {
                        this.navCtrl.pop();
                      })
                      
                      await receiptModal.present();
      

                          }catch (err){

                           const alert = await this.alertCtrl.create({
                              header: 'BuyPrepaid get receipt error ',
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

                          }

                     }else {

                     const alert =await this.alertCtrl.create({
                        header: 'BuyPrepaid Sale Error Code : ' + data.data.header.response_code ,
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

                    await loading.dismiss();
                    console.log("BuyPrepaid Sale Ex ERROR!: ", e);
                    const alert = await this.alertCtrl.create({
                        header: 'BuyPrepaid Sale Ex Error',
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
                 

        }).catch(async err =>{

          await loading.dismiss();
          console.log("BuyPrepaid Sale ERROR!: ", err);
         const alert = await this.alertCtrl.create({
              header: 'BuyPrepaid Sale Error',
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




 async listBTDevice() {
    const FONT_RESET = "\u001b\u0021\u0000";
    const FONT_DOUBLE_WIDTH_ONLY = "\u001b\u0021\u0020";
    const FONT_DOUBLE_HEIGHT_ONLY = "\u001b\u0021\u0010";
    const FONT_DOUBLE_HEIGHT_WIDTH = "\u001b\u0021\u0030";
    const FONT_DOUBLE_HEIGHT_WIDTH_BOLD = "\u001b\u0021\u0038";
    const FONT_SMALL = "\u001b\u0021\u0001";
    const FONT_SMALL_DOUBLE_WIDTH = "\u001b\u0021\u0021";
    const BARCODE_COMMAND_HRI_FONT_SMALL = "\u001D\u0066\u0001";
    const BARCODE_COMMAND_HRI_ON ="\u001D\u0048\u0002";
    const BARCODE_COMMAND_HRI_OFF ="\u001D\u0048\u0000";
    const BARCODE_COMMAND_START = "\u001D\u006B\u0002";
    const BARCODE_COMMAND_END = "\u0000";
    const BARCODE_COMMAND_DOUBLE_WIDTH = "\u001D\u0077\u0004";
    const BARCODE_COMMAND_HEIGHT =  "\u001D\u006B\u0032";

    this.PrintService.searchBt().then(async datalist => {
      console.log('search: ' + datalist);
      console.log(datalist);

      if(datalist.length === 0) {
        let xyz = await this.alertCtrl.create({
          header: '',
          buttons:  [
            {
              text: 'No available printer.',
              handler: () => {
              
              }
            }
          ]
        });
        xyz.present();
        return;
      }

      //1. Open printer select modal
      let abc= await this.modalCtrl.create({component:PrinterListModalPage,componentProps:{data:datalist}});

      //2. Printer selected, save into this.selectedPrinter
      abc.onDidDismiss().then (async (data:any)=>{
        console.log(data);

        if(data) {
          this.selectedPrinter=data;
          var ls = new SecureLS({encodingType: 'aes'});
          ls.set('printer', this.selectedPrinter);
          console.log('Printer ID ' + this.selectedPrinter.id);

          let xyz = await this.alertCtrl.create({
            header: data.name + " selected",
            buttons:  [
              {
                text: 'OK',
                handler: () => {
                  console.log('print after connect to printer');
                  this.toPrintTemplate = FONT_RESET + FONT_DOUBLE_HEIGHT_WIDTH_BOLD + 'TEST PRINTER'  +
                  " RM 100" + FONT_RESET +
                  "\nTarikh: 20200221" +
                  "\nTxn: 1231111331" +
                  "\nHP: 0179822155" +
                  "\nJenis Pin: prepaid pin " + "\n\n" +
                  "\n" + FONT_SMALL + "(REPRINT CUSTOMER COPY)\n\n\n";

                  let foo=this.PrintService.testPrint(this.selectedPrinter.id, data, this.toPrintTemplate, null);


                }
              }
            ]
          });
         await xyz.present();
        } else {
          let xyz = await this.alertCtrl.create({
            header: "No printer selected",
            buttons: ['Dismiss']
          });
         await xyz.present();
        }
      });

      //0. Present Modal
      await abc.present();

    }, async err=>{
      console.log("ERROR",err);
      let mno=  await this.alertCtrl.create({
        header:"ERROR "+err,
        buttons:['Dismiss']
      });
     await mno.present();
    })

  }

   // iimmpact start

  async topupTypeSelected(e:any) {
    // console.log('selected topup type', this.prepaid.topupType);
    this.getTelcoIIMMPACT();
    if(this.telcoArray) {
      for(let x = 0; x<this.telcoArray.length;x++)
      {
        // console.log('b4',this.telcoArray[x]);
        if(this.telcoArray[x].is_ereload == this.prepaid.topupType) {
          // console.log('after',this.telcoArray[x]);
          // this.selectedTelcoArray.push(this.telcoArray[x]);  
          this.prepaid.telco = this.telcoArray[x]['telco'];
          this.prepaid.telco_provider = this.telcoArray[x]['telco_provider'];
          break;
        } 
      } 
      // console.log(this.prepaid.telco);
      
      // console.log('b5');
      // console.log(this.selectedTelcoArray);
      // this.prepaid.telco = this.selectedTelcoArray[0]['telco']; //take the first one as selected telco
      // console.log(this.prepaid.telco);
    } else {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Error get telco, please try again.',
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


 async getTelcoIIMMPACT() {
    this.loader = await this.loadingCtrl.create();
    await this.loader.present();

    let body = {
      merchant_code: this.tomain.merchantcode,
      password: this.tomain.password,
      merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
      appversion : myGlobals.version,
      platform: this.platform.platforms()[0],
      device: this.platform.win.navigator.userAgent.toString()
    };

    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });


    const options:HttpOptions ={
      headers : {'Content-Type':'application/json'},
      url : myGlobals.url + '/GetSoftPinTelcoIIMMPACT',
      data: body,
      method:"POST",
      connectTimeout: myGlobals.timeout
}
    Http.request(options).then(async(data:any)=>{
      try {
        await this.loader.dismiss();

        console.log('GetTelco : ',data);
        if(data.data.header.response_code == 0 && data.data.body.telco_list)
        {
          if(data.data.body.telco_list) {
            this.telcolist = data.data.body.telco_list;
            this.telcoArray = JSON.parse(data.data.body.telco_list);

            // for(let x = 0; x<this.telcoArray.length;x++)
            // {
            //   this.deno.push(JSON.parse(this.telcoArray[x]['deno_list']));  
            // }

            // console.log(this.deno);
            // console.log(this.deno[1]);
            // console.log(this.deno[1][0]);

            // for(let x = 0; x<this.deno.length;x++)
            // {
            //   for(let y = 0; y<this.deno[x].length;y++){
            //     this.denoArray.push(this.deno[x][y]);
            //   }
            // }
            // console.log(this.denoArray);
            if(this.prepaid.topupType == 0) {  // prepaid
              var result = this.telcoArray.filter(obj => {
                return obj.is_ereload === 0;
              })
              this.selectedTelco = result[0];
              this.prepaid.telco = result ? result[0]['telco'] : ''; //selected telco
              this.prepaid.telco_provider = result ? result[0]['telco_provider'] : '';

            } else if (this.prepaid.topupType == 1) { // ereload
              this.prepaid.value ='';
              var result = this.telcoArray.filter(obj => {
                return obj.is_ereload === 1;
              })
              this.selectedTelco = result[0];
              this.prepaid.telco = result ? result[0]['telco'] : ''; //selected telco
              this.prepaid.telco_provider = result ? result[0]['telco_provider'] : '';

              
            }
            
            
            this.getDenoIIMMPACT();
            // this.telcoSelected(); // get deno list of first telco as default value list
          }
          else {
            const alert = await this.alertCtrl.create({
              header: 'Get Telco Error: ' + data.data.header.response_code ,
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

        } else {
          await this.loader.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Get Telco Error Code : ' + data.data.header.response_code ,
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
        console.log("Telco Ex ERROR!: ", e);
       const alert = await this.alertCtrl.create({
          header: 'Telco Ex Error',
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
        header: 'Telco Error',
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

  telcoSelectedIIMMPACT(e:any){

    console.log ("impact",e)
    
    var result = this.telcoArray.filter(obj => {
      return obj.telco === e
    })

  

    this.selectedTelco = result[0];
    this.getDenoIIMMPACT();
  }


  async getDenoIIMMPACT() {

    if (this.prepaid.telco) {

      this.loader =  await this.loadingCtrl.create();
      await this.loader.present();

      let body = {
        merchant_code: this.tomain.merchantcode,
        password: this.tomain.password,
        merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
        appversion: myGlobals.version,
        platform: this.platform.platforms()[0],
        device: this.platform.win.navigator.userAgent.toString(),
        telco_name: this.prepaid.telco,
        telco_provider: this.prepaid.telco_provider
      };


      const options: HttpOptions = {
        headers: { 'Content-Type': 'application/json' },
        url: myGlobals.url + '/GetSoftPinDenoIIMMPACT',
        data: body,
        method: "POST",
        connectTimeout: myGlobals.timeout
      }

      Http.request(options).then(async (data: any) => {
        try {
          await this.loader.dismiss();

          console.log('get deno : ', data);
          if (data.data.header.response_code == 0 && data.data.body.deno_list) {
            if (data.data.body.deno_list != null || data.data.body.deno_list != '') {

              this.denoArray = JSON.parse(data.data.body.deno_list);
              if (this.selectedTelco['is_denomination'] == 1) {// select the default value only when got denomination
                this.prepaid.value = this.denoArray ? this.denoArray[0]['pin_deno'] : '';
              }
              this.prepaid.deno_prod_id = this.denoArray ? this.denoArray[0]['prod_id'] : '';

              // console.log('denoArr', this.denoArray);
              // console.log('selectedTelco', this.selectedTelco['telco']);

              // var result = this.denoArray.filter(obj => {
              //   return obj.telco === this.selectedTelco['telco'] && obj.pin_deno === this.selectedTelco['telco'];
              // })

              // this.prepaid.deno_prod_id = result ? result[0]['prod_id'] : '';
              // console.log('denoArr', this.prepaid.deno_prod_id);
              // console.log('res', result);

              //this.prepaid.deno_prod_id = this.denoArray ? this.denoArray[0]['prod_id'] : ''; //selected default deno 
              // if(this.denoArray) {
              //   for(let x = 0; x<this.denoArray.length;x++)
              //   {
              //     if(this.denoArray[x].telco == this.selectedTelco['telco'])
              //       this.selectedDenoArray.push(JSON.parse(this.denoArray[x]));  
              //   } 
              //   console.log(this.selectedDenoArray);

              // } else {
              //   this.alertCtrl.create({
              //     title: '',
              //     message: 'Error get denomination, please try again.',
              //     buttons: [
              //       {
              //         text: 'OK',
              //         handler: () => {
              //         }
              //       }
              //     ]
              //   }).present();
              // }
            }
            else {
              this.denoArray = [];
              const alert = await this.alertCtrl.create({
                header: 'Get Deno Error: ' + data.data.header.response_code,
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

          } else {
            await this.loader.dismiss();
            // console.log('error', data.data.header.response_description);
            const alert = await this.alertCtrl.create({
              header: 'Get Deno Error Code : ' + data.data.header.response_code,
              message: 'Failed to get data, please try again.',
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
          console.log("Deno Ex ERROR!: ", e);
          const alert = await this.alertCtrl.create({
            header: 'Deno Ex Error',
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
            header: 'Deno Error',
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
        message: 'Please select telco',
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
  // iimmpact end




}