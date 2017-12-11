const envJSON = require('../../../config.json')

class Config {
  public jsonENV: any

  constructor(){
    let node_env = process.env.NODE_ENV || 'development'
    this.jsonENV = envJSON[node_env]
  }
}

export default new Config().jsonENV
