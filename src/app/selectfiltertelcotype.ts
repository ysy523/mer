import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
    name: 'telcotypefilter',
    pure: false
})
@Injectable()
export class MyTelcoTypeFilterPipe implements PipeTransform {
    transform(items: any[], args: any[]): any {
        console.log ("items", args )
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items.filter(item => item['is_ereload'] == args);
    }
}