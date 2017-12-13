import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import * as csvHeaders from 'csv-headers'
import * as parse from 'csv-parse'
import * as async from 'async'
import * as mysql from 'mysql'
import * as util from 'util'
import * as lineReader from 'line-by-line'
import * as leftpad from 'leftpad'
import entorno from '../utils/config_module'
import logger from '../utils/logger_module'

class CargaData {
  private dir
  constructor(){}

  public iniciarCarga(): Promise<any>{

    this.dir = path.join(__dirname, '../../../tmp_mod/')
    logger("El Directorio", this.dir)
    var promise = new Promise((resolve, reject) => {
      fs.readdir(this.dir, (erro, files)=>{
        if(erro) reject(erro)

        files = files.sort()
          files.forEach((file, fcount) => {
            let s: string = String(file)
            s = s.split('.')
            s = s[0].split('_')
            let tblname = s[0].toLowerCase()
            logger("El Nombre de la tabla", tblname)
            //Primer Bloque: Lectura de las cabeceras de cada uno de los archivos, además
            //se definen los limitadores de datos en el archivo CSV
            csvHeaders({
                file      : `${this.dir}${file}`,
                delimiter : ','
            }, function(err, headers) {
                if (err) reject(err)
                else resolve({headers: headers, tblname: tblname, file: file})
            })
          })
        })
    })
    return promise
  }

  public getConnection(context: any): Promise<any> {

    //Conexion de base de datos para crear Pool's y poder realizar
      var promise = new Promise((resolve, reject) => {
        try{
          context.db = mysql.createPool({
            connectionLimit: 10,
            host     :  entorno.HOST_BD,
            user     :  entorno.USER_BD,
            password :  entorno.PASS_BD,
            database :  'prototipo'
          })
          resolve(context)
        }catch(error){
            console.error(error)
            reject(error)
        }
      })

      return promise
  }

  public dropTables(context: any): Promise<any>{
    var promise = new Promise((resolve, reject) => {
      context.db.getConnection((error, connection) => {
        //Se hace un DROP sobre las tablas si que estas existen
        //Ya que el propósito de la extración es suplantar todo
          if(error) reject(error)
          connection.query(`DROP TABLE IF EXISTS ${context.tblname}`,
          [ ],
          err => {
              if (err) reject(err)
              else connection.release(); resolve(context)
          })
      })
    })
    return promise
  }

  public createTables(context: any): Promise<any>{
    var promise = new Promise((resolve, reject) => {
      let fields = ''
      let fieldnms = ''
      let qs = ''
      //Se recorren las cabeceras de los archivos CSV para
      //obtener los nombres de los campos de las tablas
      //Que se crearan en este paso
      context.headers.forEach(hdr => {
        hdr = hdr.replace(/\s/g, '_')
        hdr = `\`${hdr}\``
        if (fields !== '') fields += ','
        if (fieldnms !== '') fieldnms += ','
        if (qs !== '') qs += ','
        fields += ` ${hdr} TEXT`
        fieldnms += ` ${hdr}`
        qs += ' ?'
      });
      context.qs = qs;
      context.fieldnms = fieldnms;
      //Ejecución de la QUERY que crea las tablas
      context.db.getConnection((error, connection) => {
        if(error) reject(error)
        connection.query(`CREATE TABLE IF NOT EXISTS ${context.tblname} ( ${fields} )
        CHARACTER SET utf8 COLLATE utf8_general_ci`,
        [ ],
        err => {
          if (err) reject(err)
          else{
            connection.release()
            resolve(context)
          }
        })
      })
    })

    return promise
  }

  public insertDataToTables(context: any): Promise<any> {
    try{
      let finalString: string  = ""
      //Aquí iría el número real del offset o la cadena
      //para saber cual fué la última línea
      let offset = 0
      let preArray = []
      let finalArray = []
      var promise = new Promise((resolve, reject) => {
        this.dir = path.join(__dirname, '../../../tmp_mod')
        let lr = new lineReader(`${this.dir}/${context.file}`,
          {
            encoding: 'utf8',
            skipEmptyLines: true,
            //start: 2
        })
        context.db.getConnection((err, conn) => {
          if(err) logger("Error de Conexion", err); reject(err)
          lr.on('line', line => {
            if(offset == 0){
              //logger("LOGGER", offset)
            }else {

              let preString = line.split(',')
              lr.pause()
              preString.forEach(cadena => {
                preArray.push(`${cadena}`)
              })
              finalArray.push(preArray)
              preArray = []
              lr.resume()
              if(offset == 10){
                lr.pause()
                conn.query(`INSERT INTO ${context.tblname} ( ${context.fieldnms} ) VALUES ?`, [finalArray],
                  err => {
                      if(err) {
                        logger("Error de inserción", err.sqlMessage)
                        reject(err)
                      }else {
                        offset = 0
                        finalArray = []
                        lr.resume()
                      }
                })
              }
            }
            offset = offset + 1
          })

          lr.on('error', e => {
            logger("Error en Lectura", e)
            reject(e)
          })

          lr.on('end', () => {
            //finalArray.push(preArray)
            //logger("Este es el Array", finalArray)
            offset = 0
            context.db.end()
            resolve(context)
          })
        })
      })
    }catch(e){
      logger("Un error general", e)
    }
    return promise
  }
}

export default new CargaData()
