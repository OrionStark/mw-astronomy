const express = require('express');
const app = express();  
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const socketIO = require('socket.io')(server);
const calc = require('calculation-ofsun');

app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 8080, () => {
    var port = server.address().port;
    console.log('Server started on ' + port);
});