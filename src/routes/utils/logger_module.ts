import * as moment from 'moment'
class Logs {

  constructor(){}

  public logger(preNombre?:any, mensaje?:any): void {
    let fechaActual = moment().format('YYYY-MM-DD h:mm:ss')
    if(preNombre && mensaje){
      console.log(`${fechaActual} - ${preNombre} : ${mensaje}`)
    }else {
      console.log(`${fechaActual} : ${mensaje}`)
    }

  }
}
export default new Logs().logger
