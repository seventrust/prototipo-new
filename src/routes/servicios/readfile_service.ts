import * as fs from 'fs'
//import * as readline from  'readline'
//import * as stream from 'stream'
import * as lineReader from 'line-by-line'
import * as path from 'path'
import * as moment from 'moment'
import logger from '../utils/logger_module'
// rl.on('close', function() {
//   // do something on finish here
// });

class Readfile {
  private dir
  private dir_mod
  private fechaActual
  private lr: lineReader

  contructor(){

  }

  public initProcess(idProceso: string, fileOffset: number): Promise<any> {
    var contador: number = 0
    let options: any = {
      encoding: 'utf8',
      skipEmptyLines: true,
      start: fileOffset
    }
    this.dir = path.join(__dirname, '../../../tmp_dt')
    this.dir_mod = path.join(__dirname, '../../../tmp_mod')
    this.lr = new lineReader(`${this.dir}/SessionHistory.csv`, options)
    this.fechaActual = moment().format('YYYY-MM-DD h:mm:ss')

    var promise = new Promise((resolve, reject) => {

      this.lr.on('line', line => {
        if(contador <= 0){
          line += ', IdProceso, FechaProceso\n'
        }else if(contador > 0){
          line += `, ${idProceso}, ${this.fechaActual}\n`
        }
        contador+=1
        fs.appendFile(`${this.dir_mod}/SessionHistory_Modificado.csv`, line, err => {
          if (err) reject(err)
        })
      })

      this.lr.on('error', error => {
        if (error) reject(error)
      })

      this.lr.on('end', () => {
        resolve({estado: true, offset: contador})
        contador = 0
        logger("CONTADOR - CLOSE", contador)
      })
    })
    return promise
  }
}

export default new Readfile().initProcess
