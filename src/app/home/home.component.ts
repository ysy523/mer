import { GmodalComponent } from '../gmodal/gmodal.component';
import { ActivatedRoute, Router,NavigationExtras } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Platform, NavController, NavParams, AlertController, ModalController, LoadingController} from '@ionic/angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { loggingService } from '../../services/logging/logging.service';
import * as myGlobals from '../../services/global';
import { AnnouncementComponent } from '../announcement/announcement.component';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  dateNow: string;
  isFlexIndo = false;
  tomain = {
    merchantcode: '',
    password: ''
  }
  jsonstring;
  showversion = '';
  is_txnpin_created = ''; //0- pin not create, 1- pin created

    //added 3/6/2022
    toCollect = {
      mmappId: '',  // uuid
      name: ''
    }
  loader: any;


  backButtonSubscription: any;
  backButtonClickCount: number = 0;

  constructor(public navCtrl: NavController, public params: NavParams, public alertCtrl: AlertController,
    public platform: Platform, public modalCtrl: ModalController, private iab: InAppBrowser,
    private loggingService: loggingService, private router: Router, private route:ActivatedRoute, 
    public barcodeScanner:BarcodeScanner, public loadingCtrl:LoadingController) {

      this.route.queryParams.subscribe(params =>{
        this.isFlexIndo = params['flexindo'] === "0";
        this.tomain.merchantcode = params['merchantcode'];
        this.tomain.password = params['password'];
        this.jsonstring = params['item'];
        this.showversion = myGlobals.version;
        this.is_txnpin_created = params['is_txnpin_created'];
      
      })

      this.platform.ready().then(() => {
        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
          if (this.backButtonClickCount === 0) {
            this.backButtonClickCount++;
            alert('Press again to exit');
            setTimeout(() => {
              this.backButtonClickCount = 0;
            }, 2000); // Reset count after 2 seconds
          } else {
            navigator['app'].exitApp();
          }
        });
      });

    // this.isFlexIndo = (params.data.flexindo === "0");
    // this.tomain.merchantcode = params.data.merchantcode;
    // this.tomain.password = params.data.password;
    // this.jsonstring = params.data.item;
    // this.showversion = myGlobals.version;
    // this.is_txnpin_created = params.data.is_txnpin_created;
  }

  ngOnInit() {

    // "platform": this.platform._platforms,
    // "device": this.platform['_ua'].toString(),

    

    let newDt = new Date();
    this.dateNow = newDt.toLocaleString('en-GB', { hour12: true });  //format: 19/06/2018, 4:02:08 pm


    console.log('ispincreated', this.is_txnpin_created);
    if (this.is_txnpin_created == '0') {

      this.modal();

    } else {
      // add modal for announment
      this.nopinModal()
    }


  }
  async modal() {
    // add modal for announment
    const modal = await this.modalCtrl.create
      ({
        component: AnnouncementComponent,
        componentProps: { type: "2", profile: this.tomain },
        cssClass: 'announcement'
      });

    await modal.present();

    await modal.onDidDismiss().then(async (data) => {

      // add modal for announment
      const modal = await this.modalCtrl.create({ component: AnnouncementComponent, componentProps: { type: "1", profile: this.tomain }, cssClass: 'announcement' });
      await modal.present();
      await modal.onDidDismiss()

    });

  }

  async nopinModal() {

    // add modal for announment
    const modal = await this.modalCtrl.create({ component: AnnouncementComponent, componentProps: { type: "1", profile: this.tomain }, cssClass: 'announcement' });
    await modal.present();
    await modal.onDidDismiss();

  }

  // AfterViewInit() {
  //     this.modalCtrl.
  //  }


  async navToRemittance(pageType: any) {

    if (pageType == 'Logout') {
      const alert = await this.alertCtrl.create({
        header: '',
        message: 'Log out?',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              console.log('Cancel logout');
            }
          },
          {
            text: 'OK',
            handler: () => {
              //this.oneSignal.deleteTag('merchantCode');
              // const index = this.viewCtrl.index;
              this.router.navigateByUrl('/login');

              // ELK logging logout
              this.loggingService.postLog('Logout', 'Logout', this.tomain.merchantcode, 'authentication', 'logout');

              // this.navCtrl.push(LoginPage).then(() => {
              //   this.navCtrl.remove(index);


              // });
            }
          }
        ], backdropDismiss: false // prevent popup close when click outside of it
      })

      await alert.present();

    } else {
      // const index = this.viewCtrl.index;
      // console.log(index);

      // ELK logging page access
      this.loggingService.postLog(pageType, pageType, this.tomain.merchantcode, 'access', 'pagevisit');
       
      // console.log ("-----remittance------",JSON.stringify(this.jsonstring))
      
      let navigationExtras: NavigationExtras = {
        queryParams: {
          item: this.jsonstring,
          merchantcode: this.tomain.merchantcode, 
          password:  this.tomain.password,
          flexindo :this.isFlexIndo,
          pageType: pageType
        }
      };



      this.navCtrl.navigateForward(['/remittance'],navigationExtras)

      // this.navCtrl.push(RemittancePage,
      //   {
      //     item: this.jsonstring,
      //     merchantcode: this.tomain.merchantcode,
      //     password: this.tomain.password,
      //     flexindo: this.isFlexIndo,
      //     pageType: pageType
      //   }).then(() => {
      //     // this.navCtrl.remove(index);
      // });
    }
  }


  navToKadar(){
    this.loggingService.postLog('kadar', 'kadar', this.tomain.merchantcode, 'access', 'pagevisit');
    let navigationExtras: NavigationExtras = {
      queryParams: {
        item: this.jsonstring,
        merchantcode: this.tomain.merchantcode, 
        password:  this.tomain.password,
        flexindo :this.isFlexIndo,
        // pageType: pageType
      }
    };
    this.navCtrl.navigateForward(['/kadar'],navigationExtras)
  }

  navToERemitBookingList() {

    console.log("press booking list")
    // ELK logging page access
    this.loggingService.postLog('eRemitBookingList', 'eRemitBookingList', this.tomain.merchantcode, 'access', 'pagevisit');

    let navigationExtras: NavigationExtras = {
      queryParams: {
        merchantcode: this.tomain.merchantcode,
        password: this.tomain.password}
    };
    
    this.router.navigate(['/bookinglist'], navigationExtras)

  }

  viewCommission() {
    // ELK logging page access
    this.loggingService.postLog('viewCommission', 'viewCommission', this.tomain.merchantcode, 'access', 'pagevisit');

    let url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVNZav36zYaR2kt-17nC8k6722GBcRfNIMIJ5QpPZMDigGDvOqydV-Xvbrap4NaT7XdA4qLtJX8UYn/pubhtml?gid=1704169428&single=true&widget=true&headers=false';
    let browser = this.iab.create(url, '_self');

    // let headers = new Headers({'Content-Type': 'application/json'});
    // let options = new RequestOptions({headers: headers});

    // this.http
    //   .post(myGlobals.url + '/GetCommissionDisplay', {}, options)
    //   .timeout(myGlobals.timeout)
    //   .map(res => {
    //     console.log(res);
    //     return res.json()
    //   })
    //   .subscribe(
    //     data => {
    //       try {
    //         if (data.body && data.body.result) {
    //           let browser = this.iab.create(data.body.result.url ? data.body.result.url: url, '_self');
    //         } else {
    //           let browser = this.iab.create(url, '_self');
    //         }
    //       } catch (ex) {
    //         let browser = this.iab.create(url, '_self');
    //       }
    //     }
    //   )

  }


  navToPrepaid() {
    // ELK logging page access
    this.loggingService.postLog('buyPrepaid', 'buyPrepaid', this.tomain.merchantcode, 'access', 'pagevisit');

    let navigationExtras: NavigationExtras = {
      queryParams: {
        merchantcode: this.tomain.merchantcode,
        password: this.tomain.password

      }
    };

    this.navCtrl.navigateForward(['/prepaid'], navigationExtras)
  }

  navToPrepaidList() {
    // ELK logging page access
    this.loggingService.postLog('checkPrepaidList', 'checkPrepaidList', this.tomain.merchantcode, 'access', 'pagevisit');

    let navigationExtras: NavigationExtras = {
      queryParams: {
        merchantcode: this.tomain.merchantcode,
        password: this.tomain.password

      }
    };

    this.navCtrl.navigateForward(['/prepaidlist'], navigationExtras)

    // this.navCtrl.push(PrepaidlistPage, {
    //   merchantcode: this.tomain.merchantcode,
    //   password: this.tomain.password,
    // });
  }

    /*3/6/2022 scan MMApp QR to collect money from user */
    async onScanQRToCollect(scanType) {
      if(scanType != 5) {
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
          let qrvalue = barcodeData.text;
          
          if(qrvalue != '') {
            this.loader =  await this.loadingCtrl.create();
            await this.loader.present();
        
            let body = {
              merchant_code: this.tomain.merchantcode,
              password: this.tomain.password,
              merchant_trans_id : this.tomain.merchantcode + new Date().valueOf(),
              appversion : myGlobals.version,
              platform: this.platform.platforms()[0],
              device: "ios",
              qrvalue: qrvalue,
              fid: scanType // scan to pay
            };

            const options:HttpOptions={
              url:myGlobals.url + '/GetUserDetails',
              data:body,
              method:'POST',
              connectTimeout:myGlobals.timeout,
              headers:{'Content-Type': 'application/json'}
        }
           
        Http.request(options).then(async(data:any)=>{

          try {
            await this.loader.dismiss();
  
            if(data.data.header.response_code == 0)
            {
              if(data.data.body) {
                this.toCollect.name = data.data.body.name;
                this.toCollect.mmappId = data.data.body.aa_uuid;

                if(this.toCollect.mmappId == '' || this.toCollect.mmappId == null) {
                 const alert =await this.alertCtrl.create({
                    header: 'Invalid',
                    message: 'Invalid user, please try again with a valid QR code [004].',
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


                  let modalPage = await this.modalCtrl.create({component:GmodalComponent,componentProps:{merchantcode: this.tomain.merchantcode,
                    password: this.tomain.password, action: scanType, data: this.toCollect}});
                      
                   modalPage.onDidDismiss()
                  await modalPage.present();
                }

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
             const alert = await  this.alertCtrl.create({
                header: 'Attention',
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
            console.log("ScanToPay Ex ERROR!: ", e);
            const alert = await this.alertCtrl.create({
              header: 'ScanToPay Ex Error',
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
            

        }).catch(async err => {
           await this.loader.dismiss();
           console.log("ERROR!: ", err);
          const alert = await this.alertCtrl.create({
            header: 'ScanToPay Error',
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
      });
      
  
      }
    } }).catch(async err =>{
      console.log('barcode scan err', err);
         const alert = await this.alertCtrl.create({
            header: 'ScanQR Ex Error',
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
  }  else {
       const alert =await this.alertCtrl.create({
          header: 'Oops',
          message: 'Coming soon.',
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

    navToEStamp() {

      let navigationExtras: NavigationExtras = {
        queryParams: {
          merchantcode: this.tomain.merchantcode,
          password: this.tomain.password
  
        }
      };
  
      this.router.navigate(['/estamp'], navigationExtras)
     
    }
  

    
  navToInviteUser() {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        merchantcode: this.tomain.merchantcode,
        password: this.tomain.password

      }
    };

    this.router.navigate(['/invite'], navigationExtras)
    
  }

  navToRedemption() {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        merchantcode: this.tomain.merchantcode,
        password: this.tomain.password

      }
    };

    this.router.navigate(['/redeem'], navigationExtras)

    // this.navCtrl.push(RedeemPage, {
    //   merchantcode: this.tomain.merchantcode,
    //   password: this.tomain.password,
    // });
  }



}
