import { PrinterListModalPage } from './../printer-list-modal/printer-list-modal.page';
import { Component, ViewChild, ElementRef,OnInit ,Input } from '@angular/core';
import {  NavController, NavParams, ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { PrintService } from './../../services/print/print.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import * as JsBarcode from 'jsbarcode';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-prepaidmodal',
  templateUrl: './prepaidmodal.component.html',
  styleUrls: ['./prepaidmodal.component.scss'],
})
export class PrepaidmodalComponent implements OnInit {

  txnlog:any= [];
  toPrintTemplate = '';
  printer: any;
  prepaidTemplate = "";
  selectedPrinter: any;
  copy = '';
  mid = '';
 
  @Input() from:any; 
  @Input() data:any;
  @Input() merchantcode:any
  @ViewChild('barcode') barcode: ElementRef;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public params: NavParams,private actionSheetCtrl: ActionSheetController,
    private PrintService:PrintService, private alertCtrl: AlertController,
    private modalCtrl: ModalController,private route:ActivatedRoute) 
    { 
      //  this.route.queryParams.subscribe(params=>{
      //      this.mid = params['merchantcode'];

    
      //  })

      // this.mid = this.params.get('merchantcode');
      // let page = this.params.get('from');
      // this.copy = page == 'new' ? '(CUSTOMER COPY)' : page == 'reprint' ? '(CUSTOMER RERPRINT COPY)' : '(CUSTOMER COPY)'

      // this.txnlog = this.params.get('data');
      // console.log(this.txnlog);

    }

  ngOnInit() {

    this.mid = this.merchantcode;
    let page = this.from;
    this.copy =page == 'new' ? '(CUSTOMER COPY)' : page == 'reprint' ? '(CUSTOMER RERPRINT COPY)' : '(CUSTOMER COPY)'
    this.txnlog = this.data
    if(this.txnlog && this.txnlog['ppin_ean_code']) {
      this.generateBarcode(this.txnlog['ppin_ean_code']);
    }
  }

  async printShareSelection() {
    let actionSheet = await this.actionSheetCtrl.create({
      header: '',
      buttons: [
        {
          text: 'Print customer copy',
          handler: () => {
            this.reprintReceipt();
          }
        },
        {
          text: 'Share receipt',
          handler: () => {
            this.shareReceipt();
          }
        }
      ]
    });
    await actionSheet.present();
  }


 async reprintReceipt() {
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

    if(this.txnlog) {
      if(this.txnlog['telco'].toLowerCase().includes('ereload')){
        this.prepaidTemplate = FONT_RESET + FONT_DOUBLE_HEIGHT_WIDTH_BOLD + this.txnlog['telco'].toUpperCase() +
        // " RM " + amt.toString() + 
        FONT_RESET +
        "\nTarikh:" + this.txnlog['timestamp'] +
        "\nTXN:" + this.txnlog['trans_id'] +
        "\nAmount: RM " + this.txnlog['pin_value'] +
        "\n" + FONT_RESET + this.txnlog['footer'] +
        "\n" + FONT_SMALL + this.copy + "\n\n\n";

        this.toPrintTemplate = this.prepaidTemplate;
        this.print(this.txnlog, this.toPrintTemplate);

      } else {
        this.prepaidTemplate = FONT_RESET + FONT_DOUBLE_HEIGHT_WIDTH_BOLD + this.txnlog['telco'].toUpperCase() +
        // " RM " + amt.toString() + 
        FONT_RESET +
        "\nTarikh:" + this.txnlog['timestamp'] +
        "\nTXN:" + this.txnlog['trans_id'] +
        "\nNo. Siri:" + this.txnlog['pin_serial'] +
        "\nAmount: RM " + this.txnlog['pin_value'] +
        "\n\n" + FONT_DOUBLE_WIDTH_ONLY + this.txnlog['pin_string'] + FONT_RESET +
        "\n" + this.txnlog['footer'] +
        "\n" + FONT_SMALL + this.copy + "\n\n\n";

        this.toPrintTemplate = this.prepaidTemplate;
        this.print(this.txnlog, this.toPrintTemplate);
      }

    } else {
      let mno= await this.alertCtrl.create({
        message:"Print receipt Error get data",
        buttons:['Dismiss']
      });
     await mno.present();
    }
  }



 async shareReceipt() {
    if(this.txnlog) {
      if(this.txnlog['telco'].toLowerCase().includes('ereload')) {
        this.prepaidTemplate =  this.txnlog['telco'].toUpperCase() +
        // "\n" + this.printData['mmp_business_name'] +
        "\nMerchant ID: " + this.mid +
        "\n" + "Tarikh: " + this.txnlog['timestamp'] +
        "\nTxn: " + this.txnlog['trans_id'] +
        "\nAmount: RM " + this.txnlog['pin_value'] +
        "\n" + this.txnlog['footer'] +
        "\n\n" + this.copy + "\n\n" ;
      } else {
        this.prepaidTemplate =  this.txnlog['telco'].toUpperCase() +
        // "\n" + this.printData['mmp_business_name'] +
        "\nMerchant ID: " + this.mid +
        "\n" + "Tarikh: " + this.txnlog['timestamp'] +
        "\nTxn: " + this.txnlog['trans_id'] +
        "\nNo. Siri:" + this.txnlog['pin_serial'] +
        "\nAmount: RM " + this.txnlog['pin_value'] +
        "\nPIN: " + this.txnlog['pin_string'] +
        "\n" + this.txnlog['footer'] +
        "\n\n" + this.copy + "\n\n" ;
      }
    
      await Share.share({text:this.prepaidTemplate})
    //   .then((data) =>
    //   {
    //     console.log(data);
    //     console.log('Shared via SharePicker');
    //   })
    //   .catch(async(err) =>
    //   {
    //     let xyz = await this.alertCtrl.create({
    //       header: '',
    //       buttons:  [
    //         {
    //           text: 'Error sharing receipt.' + err,
    //           handler: () => {
              
    //           }
    //         }
    //       ]
    //     });
    //    await xyz.present();
    //     console.log('Was not shared via SharePicker: ' + err);
    //   });
    // } else {
    //   let mno= await this.alertCtrl.create({
    //     header:"Error get data",
    //     buttons:['Dismiss']
    //   });
    //  await mno.present();
    }
  }

 async print(data, selectedTemplate) {
    try {
      console.log('print ');
      console.log(data);
      var ls = new SecureLS({encodingType: 'aes'});
      this.printer = ls.get('printer');

      var id= "";
      if(this.printer && this.printer.id){
        id= this.printer.id;
      }
      console.log('printer: ' + id);
      if(id==null||id==""||id==undefined)
      {
        console.log('no pritner selected');
        //nothing happens, you can put an alert here saying no printer selected
        let mno= await this.alertCtrl.create({
          header:"No printer selected",
          buttons:[{
            text: 'Select printer',
            handler: () => {
              this.listBTDevice();
            }
          }]
        });
       await mno.present();
      }
      else if (!data) {
        console.log('no data');
        let mno= await this.alertCtrl.create({
          header:"No data",
          buttons:['Dismiss']
        });
       await mno.present();
      }
      else
      {
        console.log('print now');
        // this.printProvider.checkIsDeviceConnected()
        //   .then(res=> {
        //     console.log(res);

        let foo= await this.PrintService.testPrint(id, data, selectedTemplate, null);
        //   }).catch(error=> {
        //     console.log('error: ' + error);
        //     this.listBTDevice();
        //
        // })
      }
    } catch(ex) {
      let mno= await this.alertCtrl.create({
        header:"Error printing " + ex,
        buttons:['Dismiss']
      });
     await mno.present();
    }
  }


  generateBarcode(ean_code:any) {
    try{
      if(ean_code) { 
        ean_code = ean_code.substr(0, 12); //9555077210010

        setTimeout(function(){
          JsBarcode("#barcode", ean_code, {
            marginLeft: 10,
            marginTop: 20,
            marginRight: 10,
            marginBottom: 20,
            height: 60,
            format: "EAN13",
            font: '14'
          });
        }, 1000);
      }
    } catch (error) {
      console.log('error gen barcode: ' + error);
    }
  }

  listBTDevice() {
    this.PrintService.checkBluetoothEnabled().then(async data => {
      if(data == 'success') {
        this.PrintService.searchBt().then(async datalist => {
          console.log('search: ' + datalist);
          console.log(datalist);

          if(datalist.length === 0) {
            let mno= await this.alertCtrl.create({
              header:"No available printer.",
              buttons:['Dismiss']
            });
           await mno.present();
            // return;
          }

          //1. Open printer select modal
          let abc= await this.modalCtrl.create({component:PrinterListModalPage,componentProps:{data:datalist}});

          //2. Printer selected, save into this.selectedPrinter
          abc.onDidDismiss().then(async(data:any)=>{
            console.log(data);

            if(data.data) {
              this.selectedPrinter=data.data;
              var ls = new SecureLS({encodingType: 'aes'});
              this.printer = ls.set('printer', this.selectedPrinter);

              let xyz = await this.alertCtrl.create({
                header: data.name + " selected",
                buttons:  [
                  {
                    text: 'OK',
                    handler: () => {
                      console.log('print after connect to printer');
                      console.log(this.toPrintTemplate);
                      let foo= this.PrintService.testPrint(this.selectedPrinter.id, data, this.toPrintTemplate, null);
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

        },async err=>{
          console.log("ERROR",err);
          let mno= await this.alertCtrl.create({
            header:"ERROR "+err,
            buttons:['Dismiss']
          });
         await mno.present();
        })

      } else {
        let mno= await this.alertCtrl.create({
          header:"Please make sure bluetooth is turned on.",
          buttons:['Dismiss']
        });
       await mno.present();
      }
    },async err=>{
      console.log("ERROR",err);
      let mn= await this.alertCtrl.create({
        header:"ERROR "+err,
        buttons:['Dismiss']
      });
     await mn.present();
    }) 

  }



  async disconnectPrinter() {
    try {
      var ls = new SecureLS({ encodingType: 'aes' });
      this.printer = ls.get('printer');

      if (this.printer) {
        this.PrintService.disconnectPrinter();
        let xyz = await this.alertCtrl.create({
          header: 'Printer disconnected.',
          buttons: [
            {
              text: 'Dismiss',
              handler: () => {
                ls.remove('printer');

              }
            }
          ]
        });
       await xyz.present();
      } else {
        let xyz = await this.alertCtrl.create({
          header: 'Printer already disconnected.',
          buttons: [
            {
              text: 'Dismiss',
              handler: () => {

              }
            }
          ]
        });
        await xyz.present();
      }
    } catch (ex) {
      let xyz = await this.alertCtrl.create({
        header: 'Error disconnect printer.',
        buttons: [
          {
            text: 'Dismiss',
            handler: () => {

            }
          }
        ]
      });
      await xyz.present();
    }
  }

  async dismiss() {
   await this.modalCtrl.dismiss();
  }


}