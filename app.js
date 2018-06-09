const express = require('express');
const app = express();  
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const socketIO = require('socket.io')(server);
const routes = require('./routes/route');
const cors = require('cors');
const morgan = require('morgan');
const calc = require('calculation-ofsun');
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));


routes(app);

server.listen(process.env.PORT || 4322, () => {
    var port = server.address().port;
    console.log('Server started on ' + port);
});