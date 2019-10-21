const express = require('express');
const bodyParser = require('body-parser');
// init express app
const app = express();
// parse requests of content type json
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
// middlewares
app.use('/static', express.static(__dirname+'/app/static/'));
// routes
app.get('/', (req, res)=>{
  res.sendFile(__dirname+'/app/views/index.html');
});
// api routes
require('./app/routes/operations.routes.js')(app);
// listen for requests
app.listen(8000, ()=>{
  console.log("Server started at port 8000");
});