"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const readline = require("readline");
const stream = require("stream");
const path = require("path");
const moment = require("moment");
// rl.on('close', function() {
//   // do something on finish here
// });
class Readfile {
    contructor() {
        //this.eventManager()
    }
    initProcess(req, res) {
        this.dir = path.join(__dirname, '../../../tmp_dt');
        this.instream = fs.createReadStream(`${this.dir}/SessionHistory.csv`);
        this.outstream = new stream;
        this.rl = readline.createInterface(this.instream, this.outstream);
        this.fechaActual = moment().format('YYYY-MM-DD h:mm:ss');
        this.idProceso = 1;
        var contador = 0;
        //Evento de lectura de linea
        this.rl.on('line', line => {
            if (contador <= 0) {
                line += ', IdProceso, FechaProceso\n';
            }
            else if (contador > 0) {
                line += `, ${this.idProceso}, ${this.fechaActual}\n`;
            }
            contador += 1;
            fs.appendFile(`${this.dir}/SessionHistory_Modificado.csv`, line, err => {
                if (err)
                    throw err;
            });
        });
        //Evento cuando se termina de ejecutar el proceso de lectura y se cierra
        //el archivo
        this.rl.on('close', () => {
            res.json({
                status: 200,
                message: `Se termino de ejecutar el proceso de introduccion`
            });
            contador = 0;
            //console.log(contador)
        });
    }
}
exports.default = new Readfile().initProcess;
//# sourceMappingURL=readfile_service.js.map