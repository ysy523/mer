import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
    name: 'telcofilter',
    pure: false
})
@Injectable()
export class MyTelcoFilterPipe implements PipeTransform {
    transform(items: any[], args: any[]): any {
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items.filter(item => item['telco'] == args);
    }
}