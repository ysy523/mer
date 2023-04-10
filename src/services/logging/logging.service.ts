import { timeout } from './../global';
import { Injectable} from "@angular/core";
import { AlertController ,Platform } from '@ionic/angular';
import * as myGlobals from '../../services/global'
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';



@Injectable({
    providedIn:'root',

})

export class loggingService{

    
  logVar:any = {
    'client':{'ip':''}, 
    'url':'', 
    'user': {'name':''}, 
    'event': {'module':'', 'category':'', 'type':''},
    'user_agent': {'original':'', 'os': {'name':''}}
  };
  myip:any = '';


     constructor( private alertCtrl: AlertController, public platform: Platform,){

     }


    postLog(action_descp: any, page: any, merchantCode: any, category: any, type: any) {
        try {



            const options:HttpOptions = {
                url: 'https://api.ipify.org?format=json',
                headers: { 'X-Fake-Header': 'Max was here' },
                method: "GET"
            }

            Http.request(options).then((resp: any) => {
                console.log("get ip+++++" ,resp);
                this.myip = resp.data.ip ? resp.data.id : '0'


                this.logVar.url = page;
                this.logVar.user.name = merchantCode;
                this.logVar.event.module = 'merchantapp';
                this.logVar.event.category = category;
                this.logVar.event.type = type;
                this.logVar.user_agent.original = "ios";
                this.logVar.user_agent.os.name = this.platform.toString();
                //this.logVar.user_agent.device.name = this.platform['_ua'].toString(); 
                this.logVar.client.ip = this.myip;


                let body = '';
                body = JSON.stringify(this.logVar);

                const options: HttpOptions = {
                    url: myGlobals.loggingurl + action_descp,
                    connectTimeout: myGlobals.timeout,
                    data: body,
                    method: "POST"

                }

                return new Promise(resolve => {
                    Http.request(options).then((res) => {
                        try {
                            console.log(res)
                            resolve(res)
                        } catch (e) {
                            resolve(e)
                        }
                    })

                })




            })

            //   this.http.get('https://api.ipify.org?format=json') 
            //   .map(res => res.json())
            //   .subscribe((response) => {
            //     console.log('getip');  
            //     console.log((response));
            //     this.myip = response.ip ? response.ip : '0';


            // region get IP- wrong IP info
            // (<any>window).networkinterface.getWiFiIPAddress((address) => {
            //   // this.logVar.client.ip = address.ip;

            //   if(!address || !address.ip) {
            //     (<any>window).networkinterface.getCarrierIPAddress((address) => {
            //       // this.logVar.client.ip = address.ip;
            //     })
            //   }
            // });
            // endregion get IP- wrong IP info

            // try {
            //   (<any>window).plugins.IMEI(function (err, imei) {
            //     this.logVar.user_agent.device.imei = imei;
            //   })


            //   // (<any>window).IMEI.get((imei) => {
            //   //   this.logVar.user_agent.device.imei = imei;
            //   // })
            // } catch(e) {
            //     this.alertCtrl.create({
            //     title: 'Get imei Error',
            //     message: e,
            //     buttons: [
            //       {
            //         text: 'OK',
            //         handler: () => {
            //         }
            //       }
            //     ]
            //   }).present();
            // }

            // this.logVar.client.port = 0;
            //   this.logVar.url = page;
            //   this.logVar.user.name = merchantCode;
            //   this.logVar.event.module = 'merchantapp';
            //   this.logVar.event.category = category;
            //   this.logVar.event.type = type;
            //   this.logVar.user_agent.original = this.platform['_ua'].toString();
            //   this.logVar.user_agent.os.name =  this.platform._platforms.toString();
            //this.logVar.user_agent.device.name = this.platform['_ua'].toString(); 
            //   this.logVar.client.ip = this.myip;

            //   let body = '';
            //   body = JSON.stringify(this.logVar);

            //   let headers = new Headers({'Content-Type': 'application/json'});
            //   let options = new RequestOptions({headers: headers});

            //   return new Promise(resolve => {
            //     this.http
            //       .post(myGlobals.loggingurl + action_descp, body, options)
            //       .timeout(myGlobals.timeout)
            //       .map(res => res)
            //       .subscribe(
            //         data => {
            //           try {
            //             console.log(data)   
            //             resolve(data.json());
            //           } catch (e) {
            //             resolve(e);
            //           }
            //         }
            //       );
            //   });
            // });
        } catch (e) {
            console.log('ELK loggin err: ' + e);
        }

    }


    getIP() {
        try {
            return new Promise(resolve => {
                const options: HttpOptions = {
                    url: "https://api.ipify.org?format=json",
                    method: "GET"

                }
                Http.request(options).then((res: any) => {
                    console.log("get IP",res.data)
                    this.myip = res.data.ip ? res.data.ip : '0';

                    resolve(this.myip)

                })
                //   this.http.get('https://api.ipify.org?format=json') 
                //   .map(res => res.json())
                //   .subscribe((response) => {
                //     // console.log('getip');  
                //     // console.log((response));
                //     this.myip = response.ip ? response.ip : '0'; // modified 8/9/2021

                //     resolve(this.myip);

                //     });
            });
        } catch (e) {
            console.log('get IP err: ' + e);
        }

    }
}