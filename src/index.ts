import app from './App'
import * as bodyParser from 'body-parser'
import dataset from './routes/Dataset'

const port = process.env.PORT || 3000
app.use('/', dataset)

app.listen(port, (err) => {
  if (err){
    return console.log(err)
  }

  return console.log(`Server is running on port ${port}`)
})
