"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const readfile_service_1 = require("./servicios/readfile_service");
//la clase Dataset se encargará de realizar todas las operaciones con los
//datasets de Brigthspace
class Dataset {
    constructor() {
        this.router = express.Router();
        this.mountRoutes();
    }
    mountRoutes() {
        this.router.get('/', (req, res) => {
            readfile_service_1.default(req, res);
        });
    }
}
exports.default = new Dataset().router;
//# sourceMappingURL=Dataset.js.map