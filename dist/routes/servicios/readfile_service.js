"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
//import * as readline from  'readline'
//import * as stream from 'stream'
const lineReader = require("line-by-line");
const path = require("path");
const moment = require("moment");
const logger_module_1 = require("../utils/logger_module");
// rl.on('close', function() {
//   // do something on finish here
// });
class Readfile {
    contructor() {
    }
    initProcess(idProceso, fileOffset) {
        var contador = 0;
        let options = {
            encoding: 'utf8',
            skipEmptyLines: true,
            start: fileOffset
        };
        this.dir = path.join(__dirname, '../../../tmp_dt');
        this.dir_mod = path.join(__dirname, '../../../tmp_mod');
        this.lr = new lineReader(`${this.dir}/SessionHistory.csv`, options);
        this.fechaActual = moment().format('YYYY-MM-DD h:mm:ss');
        var promise = new Promise((resolve, reject) => {
            this.lr.on('line', line => {
                if (contador <= 0) {
                    line += ', IdProceso, FechaProceso\n';
                }
                else if (contador > 0) {
                    line += `, ${idProceso}, ${this.fechaActual}\n`;
                }
                contador += 1;
                fs.appendFile(`${this.dir_mod}/SessionHistory_Modificado.csv`, line, err => {
                    if (err)
                        reject(err);
                });
            });
            this.lr.on('error', error => {
                if (error)
                    reject(error);
            });
            this.lr.on('end', () => {
                resolve({ estado: true, offset: contador });
                contador = 0;
                logger_module_1.default("CONTADOR - CLOSE", contador);
            });
        });
        return promise;
    }
}
exports.default = new Readfile().initProcess;
//# sourceMappingURL=readfile_service.js.map