import { Component, OnInit ,Input } from '@angular/core';
import { NavParams, NavController, AlertController,ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
})
export class CustomSelectComponent implements OnInit {

  @Input() data :any;
  @Input() country:any;
  @Input() cardtypeflag:any;
 

  // data: any = this.navParams.get('data');
  // country: any = this.navParams.get('country');
  // cardtype: any = this.navParams.get('cardtypeflag');
  //sender: any = this.data ? this.data[0][5] : '';
  sender:any;
  cardtype :any
  senderArray = [];


  constructor(public navParams: NavParams, public navCtrl: NavController,
    private alertCtrl: AlertController, public modalCtrl:ModalController) {
     
     }

  ngOnInit() {
    this.sender= this.data ? this.data[0][5] : '';

    this.cardtype = this.cardtypeflag
    console.log("this.cardtype",this.cardtype)
    console.log ("sender",this.country)
    
  //console.log('Hello CustomSelectPage Page'); */
/*     console.log(this.data); */
    try {
      // console.log(this.data);
      if(this.data) {
        // const map = new Map();
        // for (const item of this.data) {
        //   if(!map.has(item[5])) { 
        //     map.set(item[5], true);  
        //     console.log(map);
        //     if(item[4].indexOf(this.country) > -1) //exist
        //       // set any value to Map
        //       this.senderArray.push({
        //           name: item[5],
        //           country: item[4]
        //       });
        //   }
        // }

        for (const item of this.data) {
          if(item[4].indexOf(this.country) > -1) { //if match with selected country
            this.senderArray.push({
              name: item[5],
              country: item[4]
            });      
          }   
        }

        this.senderArray = this.removeDuplicates(this.senderArray, "name"); // filter duplicate name
        this.sender = this.senderArray ? this.senderArray[0]['name'] : '';

        console.log(this.senderArray);
        console.log(this.sender);
    
      }     
    } catch(error) {
      console.log('error get benelist ' + error);
    }
  }

  
  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}

dismiss() {
  this.modalCtrl.dismiss();
}

dismisswithVal(val:any){

 
  let data = {'return':val};
  
  this.modalCtrl.dismiss(data);
}
 
getUriEncodeUrl(category,name){ 
  return 'https://mmwalletapp.ezeemoney.biz:4322/'+category+'/'+encodeURI(name)+'.png'
 }

}
