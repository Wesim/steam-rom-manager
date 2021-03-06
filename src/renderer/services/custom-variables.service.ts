import { Injectable } from '@angular/core';
import { json } from "../../lib";
import { CustomVariables } from "../../models";
import { LoggerService } from './logger.service';
import { BehaviorSubject } from "rxjs";
import { APP } from '../../variables';
import * as paths from "../../paths";
import * as schemas from '../schemas';
import * as _ from "lodash";

@Injectable()
export class CustomVariablesService {
    private variableData: BehaviorSubject<CustomVariables> = new BehaviorSubject({});
    private validator: json.Validator = new json.Validator(schemas.customVariables);
    private savingIsDisabled: boolean = false;

    constructor(private loggerService: LoggerService) {
        json.read<CustomVariables>(paths.customVariables, {}).then((data) => {
            let errors = this.validator.validate(data);
            let errorString = errors ? `\r\n${JSON.stringify(errors, null, 4)}` : '';

            if (errorString.length > 0) {
                this.savingIsDisabled = true;
                this.loggerService.error(this.lang.error.readingError, { invokeAlert: true, alertTimeout: 5000, doNotAppendToLog: true });
                this.loggerService.error(this.lang.error.corruptedVariables__i.interpolate({
                    file: paths.customVariables,
                    error: errorString
                }));
            }
            else
                this.variableData.next(data);
        }).catch((error) => {
            this.loggerService.error(this.lang.error.readingError, { invokeAlert: true, alertTimeout: 3000 });
            this.loggerService.error(error);
        });
    }

    private get lang() {
        return APP.lang.customVariables.service;
    }

    get data() {
        return this.variableData.getValue();
    }

    get dataObservable() {
        return this.variableData.asObservable();
    }

    saveVariableData() {
        if (!this.savingIsDisabled) {
            json.write(paths.customVariables, this.variableData.getValue()).then().catch((error) => {
                this.loggerService.error(this.lang.error.writingError, { invokeAlert: true, alertTimeout: 3000 });
                this.loggerService.error(error);
            });
        }
    }
}