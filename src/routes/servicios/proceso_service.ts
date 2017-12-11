import * as mysql from 'mysql'
import entorno from '../utils/config_module'
import logger from '../utils/logger_module'

class InicioProceso {
  private config: any
  private conn: any

  constructor() {
    this.config = {
        host: entorno.HOST_BD,
        user: entorno.USER_BD,
        password: entorno.PASS_BD
    }
    this.conn = mysql.createConnection(this.config)
  }

  public iniciarProceso(input: any): void {
    let SQL = `INSERT INTO prototipo.mv_proceso_etl (uuid, fechaInicio, estaActivo) VALUES (?)`
    this.conn.query(SQL, [input], (err, res) => {
      if(err) logger("INSERT error", JSON.stringify(err))
      logger("INSERT res", JSON.stringify(res))

    })
    //this.conn.end()
  }

  public finalizarProceso(input: any): void {

    let SQL = `UPDATE prototipo.mv_proceso_etl SET fechaFin = "${input['fechaFin']}", estaActivo = 1
    WHERE uuid like "${input['uuid']}" `

    this.conn.query(SQL, (err, res) => {
      if(err) logger("UPDATE error", JSON.stringify(err))
      logger("UPDATE res", JSON.stringify(res))

    })
    //this.conn.end()
  }

  public verificarProceso(input: any): void {
    let SQL = `SELECT estaActivo from prototipo.mv_proceso_etl WHERE datasetId = ?`
    this.conn.query(SQL, input, (err, res) => {
      if(err) logger("SELECT error", JSON.stringify(err))
      logger("SELECT res", JSON.stringify(res))

    })
    //this.conn.end()
  }

  public endConnection(): void{
    this.conn.end()
  }
}

export default new InicioProceso()
