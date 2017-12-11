"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const csvHeaders = require("csv-headers");
const parse = require("csv-parse");
const async = require("async");
const mysql = require("mysql");
const util = require("util");
const config_module_1 = require("../utils/config_module");
const logger_module_1 = require("../utils/logger_module");
class CargaData {
    constructor() { }
    iniciarCarga() {
        this.dir = path.join(__dirname, '../../../tmp_mod/');
        logger_module_1.default("El Directorio", this.dir);
        var promise = new Promise((resolve, reject) => {
            fs.readdir(this.dir, (erro, files) => {
                if (erro)
                    reject(erro);
                files = files.sort();
                files.forEach((file, fcount) => {
                    let s = String(file);
                    s = s.split('.');
                    s = s[0].split('_');
                    let tblname = s[0].toLowerCase();
                    logger_module_1.default("El Nombre de la tabla", tblname);
                    //Primer Bloque: Lectura de las cabeceras de cada uno de los archivos, además
                    //se definen los limitadores de datos en el archivo CSV
                    csvHeaders({
                        file: `${this.dir}${file}`,
                        delimiter: ','
                    }, function (err, headers) {
                        if (err)
                            reject(err);
                        else
                            resolve({ headers: headers, tblname: tblname, file: file });
                    });
                });
            });
        });
        return promise;
    }
    getConnection(context) {
        //Conexion de base de datos para crear Pool's y poder realizar
        var promise = new Promise((resolve, reject) => {
            try {
                context.db = mysql.createPool({
                    connectionLimit: 10,
                    host: config_module_1.default.HOST_BD,
                    user: config_module_1.default.USER_BD,
                    password: config_module_1.default.PASS_BD,
                    database: 'prototipo'
                });
                resolve(context);
            }
            catch (error) {
                console.error(error);
                reject(error);
            }
        });
        return promise;
    }
    dropTables(context) {
        var promise = new Promise((resolve, reject) => {
            context.db.getConnection((error, connection) => {
                //Se hace un DROP sobre las tablas si que estas existen
                //Ya que el propósito de la extración es suplantar todo
                if (error)
                    reject(error);
                connection.query(`DROP TABLE IF EXISTS ${context.tblname}`, [], err => {
                    if (err)
                        reject(err);
                    else
                        connection.release();
                    resolve(context);
                });
            });
        });
        return promise;
    }
    createTables(context) {
        var promise = new Promise((resolve, reject) => {
            let fields = '';
            let fieldnms = '';
            let qs = '';
            //Se recorren las cabeceras de los archivos CSV para
            //obtener los nombres de los campos de las tablas
            //Que se crearan en este paso
            context.headers.forEach(hdr => {
                hdr = hdr.replace(/\s/g, '_');
                hdr = `\`${hdr}\``;
                if (fields !== '')
                    fields += ',';
                if (fieldnms !== '')
                    fieldnms += ',';
                if (qs !== '')
                    qs += ',';
                fields += ` ${hdr} TEXT`;
                fieldnms += ` ${hdr}`;
                qs += ' ?';
            });
            context.qs = qs;
            context.fieldnms = fieldnms;
            //Ejecución de la QUERY que crea las tablas
            context.db.getConnection((error, connection) => {
                if (error)
                    reject(error);
                connection.query(`CREATE TABLE IF NOT EXISTS ${context.tblname} ( ${fields} )
        CHARACTER SET utf8 COLLATE utf8_general_ci`, [], err => {
                    if (err)
                        reject(err);
                    else {
                        connection.release();
                        resolve(context);
                    }
                });
            });
        });
        return promise;
    }
    insertDataToTables(context) {
        //logger("Insert Data To Tables", context.file)
        var promise = new Promise((resolve, reject) => {
            fs.createReadStream(`${this.dir}${context.file}`).pipe(parse({
                delimiter: ',',
                columns: true,
                relax_column_count: true
            }, (err, data) => {
                if (err)
                    reject(err);
                async.eachSeries(data, (datum, next) => {
                    logger_module_1.default("A punto de", `run INSERT INTO ${context.tblname} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`);
                    var d = [];
                    try {
                        context.headers.forEach(hdr => {
                            d.push(datum[hdr]);
                        });
                    }
                    catch (e) {
                        console.error(e.stack);
                    }
                    // console.log(`${d.length}: ${util.inspect(d)}`);
                    if (d.length > 0) {
                        context.db.query(`INSERT INTO ${context.tblname} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`, d, err => {
                            if (err) {
                                logger_module_1.default("Ocurrió un error", err);
                                next(err);
                            }
                            else
                                setTimeout(() => { next(); });
                        });
                    }
                    else {
                        logger_module_1.default("Mensaje", `empty row ${util.inspect(datum)} ${util.inspect(d)}`);
                        next();
                    }
                }, err => {
                    if (err)
                        reject(err);
                    else
                        context.finaliza = true;
                    resolve(context);
                });
            }));
        });
        return promise;
    }
}
exports.default = new CargaData();
//# sourceMappingURL=carga_data_module.js.map