import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
    name: 'myfilter2',
    pure: false
})
@Injectable()
export class MyFilterPipe2 implements PipeTransform {
    transform(items: any[], args1: any[], args2: any[]): any {
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items.filter(item => item.indexOf(args1) > -1 && item.indexOf(args2) > -1);
    }
}