"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envJSON = require('../../../config.json');
class Config {
    constructor() {
        let node_env = process.env.NODE_ENV || 'development';
        this.jsonENV = envJSON[node_env];
    }
}
exports.default = new Config().jsonENV;
//# sourceMappingURL=config_module.js.map