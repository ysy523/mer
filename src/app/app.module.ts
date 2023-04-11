import { Http } from '@capacitor-community/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy,NavParams } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
// import { Idle, NgIdleModule} from '@ng-idle/core';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { BookinglistComponent } from './bookinglist/bookinglist.component';
import { HomeComponent } from './home/home.component';
import { LogComponent } from './log/log.component';
// import { MenuComponent } from './menu/menu.component';
import { PinComponent } from './pin/pin.component';
import { PrepaidComponent } from './prepaid/prepaid.component';
import { PrepaidmodalComponent } from './prepaidmodal/prepaidmodal.component';
import { PrepaidlistComponent } from './prepaidlist/prepaidlist.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { RemittanceComponent } from './remittance/remittance.component';
import { CustomSelectComponent } from './custom-select/custom-select.component';
// import { PrepaidmodalComponent } from './prepaidmodal/prepaidmodal.component';
import { EStampComponent } from './e-stamp/e-stamp.component';
import { InviteComponent } from './invite/invite.component';
import { RedeemComponent } from './redeem/redeem.component';
import { GmodalComponent } from './gmodal/gmodal.component';
import { KadarComponent } from './kadar/kadar.component';


import { TabIndexDirective } from './focusnext';
import { MyFilterPipe } from './selectfilter';
import { MyFilterPipe2 } from './selectfilter2';
import { MyFilterPipe3 } from './selectfilter3';
import { MyTelcoFilterPipe } from './selectfiltertelco';
import { MyTelcoTypeFilterPipe } from './selectfiltertelcotype';
// import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
// import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
// import { Network } from '@awesome-cordova-plugins/network/ngx';
// import { Market } from "@ionic-native/market/ngx";
// import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import {IonicImageLoaderModule } from 'ionic-image-loader-v5';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Sql } from 'src/services/Sql';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
// import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
// import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
// import { MobileAccessibility } from "@ionic-native/mobile-accessibility/ngx";
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
// import { Sim } from "@ionic-native/sim/ngx";
// import { Device } from '@awesome-cordova-plugins/device/ngx';
// import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
// import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';




@NgModule({
  declarations: [AppComponent,LoginComponent,AnnouncementComponent,HomeComponent, ReceiptComponent,RemittanceComponent ,CustomSelectComponent,GmodalComponent,KadarComponent,EStampComponent,RedeemComponent,BookinglistComponent,InviteComponent,LogComponent,MyFilterPipe,MyFilterPipe2,MyFilterPipe3,MyTelcoFilterPipe,MyTelcoTypeFilterPipe,TabIndexDirective,PrepaidComponent ,PrepaidmodalComponent,PrepaidlistComponent,PinComponent],
  imports: [BrowserModule, IonicModule.forRoot({_forceStatusbarPadding: true}), AppRoutingModule,FormsModule,IonicImageLoaderModule] ,
  providers: [File,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },NavParams,WebView, NativeStorage,BluetoothSerial,Camera,BarcodeScanner,InAppBrowser,Sql,MediaCapture ,HTTP  ],
  bootstrap: [AppComponent],
})
export class AppModule {}