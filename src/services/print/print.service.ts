import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';


@Injectable({
    providedIn: 'root',
})

export class PrintService {

    constructor(private btSerial: BluetoothSerial, private alertCtrl: AlertController) {
        console.log('Hello PrintProvider Provider');
    }

    searchBt() {
        return this.btSerial.list();
    }

    checkIsDeviceConnected() {
        return new Promise((resolve, reject) => {
            this.btSerial.isConnected()
                .then(success => {
                    console.log(success);
                    resolve('success');

                }, error => {
                    reject(error);
                })
        })
    }

    checkBluetoothEnabled() {
        return new Promise((resolve, reject) => {
            this.btSerial.isEnabled()
                .then(success => {
                    resolve('success');

                }, error => {
                    reject(error);
                })
        })
    }

    discoverUnpair() {
        return this.discoverUnpair();
    }

    connectBT(address: any) {
        return this.btSerial.connect(address);

    }


    testPrint(address: any, data: any, printData: any, format: any) {
        console.log('at printer');
        console.log(printData);
        console.log('Address' + address);
        let xyz = this.connectBT(address).subscribe(data => {
            // this.btSerial.write(format.buffer).then(dataz=>{
            //   console.log("WRITE FORMAT SUCCESS",dataz);

            this.btSerial.write(printData).then(dataz => {
                console.log("WRITE DATA SUCCESS", dataz);

            }, errx => {
                console.log("WRITE FAILED", errx);
                //   let mno= await this.alertCtrl.create({
                //     header:"ERROR "+errx,
                //     buttons:['Dismiss']
                //   });
                //   mno.present();

                this.errorPrint(errx);

            });

            xyz.unsubscribe();
            // },errx=>{
            //   console.log("WRITE FAILED",errx);
            //   let mno=this.alertCtrl.create({
            //     title:"ERROR "+errx,
            //     buttons:['Dismiss']
            //   });
            //   mno.present();
            // });
        }, err => {
            console.log("CONNECTION ERROR", err);

            this.connecterrorprint(err);

        });

    }


    async errorPrint(err: any) {

        let mno = await this.alertCtrl.create({
            header: "ERROR " + err,
            buttons: ['Dismiss']
        });
        await mno.present();
    }


    async connecterrorprint(err: any) {

        let mno = await this.alertCtrl.create({
            header: "ERROR " + err + '. Please make sure bluetooth and printer are turn on.',
            buttons: ['Dismiss']
        });

        await mno.present();

    }


    disconnectPrinter() {
        this.btSerial.disconnect();
    }

}
