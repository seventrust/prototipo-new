import * as fs from 'fs'
import * as readline from  'readline'
import * as stream from 'stream'
import * as path from 'path'
import * as moment from 'moment'
// rl.on('close', function() {
//   // do something on finish here
// });

class Readfile {
  public instream
  public outstream
  public rl
  public dir
  private fechaActual
  private idProceso
  contructor(){
    //this.eventManager()
  }

  public initProcess(req: any, res: any): void {

    this.dir = path.join(__dirname, '../../../tmp_dt')
    this.instream = fs.createReadStream(`${this.dir}/SessionHistory.csv`)
    this.outstream = new stream
    this.rl = readline.createInterface(this.instream, this.outstream)
    this.fechaActual = moment().format('YYYY-MM-DD h:mm:ss')
    this.idProceso = 1
    var contador: number = 0
    //Evento de lectura de linea
    this.rl.on('line', line => {
      if(contador <= 0){
        line += ', IdProceso, FechaProceso\n'
      }else if(contador > 0){
        line += `, ${this.idProceso}, ${this.fechaActual}\n`
      }

      contador+=1
      fs.appendFile(`${this.dir}/SessionHistory_Modificado.csv`, line, err => {
        if (err) throw err
      })

    })
    //Evento cuando se termina de ejecutar el proceso de lectura y se cierra
    //el archivo
    this.rl.on('close', () => {
      res.json({
        status: 200,
        message: `Se termino de ejecutar el proceso de introduccion`
      })
      contador = 0
      //console.log(contador)
    })
  }
}

export default new Readfile().initProcess
