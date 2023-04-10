import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrinterListModalPageRoutingModule } from './printer-list-modal-routing.module';

import { PrinterListModalPage } from './printer-list-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrinterListModalPageRoutingModule
  ],
  declarations: [PrinterListModalPage]
})
export class PrinterListModalPageModule {}
