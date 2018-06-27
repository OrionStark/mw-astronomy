const express = require('express');
const app = express();  
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const socketIO = require('socket.io')(server);
const routes = require('./routes/routesandcontrollers');
const cors = require('cors');
const morgan = require('morgan');
const calc = require('calculation-ofsun');
const sun = require('./models/suncalculation');
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));


routes(app);

/* Socket IO Section */

/**
 * Socket namespace for getting the sun data
 */
let sun_data = socketIO.of('/sun');
sun_data.on('connection', (socket) => {
    socket.on('get.sun.informations', (data) => {
        console.log(data.user + " asking for sun's data");
        socket.emit('sunsdata', {
            informations:  sun.sunInformation(new Date(), 3.597031, 98.678513)
        })
    });
});

/**
 * Socket namespace for chatting port
 */
let world_chat = socketIO.of('/chat')
world_chat.on('connection', (socket) => {
    socket.broadcast.emit('newparticipant', { message: "We got a new participant" });
    socket.on('deliver.message', (data) => {
        world_chat.emit('new.message', data);
    });
});

server.listen(process.env.PORT || 4322, () => {
    var port = server.address().port;
    console.log('Server started on ' + port);
});