"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const config_module_1 = require("../utils/config_module");
const logger_module_1 = require("../utils/logger_module");
class InicioProceso {
    constructor() {
        this.config = {
            host: config_module_1.default.HOST_BD,
            user: config_module_1.default.USER_BD,
            password: config_module_1.default.PASS_BD
        };
        this.conn = mysql.createConnection(this.config);
    }
    iniciarProceso(input) {
        let SQL = `INSERT INTO prototipo.mv_proceso_etl (uuid, fechaInicio, estaActivo) VALUES (?)`;
        this.conn.query(SQL, [input], (err, res) => {
            if (err)
                logger_module_1.default("INSERT error", JSON.stringify(err));
            logger_module_1.default("INSERT res", JSON.stringify(res));
        });
        //this.conn.end()
    }
    finalizarProceso(input) {
        let SQL = `UPDATE prototipo.mv_proceso_etl SET fechaFin = "${input['fechaFin']}", estaActivo = 1
    WHERE uuid like "${input['uuid']}" `;
        this.conn.query(SQL, (err, res) => {
            if (err)
                logger_module_1.default("UPDATE error", JSON.stringify(err));
            logger_module_1.default("UPDATE res", JSON.stringify(res));
        });
        //this.conn.end()
    }
    verificarProceso(input) {
        let SQL = `SELECT estaActivo from prototipo.mv_proceso_etl WHERE datasetId = ?`;
        this.conn.query(SQL, input, (err, res) => {
            if (err)
                logger_module_1.default("SELECT error", JSON.stringify(err));
            logger_module_1.default("SELECT res", JSON.stringify(res));
        });
        //this.conn.end()
    }
    endConnection() {
        this.conn.end();
    }
}
exports.default = new InicioProceso();
//# sourceMappingURL=proceso_service.js.map