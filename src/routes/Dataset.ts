import * as express from 'express'
import * as uuid from 'uuid/v4'
import * as moment from 'moment'
import readfile from './servicios/readfile_service'
import inicioProceso from './servicios/proceso_service'
import logger from './utils/logger_module'
import cargaData from './modulos/carga_data_module'
//la clase Dataset se encargará de realizar todas las operaciones con los
//datasets de Brigthspace
class Dataset {
  public router
  private config

  constructor(){
    this.router = express.Router()
    this.mountRoutes()
  }

  public mountRoutes():void {
    let finProceso: boolean
    this.router.get('/', (req, res) => {
      //Se notifica a la base de datos que el proceso se va a iniciar
      //para ello se arma un arreglo con los datos necesarios
      res.status(200).send({mensaje: `Espera sentado a que termine este proceso`})
      this.readWriteFile()
    })
  }

  private async readWriteFile(): Promise<void> {
    let input: any  = []
    let idProceso = uuid()
    input.push(idProceso)
    input.push(moment().format('YYYY-MM-DD h:mm:ss'))
    input.push(1)

    inicioProceso.iniciarProceso(input)
    this.notificarFinDelProceso(idProceso, 0)
    // let result = await readfile(idProceso, 0)
    // // .then(result => {
    // logger("Es verdad o mentira", result)
    // if(result.estado == true){
    //   this.notificarFinDelProceso(idProceso, result.contador)
    // }else{
    //   logger("Mala", result)
    // }

  }

  private async notificarFinDelProceso(id: string, count: number): Promise<void> {
    let input: any = []
    input['fechaFin'] = moment().format('YYYY-MM-DD h:mm:ss')
    input['fileOffset'] = count
    input['uuid'] = id
    //Se hace el llamdo al metodo para empezar a realizar la carga del cvs
    var context = await cargaData.iniciarCarga()
    //logger("Contexto parte 1", JSON.stringify(context))
    context = await cargaData.getConnection(context)
    //logger("Contexto parte 2", context)
    context = await cargaData.dropTables(context)
    //logger("Contexto parte 3", context)
    context = await cargaData.createTables(context)
    //logger("Contexto parte 4", context)
    context = await cargaData.insertDataToTables(context)
    logger("Contexto parte 5", context)
    if(!context.finaliza){
      logger('Mala', 'Ocurrio algo muy malo xD')
    }else {
      inicioProceso.finalizarProceso(input)
    }
    //

  }
}

export default new Dataset().router
