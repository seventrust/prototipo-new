"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uuid = require("uuid/v4");
const moment = require("moment");
const proceso_service_1 = require("./servicios/proceso_service");
const logger_module_1 = require("./utils/logger_module");
const carga_data_module_1 = require("./modulos/carga_data_module");
//la clase Dataset se encargará de realizar todas las operaciones con los
//datasets de Brigthspace
class Dataset {
    constructor() {
        this.router = express.Router();
        this.mountRoutes();
    }
    mountRoutes() {
        let finProceso;
        this.router.get('/', (req, res) => {
            //Se notifica a la base de datos que el proceso se va a iniciar
            //para ello se arma un arreglo con los datos necesarios
            res.status(200).send({ mensaje: `Espera sentado a que termine este proceso` });
            this.readWriteFile();
        });
    }
    readWriteFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let input = [];
            let idProceso = uuid();
            input.push(idProceso);
            input.push(moment().format('YYYY-MM-DD h:mm:ss'));
            input.push(1);
            proceso_service_1.default.iniciarProceso(input);
            this.notificarFinDelProceso(idProceso, 0);
            // let result = await readfile(idProceso, 0)
            // // .then(result => {
            // logger("Es verdad o mentira", result)
            // if(result.estado == true){
            //   this.notificarFinDelProceso(idProceso, result.contador)
            // }else{
            //   logger("Mala", result)
            // }
        });
    }
    notificarFinDelProceso(id, count) {
        return __awaiter(this, void 0, void 0, function* () {
            let input = [];
            input['fechaFin'] = moment().format('YYYY-MM-DD h:mm:ss');
            input['fileOffset'] = count;
            input['uuid'] = id;
            //Se hace el llamdo al metodo para empezar a realizar la carga del cvs
            var context = yield carga_data_module_1.default.iniciarCarga();
            logger_module_1.default("Contexto parte 1", JSON.stringify(context));
            context = yield carga_data_module_1.default.getConnection(context);
            logger_module_1.default("Contexto parte 2", context);
            context = yield carga_data_module_1.default.dropTables(context);
            //logger("Contexto parte 3", context)
            context = yield carga_data_module_1.default.createTables(context);
            //logger("Contexto parte 4", context)
            context = yield carga_data_module_1.default.insertDataToTables(context);
            //logger("Contexto parte 5", context)
            if (!context.finaliza) {
                logger_module_1.default('Mala', 'Ocurrio algo muy malo xD');
            }
            else {
                proceso_service_1.default.finalizarProceso(input);
            }
            //
        });
    }
}
exports.default = new Dataset().router;
//# sourceMappingURL=Dataset.js.map