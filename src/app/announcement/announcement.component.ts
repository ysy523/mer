import { ActivatedRoute } from '@angular/router';
import { Component, OnInit,Input } from '@angular/core';
import * as myGlobals from '../../services/global'
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import {  NavController, NavParams, ToastController, Platform, LoadingController, AlertController ,ModalController} from '@ionic/angular';
@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
})
export class AnnouncementComponent implements OnInit {

  type = '';
  pin = '';
  cpin = '';
  tac = '';
  tomain = {
    merchantcode : '',
    password : ''
  }
  isTacRequested = false;
  accepted:boolean = false;
  descrip  ='';
  sub_descrip = '';
  pages:number = 1;
  descrip_cn ='';
  descrip_en = '';
  sub_descrip_cn ='';
  sub_descrip_en ='';
  des_title= '';
  des_title_cn = '';
  des_title_en = '';
  a_content = '';
  a_content_my ='';
  a_content_cn ='';
  a_content_two = '';
  a_content_two_my = '';
  a_content_two_cn = '';
  a_title = '';
  b_title ='';
  // @Input() type:any
  // @Input() profile:any

  constructor(public navParams: NavParams,private toastCtrl: ToastController
    ,private platform: Platform,public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public modalCtrl:ModalController ,private route:ActivatedRoute) 
    { 
      //  this.route.queryParams.subscribe(params=>{

      //   this.type =  params['type'];
      //   this.tomain.merchantcode = params['profile'].merchantcode;
      //   this.tomain.password = params['profile'].password;
         
           
      //  })
      this.type = navParams.data.type;
      this.tomain.merchantcode = navParams.data.profile.merchantcode;
      this.tomain.password = navParams.data.profile.password;

    }

  ngOnInit() {

    if(this.type =='3'){
      this.showDis();
    }

    console.log('ionViewDidLoad AnnouncementPage');
    console.log(this.type);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  handleAccept(){
    
    this.pages = 2;
   
  }
  handleAccept1(){

    this.pages = 3;
   }

   handleAccept2(){
    this.dismiss();
 }


 async showDis() {

  let body = {
    merchant_code: this.tomain.merchantcode,
    password: this.tomain.password,
    merchant_trans_id: this.tomain.merchantcode + new Date().valueOf(),
    appversion: myGlobals.version,
    platform: this.platform.platforms()[0],
    device: this.platform.win.navigator.userAgent.toString(),
    action_id:520,
    input: { "ok": 1, "action": 'okok' }
  };

  let loading = await this.loadingCtrl.create({
    message: 'Please wait...'
  });
  await loading.present();

  console.log("--- body ---", body)

  const options: HttpOptions = {
    url: myGlobals.url + '/ProcessMerchant',
    data: body,
    method: 'POST',
    connectTimeout: myGlobals.timeout,
    headers: { 'Content-Type': 'application/json' }
  }


  Http.request(options).then(async (data: any) => {
    try {
      await loading.dismiss();
      console.log ("data....",data)
      if (data.data.header.response_code == 0) {
        if (data.data.body) {
          if (data.data.body.outputlist) {

            this.descrip = data.data.body.outputlist.desc
            this.sub_descrip = data.data.body.outputlist.sub_desc
            this.sub_descrip_cn = data.data.body.outputlist.sub_desc_cn
            this.sub_descrip_en = data.data.body.outputlist.sub_desc_en
            this.descrip_cn = data.data.body.outputlist.desc_cn
            this.descrip_en = data.data.body.outputlist.desc_en
            this.des_title = data.data.body.outputlist.title
            this.des_title_cn = data.data.body.outputlist.title_cn
            this.des_title_en = data.data.body.outputlist.title_en
            this.a_content = data.data.body.outputlist.a_content.replace(/\r\n/g, '<br style="margin: 10px 0;">')
            this.a_content_my = data.data.body.outputlist.a_content_my.replace(/\r\n/g, '<br style="margin: 10px 0;">')
            this.a_content_cn = data.data.body.outputlist.a_content_cn.replace(/\r\n/g, '<br style="margin: 10px 0;">')
            this.a_content_two = data.data.body.outputlist.a_content_two.replace(/\r\n/g, '<br style="margin: 10px 0;">')
            this.a_content_two_my = data.data.body.outputlist.a_content_my_two.replace(/\r\n/g, '<br style="margin: 10px 0;">')
            this.a_content_two_cn = data.data.body.outputlist.a_content_cn_two.replace(/\r\n/g, '<br style="margin: 10px 0;">')
            this.a_title = data.data.body.outputlist.a_title.replace(/\\/g, '')
            this.b_title = data.data.body.outputlist.b_title.replace(/\\/g, '')

          }
        }
      }
    } catch (e) {

      await loading.dismiss();
      console.log("Get disclaimer Ex ERROR!: ", e);
      const alert = await this.alertCtrl.create({
        header: 'Get disclaimer Ex Error',
        message: e + 'Please try again.',
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
    console.log("Execption annoucement: ", err);
    const alert = await this.alertCtrl.create({
      header: 'Get disclaimer Exception',
      message: err + 'Please try again.',
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




 async getTac() {
  
    if(this.checkPin() === true){
      // request TAC
      let loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });
     await  loading.present();

      let body = {
        merchant_code : this.tomain.merchantcode,
        password : this.tomain.password,
        merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
        appversion : myGlobals.version,
        platform: this.platform.platforms()[0],
        device: "ios"
      };
      //console.log(body)
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({ headers: headers });

      const options:HttpOptions={
            url:myGlobals.url + '/GenerateTAC',
            data:body,
            method:'POST',
            connectTimeout:myGlobals.timeout,
            headers:{'Content-Type': 'application/json'}
      }

      Http.request(options).then(async(data:any)=>{
            try {
                  await loading.dismiss();

                  if(data.data.header.response_code == 0)
                  {
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
      
            }else{

             const alert = await this.alertCtrl.create({
                header: 'GenTac Error Code : ' + data.data.header.response_code ,
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
              console.log("GenTac Ex ERROR!: ", e);
            const alert = await  this.alertCtrl.create({
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
          
      }).catch (async err=>{
            
       await loading.dismiss();
        console.log("GenTac ERROR!: ", err);
     const alert =await this.alertCtrl.create({
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



}}


async createPin() {
  this.tac = this.tac.replace(/\s/g, "");
  if(!this.tac){
    this.displaymsg('Please insert TAC');
  }

  if(this.tac && this.checkPin() === true) {
    // create PIN
    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    let body = {
      merchant_code : this.tomain.merchantcode,
      password : this.tomain.password,
      merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
      appversion : myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios",
      pin: this.pin,
      tac: this.tac
    };
    //console.log(body)
  

    const option :HttpOptions ={
           url:myGlobals.url + '/CreateTxnPin',
           data:body,
           method:"POST",
           headers: {'Content-Type': 'application/json' },
           connectTimeout: myGlobals.timeout
           
    }

    Http.request(option).then(async(data:any)=>{
          try{
              
            if(data.data.header.response_code == 0){

             const alert = await this.alertCtrl.create({
                header: 'PIN TRANSAKSI BERJAYA DITETAPKAN',
                message: 'Anda mesti gunakan pin ini sebelum selesaikan transaksi penjualan anda. TAC tidak akan digunakan lagi.',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => {
                      // this.viewCtrl.dismiss();
                    }
                  }
                ]
              })

               await alert.present()
            }
            else {

            const alert = await  this.alertCtrl.create({
                header: 'CreatePin Error Code : ' + data.data.header.response_code ,
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
            console.log("CreatePin Ex ERROR!: ", e);
           const alert = await  this.alertCtrl.create({
              header: 'CreatePin Ex Error',
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
      console.log("CreatePin ERROR!: ", err);
     const alert = await this.alertCtrl.create({
        header: 'CreatePin Error',
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




    // let toast = this.toastCtrl.create({
    //   message: 'PIN created.',
    //   duration: 1000,
    //   position: 'middle',
    //   cssClass: "toast-center-text",
    // });
    //
    // toast.present();
    // toast.onDidDismiss(() => {
    //   this.viewCtrl.dismiss();
    // });
  }
}


checkPin(): boolean {
  let checkNumber = /^([0-9][0-9]*)$/;
  this.pin = this.pin.replace(/\s/g, ""); // remove whitespace
  this.cpin = this.cpin.replace(/\s/g, ""); //remove whitespace

  if(!this.pin || !this.cpin){
    this.displaymsg('Please insert PIN and confirm PIN');
    return false;
  }
  else if (this.pin.length != 6 || this.cpin.length != 6) {
    this.displaymsg('Please make sure your PIN is 6 digit');
    return false;
  }
  else if(this.pin != this.cpin){
    this.displaymsg('PIN not match');
    return false;
  }
  else if(!checkNumber.test(this.pin) || !checkNumber.test(this.cpin)) {
    this.displaymsg('Please insert number only');
    return false;
  }
  return true;
}


async displaymsg(msg:any) {
  let alert = await this.alertCtrl.create({
    header: '',
    message: msg,
    buttons: [
      {
        text: 'OK',
        role: 'cancel',
        handler: () => {
        }
      }
    ]
  });
 await  alert.present();

  // let toast = this.toastCtrl.create({
  //   message: msg,
  //   duration: 1500,
  //   position: 'middle',
  //   cssClass: "toast-center-text",
  // });
  //
  // toast.present();

}






}