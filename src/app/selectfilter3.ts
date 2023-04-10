import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
    name: 'myfilter3',
    pure: false
})
@Injectable()
export class MyFilterPipe3 implements PipeTransform {
    transform(items: any[], args1: any[], args2: any[], args3: any[]): any {
        // filter items array, items which match and return true will be kept, false will be filtered out

        console.log("args1",items)
        console.log("args2",args2)
        console.log("args3",args3)
        
        return items.filter(item => item.indexOf(args1) > -1 && item.indexOf(args2) > -1 && item.indexOf(args3) > -1);
    }
}