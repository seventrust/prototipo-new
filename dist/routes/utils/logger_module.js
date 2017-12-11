"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
class Logs {
    constructor() { }
    logger(preNombre, mensaje) {
        let fechaActual = moment().format('YYYY-MM-DD h:mm:ss');
        if (preNombre && mensaje) {
            console.log(`${fechaActual} - ${preNombre} : ${mensaje}`);
        }
        else {
            console.log(`${fechaActual} : ${mensaje}`);
        }
    }
}
exports.default = new Logs().logger;
//# sourceMappingURL=logger_module.js.map