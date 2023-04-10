import { Component, OnInit ,Input } from '@angular/core';

import {  NavController, NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-printer-list-modal',
  templateUrl: './printer-list-modal.page.html',
  styleUrls: ['./printer-list-modal.page.scss'],
})
export class PrinterListModalPage implements OnInit {

  printerList:any=[];

  @Input() data:any

  constructor(public navCtrl: NavController, public navParams: NavParams , public modalCtrl:ModalController) { }

  ngOnInit() {
    this.printerList= this.data;

    console.log ("this.printerlist",this.printerList)
  }

  select(data:any)
  {
    this.modalCtrl.dismiss(data);
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

}