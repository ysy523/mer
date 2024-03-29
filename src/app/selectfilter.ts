import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
    name: 'myfilter',
    pure: false
})
@Injectable()
export class MyFilterPipe implements PipeTransform {
    transform(items: any[], args: any[]): any {
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items.filter(item => item.indexOf(args) > -1);
    }
}