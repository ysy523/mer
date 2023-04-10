
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, Platform, ModalController, ActionSheetController, NavController, AlertController, LoadingController } from '@ionic/angular';
import { FormGroup, NgForm } from '@angular/forms';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
import { loggingService } from '../../services/logging/logging.service';
import { Sql } from '../../services/Sql';
import * as myGlobals from '../../services/global'
import { errorMonitor } from 'events';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Observable } from 'rxjs';
import * as SecureLS from 'secure-ls';
import { Router, NavigationExtras } from '@angular/router';


declare var cdvRootBeer: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  @ViewChild('logininput') logininput;
  @ViewChild('loginpass') loginpass;
  @ViewChild(IonContent) content: IonContent;

  isRequired: boolean = true;
  displayversion: any = '';

  todo: any = {
    loginid: '',
    pwd: '',
    rmbme: false
  }

  descrip:any;
  sub_descrip:any;

  constructor(public platform: Platform, public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController,
    private alertCtrl: AlertController, private loggingService: loggingService,
    public loadingCtrl: LoadingController, public httpNative: HTTP, private router: Router) {

    platform.ready().then(() => {
      //console.log("Get Sql wait Platform is ready");
      this.displayversion = myGlobals.version;

      var ls = new SecureLS({ encodingType: 'aes' });
      var drmbme = ls.get('rmbme');

      if (drmbme === 'true') {

        this.todo.loginid = ls.get('merchantcode');
        this.todo.pwd = ls.get('password');
        this.todo.rmbme = (drmbme === "true");
      }

      //region sql local storage
      // this.sql.get('rmbme').then((rmbme) => {
      //  	this.todo.rmbme = (rmbme === "true")
      //  	if(rmbme === "true"){
      //     	this.sql.get('merchantcode').then((merchantcode) => {
      // 	    	this.todo.loginid = merchantcode
      // 	    });
      //
      // 	    this.sql.get('password').then((password) => {
      // 	    	this.todo.pwd = password
      // 	    });
      // 	}
      // });
      //endregion
      //this.checkRoot();

      //if(platform.is('cordova')){
      let dummyboole = false
      if (dummyboole) {
        // this.deploy.getSnapshots().then((snapshots) => {
        // 	//console.log('Snapshots', snapshots);
        // 	// snapshots will be an array of snapshot uuids
        // 	this.deploy.info().then((x) => {
        // 		//console.log('Current snapshot infos', x);
        // 		for (let suuid of snapshots) {
        // 			if (suuid !== x.deploy_uuid) {
        // 				this.deploy.deleteSnapshot(suuid);
        // 			}
        // 		}
        // 	})
        // });

        // this.push.register().then((t: PushToken) => {
        // 	return this.push.saveToken(t);
        // }).then((t: PushToken) => {
        // 	//console.log('Token saved:', t.token);
        // 	this.push.rx.notification()
        // 	.subscribe((msg) => {
        // 		this.alertCtrl.create({
        // 			title: msg.title,
        // 			message: msg.text,
        // 			enableBackdropDismiss:false,
        // 			buttons: [
        // 				{
        // 					text: 'OK',
        // 					role: 'cancel',
        // 					handler: () => {
        // 					}
        // 				}
        // 			]
        // 		}).present();
        // 	});
        // }).catch((err)=>{
        // 	console.log(err);
        // });
      }
    });




  }

  ngOnInit() {
    console.log('device id');
     
    // this.showDis()
    // console.log((<any>window).plugins.device.uuid);
  }

  // async getUserAgent(){
  //      await this.platform.userAgent()
  // }


  checkRoot() {
    cdvRootBeer.isRootedWithoutBusyBoxCheck(async (boo: any) => {
      console.log('root check', boo)
      if (boo == true) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Rooted phone is restricted to use this application.',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
                navigator['app'].exitApp();
              }
            }
          ]
        })
        await alert.present();
      }

    }, err => {
      console.log("root check", err)
    });
    // endregion



    //region check if phone is rooted DANGEROUS
    cdvRootBeer.detectPotentiallyDangerousApps(async (boo: any) => {
      console.log('root check ', boo);
      if (boo == true) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Rooted phone is restricted to use this application 3.',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
                navigator['app'].exitApp();
              }
            }
          ]
        })

        await alert.present()
      }
    }, err => {
      console.log('root check ', err);
    });
    //endregion

    //region check if phone is rooted MANAGAEMENT
    cdvRootBeer.detectRootManagementApps(async (boo: any) => {
      console.log('root check ', boo);
      if (boo == true) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Rooted phone is restricted to use this application 2.',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
                navigator['app'].exitApp();
              }
            }
          ]
        })
        await alert.present()
      }
    }, err => {
      console.log('root check ', err);
    });
    //endregion
  }


  versionCompare(v1: any, v2: any, options: any) {
    var lexicographical = options && options.lexicographical,
      zeroExtend = options && options.zeroExtend,
      v1parts = v1.split('.'),
      v2parts = v2.split('.');

    function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
    }

    if (zeroExtend) {
      while (v1parts.length < v2parts.length) v1parts.push("0");
      while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) {
        return 1;
      }

      if (v1parts[i] == v2parts[i]) {
        continue;
      }
      else if (v1parts[i] > v2parts[i]) {
        return 1;
      }
      else {
        return -1;
      }
    }

    if (v1parts.length != v2parts.length) {
      return -1;
    }

    return 0;
  }



  _serverError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body: any = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return errMsg;
  }


  showDis(){

    let body = {
      merchant_code : "98254224",
      password : "Abc_123123",
      merchant_trans_id : "98254224"+ new Date().valueOf(),
      appversion : myGlobals.version,
      platform: "ios",
      device: "ios",
      action_id: 520,
      input:{"ok":1, "action":'okok'}
    };

    // let loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    // loading.present();

    console.log("--- body ---",body)

    let headers = new Headers({ 'Content-Type': 'application/json' });
     
    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: myGlobals.url + '/ProcessMerchant',
      data: body,
      method: "POST",
      connectTimeout: myGlobals.timeout
    }
    Http.request(options).then(async (data: any) => {
             try {
                 console.log ("data---",data)
              if(data.header.response_code == 0){
                if(data.body){
                   if(data.body.outputlist){
                     this.descrip = data.body.outputlist.desc
                     this.sub_descrip = data.body.outputlist.sub_desc
                   
                   }
                }
                   
            }

             }catch(e){
              console.log("Get disclaimer Ex ERROR!: ", e);
             }
    })






      
  }



  async logForm(form) {

    // this.showDis();
   
    if (!form.controls.loginid.valid) {
      const alert = await this.alertCtrl.create({
        header: 'Invalid Login Details',
        message: 'Please Enter Valid Merchant Code',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              this.logininput.setFocus();
            }
          }
        ]
      })
      await alert.present()
      return;
    }
    else if (!form.controls.pwd.valid) {
      const alret1 = await this.alertCtrl.create({
        header: 'Invalid Login Details',
        message: 'Please Enter Valid Password',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              this.loginpass.setFocus();
            }
          }
        ]
      })

      await alret1.present()
      return;
    }

    let loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await loading.present();


    window.getSelection().removeAllRanges();
    //console.log(form.value)
    //if(this.platform.is('cordova')){
    let dummyboole = false
    if (dummyboole) {
      // this.deploy.check().then((snapshotAvailable: boolean) => {
      // 	if (snapshotAvailable) {
      // 		this.deploy.getMetadata().then((metadata) => {
      // 			if(this.versionCompare(myGlobals.version, metadata.version, {lexicographical: true,zeroExtend: true}) < 0)
      // 			{
      // 				loading.dismiss();
      // 				this.alertCtrl.create({
      // 					title: 'New Version Available',
      // 					message: 'Update now?',
      // 					buttons: [
      // 						{
      // 							text: 'OK',
      // 							handler: () => {
      // 								loading = this.loadingCtrl.create({
      // 									content: 'Updating, Please wait...'
      // 								});
      // 								loading.present();
      // 								this.deploy.download().then(() => {
      // 									return this.deploy.extract();
      // 								}).then(()=>{
      // 									loading.dismiss();
      // 									this.deploy.load();
      // 								});
      // 							}
      // 						},
      // 						{
      // 							text: 'Later',
      // 							handler: () => {
      // 								loading = this.loadingCtrl.create({
      // 									content: 'Please wait...'
      // 								});
      // 								loading.present();
      // 								this.checkVersion(loading);
      // 							}
      // 						}
      // 					]
      // 				}).present();
      // 			}else{
      // 				this.checkVersion(loading);
      // 			}
      // 		}).catch(()=>{
      // 			this.checkVersion(loading);
      // 		});
      // 	}else{
      // 		this.checkVersion(loading);
      // 	}
      // }).catch(()=>{
      // 	this.checkVersion(loading);
      // });
    } else {
      this.checkVersion(loading);
      // this.redeemMoneyPin(loading);
    }
    //this.checkVersion(loading);


    /*   	if(this.todo.loginid.length < 1) */
    /*   	{ */
    /*   		//return; */
    /*   	} */
    /*   	if(this.todo.pwd.length < 1) */
    /*   	{ */
    /*   		//return; */
    /*   	}	 */

    /*  	let body = {
          merchant_code: this.todo.loginid,
          password: this.todo.pwd,
          merchant_trans_id : this.todo.loginid + new Date().valueOf(),
          appversion : myGlobals.version
        };
      let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
    */
    /*    this.http
            .post(myGlobals.url + '/VerifyLogin', body, options)
            /*.map((res: Response) => {
                if (res) {
                    if (res.status === 201) {
                        return [{ status: res.status, json: res }]
                    }
                    else if (res.status === 200) {
                        return [{ status: res.status, json: res }]
                    }
                }
            }).catch((error: any) => {
                if (error.status < 400 ||  error.status ===500) {
                    return Observable.throw(new Error(error.status));
                }
            })
            .subscribe(res => {console.log(res)},
                       err => {console.log(err)},
                       ()  => {console.log('finish')} );*/

    /*.map(res => res.json())
    .subscribe(
        data => {
          //loading.dismiss();
 
          console.log(data);
          if(data.header.response_code == 0)
          {
            this.sql.set('merchantcode', this.todo.loginid);
            this.sql.set('password', this.todo.pwd);
            this.sql.set('rmbme', this.todo.rmbme.toString());
            this.sql.set('flexindo', data.body.issue_indon_moneypin_type);
            this.getSetting(loading,data.body.issue_indon_moneypin_type);
/*               	const index = this.viewCtrl.index; */
    /* 			    this.navCtrl.push(MenuPage).then(() => { */
    /* 			    	this.navCtrl.remove(index); */
    /* 			    });   */
    /*          }else{
                loading.dismiss();
                this.alertCtrl.create({
                    title: 'Login Error Code : ' + data.header.response_code ,
                    message: data.header.response_description,
                    buttons: [
                       {
                          text: 'OK',
                          handler: () => {
                          }
                       }
                    ]
               }).present();
              }
            },
            err => {
              loading.dismiss();
              console.log("ERROR!: ", err);
              this.alertCtrl.create({
                  title: 'Login Error',
                  message: err,
                  buttons: [
                     {
                        text: 'OK',
                        handler: () => {
                        }
                     }
                  ]
              }).present();
            }
        );*/
  }



  checkVersion(loader: any) {
    let body = {
      merchant_code: this.todo.loginid,
      password: this.todo.pwd,
      merchant_trans_id: this.todo.loginid + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });
    // console.log ("----check version  --- ",body)
    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: myGlobals.url + '/CheckAppVersion',
      data: body,
      method: "POST",
      connectTimeout: myGlobals.timeout
    }

    Http.request(options).then(async (data: any) => {
      // console.log(" http =======",data.data)
      try {
        if (data.data.header.response_code == 900000) {
          await loader.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'CheckVersion Error Code : ' + data.data.header.response_code,
            message: data.data.header.response_description,
            buttons: [
              {
                text: 'Go To PlayStore',
                handler: () => {
                  window.open('market://details?id=com.mobilemoney.mmmerchant', '_system');
                }
              }
            ]
          })

          await alert.present();
        } else if (data.data.header.response_code == 900001) {
          await loader.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'CheckVersion Error Code : ' + data.data.header.response_code,
            message: data.data.header.response_description,
            buttons: [
              {
                text: 'Go To PlayStore',
                handler: () => {
                  window.open('market://details?id=com.mobilemoney.mmmerchant', '_system');
                }
              }, {
                text: 'Update Later',
                handler: () => {
                  this.doLogin(loader, 1);
                }
              }
            ]
          })
          await alert.present()
        } else {
          console.log("call login ----")
          this.doLogin(loader, 0)
        }
      } catch (e) {
        await loader.dismiss();
        console.log("CheckVersion Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'CheckVersion Ex Error',
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

    }).catch(async (e) => {

      await loader.dismiss();
      console.log("ERROR!: ", e);
      const alert = await this.alertCtrl.create({
        header: 'CheckVersion Error',
        message: 'Please make sure your phone is connected to internet.',
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




  async doLogin(loader, states) {
    if (states == 1) {
      loader = await this.loadingCtrl.create({
        message: 'Please wait...'
      });
      await loader.present();
    }

    let body = {
      merchant_code: this.todo.loginid,
      password: this.todo.pwd,
      merchant_trans_id: this.todo.loginid + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };

    console.log ("login body",body)

    //region new Native HTTP request with sslCertPinning
    let newHeaders = { 'Content-Type': 'application/json' };

    // this.httpNative.setServerTrustMode("pinned")
    //   .then(() => {
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        // this.http.post(myGlobals.url + '/VerifyLogin', body, options)

        const options: HttpOptions = {
          url: myGlobals.url + '/VerifyLogin',
          data: body,
          method: "POST",
          connectTimeout: myGlobals.timeout,
          headers: { 'Content-Type': 'application/json' }
        }

        Http.request(options).then(async (data: any) => {
              console.log("data",data)
              let response = data.data
              try{
               
                if (response.header.response_code ==0)
                {
                  var ls = new SecureLS({encodingType:'aes'})

                ls.set('merchantcode', this.todo.loginid);
                ls.set('password', this.todo.pwd);
                ls.set('rmbme', this.todo.rmbme.toString());
                ls.set('flexindo', response.body.issue_indon_moneypin_type);

                this.getSetting(loader, response.body.issue_indon_moneypin_type, response.body.is_txnpin_created ? response.body.is_txnpin_created : -1);
                    
                console.log ("okok",ls)
                }
              
              console.log("response login ", response)

              }catch(e){
                await loader.dismiss();
               // ELK logging Login failed
               this.loggingService.postLog('Login', 'Login', this.todo.loginid, 'authentication', 'auth_ko');
              const alert = await this.alertCtrl.create({
              header: 'Login Error Code : ' + response.header.response_code,
              message: response.header.response_description,
               buttons: [
              {
                text: 'OK',
                handler: () => {
                }
              }
            ]
          })

          await alert.present()
                   console.log ("failed login",e)
              }

        })

      // this.httpNative.post(myGlobals.url + '/VerifyLogin', body, newHeaders)
      //     .then(async (data) => {
      //       // console.log('HTTP Post:', data);
      //       // console.log('HTTP Post1:', data.data);
      //       console.log('HTTP Post2:', JSON.parse(data.data));

      //       let response = JSON.parse(data.data);

      //       console.log("response login ", response)

      //       if (response.header.response_code == 0) {
      //         var ls = new SecureLS({ encodingType: 'aes' });

      //         ls.set('merchantcode', this.todo.loginid);
      //         ls.set('password', this.todo.pwd);
      //         ls.set('rmbme', this.todo.rmbme.toString());
      //         ls.set('flexindo', response.body.issue_indon_moneypin_type);

   
      //         this.getSetting(loader, response.body.issue_indon_moneypin_type, response.body.is_txnpin_created ? response.body.is_txnpin_created : -1);

      //       } else {
      //         await loader.dismiss();
      //         // ELK logging Login failed
      //         this.loggingService.postLog('Login', 'Login', this.todo.loginid, 'authentication', 'auth_ko');
      //         const alert = await this.alertCtrl.create({
      //           header: 'Login Error Code : ' + response.header.response_code,
      //           message: response.header.response_description,
      //           buttons: [
      //             {
      //               text: 'OK',
      //               handler: () => {
      //               }
      //             }
      //           ]
      //         })

      //         await alert.present()
      //       }

      //     })
      //     .catch(async (error) => {
      //       await loader.dismiss();
      //       console.log("Login Ex ERROR Post!: ", error);
      //       const alert = await this.alertCtrl.create({
      //         header: 'Login Ex Error',
      //         message: 'Error ' + error.status + ':' + error.error,
      //         buttons: [
      //           {
      //             text: 'OK',
      //             handler: () => {
      //             }
      //           }
      //         ]
      //       })
      //       await alert.present()
      //     })
      // })
      
      // .catch(async error => {
      //   await loader.dismiss();
      //   console.log("Login Ex ERROR Cert!: ", error);
      //   const alert = await this.alertCtrl.create({
      //     header: 'Login Ex Error Cert',
      //     message: 'Error ' + error.status + ':' + error.error,
      //     buttons: [
      //       {
      //         text: 'OK',
      //         handler: () => {
      //         }
      //       }
      //     ]
      //   })
      //   await alert.present()
      // })
    //endregion

  }



  async doLogin3(loader: any, states: any) {
    if (states == 1) {
      loader = await this.loadingCtrl.create({
        message: 'Please wait...'
      });
      await loader.present();
    }

    let body = {
      merchant_code: this.todo.loginid,
      password: this.todo.pwd,
      merchant_trans_id: this.todo.loginid + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    const options: HttpOptions = {
      url: myGlobals.url + '/VerifyLogin',
      data: body,
      method: "POST",
      connectTimeout: myGlobals.timeout,
      headers: { 'Content-Type': 'application/json' }
    }

    Http.request(options).then(async (data: any) => {
      try {
        if (data.header.response_code == 0) {

          this.getSetting(loader, data.body.issue_indon_moneypin_type, data.body.is_txnpin_created ? data.body.is_txnpin_created : -1);

        } else {

          await loader.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Login Error Code : ' + data.header.response_code,
            message: data.header.response_description,
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
        console.log("Login Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Login Ex Error',
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

    }).catch(async (err) => {

      await loader.dismiss();
      console.log("ERROR!: ", err);
      const alert = await this.alertCtrl.create({
        header: 'Login Error',
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







  getSetting(loader: any, flexindo: any, is_txnpin_created: any) {
    let body = {
      merchant_code: this.todo.loginid,
      password: this.todo.pwd,
      merchant_trans_id: this.todo.loginid + new Date().valueOf(),
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    //   let options = new RequestOptions({ headers: headers });

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: myGlobals.url + '/GetSystemSetting',
      data: body,
      method: "POST",
      responseType: "json",
      connectTimeout: myGlobals.timeout
    }

    Http.request(options).then(async (data: any) => {
      try {
        await loader.dismiss();

        console.log('GetSetting : ', data);

        if (data.data.header.response_code == 0) {
          // const index = this.viewCtrl.index;
          // console.log("----- get setting verity login------",data.data)

          let navigationExtras: NavigationExtras = {
            queryParams: {
              item: this.deserializejsonString(data.data),
              merchantcode: this.todo.loginid,
              password: this.todo.pwd,
              flexindo: flexindo,
              is_txnpin_created: is_txnpin_created

            }
          };

          this.router.navigate(['/home'], navigationExtras)

          // this.router.navigate(['/home',{item: data, merchantcode: this.todo.loginid, password: this.todo.pwd, flexindo : flexindo, is_txnpin_created: is_txnpin_created}])



          // this.navCtrl.push(HomePage, { item: data, merchantcode: this.todo.loginid, password: this.todo.pwd, flexindo : flexindo, is_txnpin_created: is_txnpin_created }).then(() => {
          // this.navCtrl.remove(index);

          // ELK logging Login success
          this.loggingService.postLog('Login', 'Login', this.todo.loginid, 'authentication', 'auth_ok');
          // });
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Get Setting Error Code : ' + data.data.header.response_code,
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
        console.log("Setting Ex ERROR!: ", e);
        const alert = await this.alertCtrl.create({
          header: 'Setting Ex Error',
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

    }).catch(async (e) => {

      await loader.dismiss();
      console.log("ERROR!: ", e);
      const alert = await this.alertCtrl.create({
        header: 'Setting Error',
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
    })

  }


  deserializejsonString(data: any) {

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

  redeemMoneyPin(loading: any) {

    // let loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });

    // loading.present();

    let body = {
      merchant_terminal_id: this.todo.loginid,
      merchant_code: this.todo.loginid,
      password: this.todo.pwd,
      mbb_app_version: myGlobals.version,
      merchant_trans_id: this.todo.loginid + new Date().valueOf(),
      customer_hp: '0123456789',
      account_no: '9876543210',
      appversion: myGlobals.version,
      platform: this.platform.platforms()[0],
      device: "ios"
    };
    console.log("redeemMoneyPin", body)


    const options: HttpOptions = {
      headers: { "Content-Type": "application/json" },
      url: myGlobals.url + '/RedeemMoneyPin',
      data: body,
      method: "POST",
      connectTimeout: myGlobals.timeout
    }

    Http.request(options).then(async (data: any) => {
      try {
        await loading.dismiss();
        console.log(data);
        if (data.data.header.response_code == 0) {
          const alert = await this.alertCtrl.create({
            header: 'Redeem Code : ' + data.data.header.response_code,
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
          });

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
        await alert.present();

      }

    }).catch(async (err) => {

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


}
