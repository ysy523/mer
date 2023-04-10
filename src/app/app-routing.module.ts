import { KadarComponent } from './kadar/kadar.component';
import { RedeemComponent } from './redeem/redeem.component';
import { InviteComponent } from './invite/invite.component';
import { EStampComponent } from './e-stamp/e-stamp.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { BookinglistComponent } from './bookinglist/bookinglist.component';
import { LogComponent } from './log/log.component';
// import { MenuComponent } from './menu/menu.component';
// import { PinComponent } from './pin/pin.component';
// import { PrepaidComponent } from './prepaid/prepaid.component';
// import { PrepaidlistComponent } from './prepaidlist/prepaidlist.component';
import { RemittanceComponent } from './remittance/remittance.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CustomSelectComponent } from './custom-select/custom-select.component';

const routes: Routes = [
  { path:'',component:LoginComponent},
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'remittance', component: RemittanceComponent },
  // { path: 'prepaidlist', component: PrepaidlistComponent },
  // { path: 'prepaid', component: PrepaidComponent },
  // { path: 'pin', component: PinComponent },
  // { path: 'menu', component: MenuComponent },
  { path: 'log', component: LogComponent },
  { path: 'customselect', component: CustomSelectComponent },
  { path: 'bookinglist', component: BookinglistComponent },
  { path: 'announcement', component: AnnouncementComponent },
  {path :'kadar',component:KadarComponent},
  { path: 'estamp', component: EStampComponent },
  {path :'invite',component:InviteComponent},
  {path :'redeem',component:RedeemComponent}

  
  // {
  //   path: 'eremitreceipt',
  //   loadChildren: () => import('./eremitreceipt/eremitreceipt.module').then( m => m.EremitreceiptPageModule)
  // },
  // {
  //   path: 'printer-list-modal',
  //   loadChildren: () => import('./printer-list-modal/printer-list-modal.module').then( m => m.PrinterListModalPageModule)
  // }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}