import app from './App'
import * as bodyParser from 'body-parser'
import dataset from './routes/Dataset'
import * as cluster from 'cluster'
import * as os from 'os'
import * as http from 'http'
import * as debug from 'debug'
const numCPUs = os.cpus().length
const port = process.env.PORT || 3000

app.use('/', dataset)

if (cluster.isMaster) {
    console.log(`Maestro ${process.pid} esta corriendo`)
    //console.log(numCPUs)
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} murio`)
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    var server = http.createServer(app)

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)

    console.log(`Worker ${process.pid} Iniciado`);
}



/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;

    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
var addr = server.address();
var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
debug('Listening on ' + bind);
}
