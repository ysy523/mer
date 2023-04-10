import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrinterListModalPage } from './printer-list-modal.page';

const routes: Routes = [
  {
    path: '',
    component: PrinterListModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrinterListModalPageRoutingModule {}
