import * as express from 'express'
import readfile from './servicios/readfile_service'
//la clase Dataset se encargará de realizar todas las operaciones con los
//datasets de Brigthspace
class Dataset {
  public router

  constructor(){
    this.router = express.Router()
    this.mountRoutes()
  }

  private mountRoutes(): void {
    this.router.get('/', (req, res) => {
      readfile(req, res)
    })
  }
}

export default new Dataset().router
