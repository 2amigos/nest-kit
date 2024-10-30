import * as webpack from 'webpack';
import { Observable } from 'rxjs';
export declare function runWebpack(config: webpack.Configuration): Observable<webpack.Stats>;
